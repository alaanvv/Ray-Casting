// Debug tools
const DRAW_PLAYER_ANGLE = 0
const DRAW_PLAYER_FOV = 0
const DRAW_VERTICAL_TRIANGLES = 0
const DRAW_HORIZONTAL_TRIANGLES = 0
const DRAW_HIT_LINE = 1
const COLOR = {
  player: '#0F0',
  wall_2d: '#FFF',
  floor_2d: '#202020',

  angle: '#F00',
  triangle_cathetus: '#0F0',
  triangle_hypotenuse: '#00F',
  hit_line: '#FF0',

  sky_3d: '#00C',
  floor_3d: '#111'
}
const ANGLE_RENDER_DISTANCE = 20

const PI = Math.PI
const OFFSET_2D = 0
const OFFSET_3D = canvas.width / 2
const FOV = 1.74533 // 100 degrees
const VIEW_DENSITY = FOV / 50
const FIX_FISHEYE = 0

const CELL_SIZE = 10
const MAX_DISTANCE = 10
const MAX_WALL_HEIGHT = canvas.height - 2

// ---

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

const p = {
  x: 40,
  y: 50,
  a: 0
}

// ---

function render2DMap() {
  for (let y in map) {
    const row = map[y]

    for (let x in row) {
      const cell = row[x]

      if (cell === 1)
        rect(OFFSET_2D + x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 1, CELL_SIZE - 1, COLOR.wall_2d)
      else if (cell === 0)
        rect(OFFSET_2D + x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 1, CELL_SIZE - 1, COLOR.floor_2d)
    }
  }
}

function renderPlayer() {
  rect(OFFSET_2D + p.x - 1, p.y - 1, 3, 3, 'green')
}

function renderAngle(angle) {
  const target_x = Math.round(p.x + Math.cos(angle) * ANGLE_RENDER_DISTANCE)
  const target_y = Math.round(p.y - Math.sin(angle) * ANGLE_RENDER_DISTANCE)

  line(OFFSET_2D + p.x, p.y, OFFSET_2D + target_x, target_y, COLOR.angle)
}

function render2D() {
  render2DMap()
  if (DRAW_PLAYER_ANGLE) renderAngle(p.a)
  renderPlayer()
}

function render3D() {
  rect(OFFSET_3D, 0, 100, MAX_WALL_HEIGHT / 2, COLOR.sky_3d)
  rect(OFFSET_3D, MAX_WALL_HEIGHT / 2, 100, MAX_WALL_HEIGHT / 2, COLOR.floor_3d)

  const wall_width = (canvas.width / 2 - 1) / (FOV / VIEW_DENSITY)

  for (let i = 0; i < FOV; i += VIEW_DENSITY) {
    let angle = p.a + FOV / 2 - i
    angle -= 0.5 * VIEW_DENSITY % FOV // Center
    angle = angle % (2 * PI)
    if (angle < 0) angle += 2 * PI

    if (DRAW_PLAYER_FOV) {
      renderAngle(angle)
      renderPlayer()
    }

    const next_wall = getNextWall(angle)
    if (!next_wall) continue

    const distance = next_wall.distance || MAX_DISTANCE * CELL_SIZE
    const wall_height = MAX_WALL_HEIGHT - (MAX_WALL_HEIGHT * distance) / (MAX_DISTANCE * CELL_SIZE)

    const wall_color_intensity = 230 - (230 * distance) / (MAX_DISTANCE * CELL_SIZE)
    let wall_color
    switch (next_wall.side) {
      case 0:
        wall_color = `rgb(${wall_color_intensity}, ${wall_color_intensity}, 0)`    
        break
      case 1:
        wall_color = `rgb(0, rgb(${wall_color_intensity}, ${wall_color_intensity})`    
        break
    }
    
    rect(OFFSET_3D + wall_width * i / VIEW_DENSITY, (canvas.height - wall_height) / 2, wall_width, wall_height, wall_color)
  }
}

function render() {
  clear()
  render2D()
  render3D()
}

// ---

function getNextWall(angle) {
  p_x_in_cell = p.x % CELL_SIZE
  p_y_in_cell = p.y % CELL_SIZE
  
  let closest_wall_distance = Infinity
  let side
  let hit_point
  
  // Vertical-left
  if (angle > 0.5 * PI && angle < 1.5 * PI) {
    for (let i = 0; i < MAX_DISTANCE; i++) {
      x_distance = p_x_in_cell + CELL_SIZE * i
      y_distance = Math.round(Math.abs(x_distance * Math.tan(angle)) * (angle < PI ? 1 : -1))
  
      hit_cell_x = p.x - x_distance
      hit_cell_y = p.y - y_distance
  
      cell_x = hit_cell_x / CELL_SIZE - 1
      cell_y = Math.trunc(hit_cell_y / CELL_SIZE)
  
      if (DRAW_VERTICAL_TRIANGLES) {
        line(p.x, p.y, p.x - x_distance, p.y, 'green')
        line(p.x - x_distance, p.y, p.x - x_distance, p.y - y_distance, 'green')
        line(p.x, p.y, hit_cell_x, hit_cell_y, 'blue')
      }
  
      if (map[cell_y] !== undefined && map[cell_y][cell_x] === 1 && map[cell_y][cell_x + 1] === 0) {
        distance = Math.sqrt(x_distance ** 2 + y_distance ** 2)
        if (distance < MAX_DISTANCE * CELL_SIZE && closest_wall_distance > distance) {
          closest_wall_distance = distance
          hit_point = [hit_cell_x, hit_cell_y]
          side = 0
        }
        break
      }
    }
  }
  // Vertical-right
  else if (angle < 0.5 * PI || angle > 1.5 * PI) {
    for (let i = 0; i < MAX_DISTANCE; i++) {
      x_distance = CELL_SIZE - p_x_in_cell + CELL_SIZE * i
      y_distance = Math.round(Math.abs(x_distance * Math.tan(angle)) * (angle < PI ? 1 : -1))
  
      hit_cell_x = p.x + x_distance
      hit_cell_y = p.y - y_distance
  
      cell_x = hit_cell_x / CELL_SIZE
      cell_y = Math.trunc(hit_cell_y / CELL_SIZE)
  
      if (DRAW_VERTICAL_TRIANGLES) {
        line(p.x, p.y, p.x + x_distance, p.y, 'green')
        line(p.x + x_distance, p.y, p.x + x_distance, p.y - y_distance, 'green')
        line(p.x, p.y, hit_cell_x, hit_cell_y, 'blue')
      }
  
      if (map[cell_y] !== undefined && map[cell_y][cell_x] === 1 && map[cell_y][cell_x - 1] === 0) {
        distance = Math.sqrt(x_distance ** 2 + y_distance ** 2)
        if (distance < MAX_DISTANCE * CELL_SIZE && closest_wall_distance > distance) {
          closest_wall_distance = distance
          hit_point = [hit_cell_x, hit_cell_y]
          side = 0
        }
        break
      }
    }
  }
  
  // Horizontal-up
  if (angle > 0 && angle < PI) {
    for (let i = 0; i < MAX_DISTANCE; i++) {
      y_distance = p_y_in_cell + CELL_SIZE * i
      x_distance = Math.round(Math.abs(y_distance * 1 / Math.tan(angle)) * (angle > 0.5 * PI ? 1 : -1))
  
      hit_cell_x = p.x - x_distance
      hit_cell_y = p.y - y_distance
  
      cell_x = Math.trunc(hit_cell_x / CELL_SIZE)
      cell_y = hit_cell_y / CELL_SIZE - 1
  
      if (DRAW_HORIZONTAL_TRIANGLES) {
        line(p.x, p.y, p.x, p.y - y_distance, 'green')
        line(p.x, p.y - y_distance, p.x - x_distance, p.y - y_distance, 'green')
        line(p.x, p.y, hit_cell_x, hit_cell_y, 'blue')
      }
  
      if (map[cell_y] !== undefined && map[cell_y][cell_x] === 1 && map[cell_y + 1][cell_x] === 0) {
        distance = Math.sqrt(x_distance ** 2 + y_distance ** 2)
        if (distance < MAX_DISTANCE * CELL_SIZE && closest_wall_distance > distance) {
          closest_wall_distance = distance
          hit_point = [hit_cell_x, hit_cell_y]
          side = 1
        }
        break
      }
    }
  }
  // Horizontal-down
  else if (angle > PI) {
    for (let i = 0; i < MAX_DISTANCE; i++) {
      y_distance = CELL_SIZE - p_y_in_cell + CELL_SIZE * i
      x_distance = Math.round(Math.abs(y_distance * 1 / Math.tan(angle)) * (angle < 1.5 * PI ? 1 : -1))
  
      hit_cell_x = p.x - x_distance
      hit_cell_y = p.y + y_distance
  
      cell_x = Math.trunc(hit_cell_x / CELL_SIZE)
      cell_y = hit_cell_y / CELL_SIZE
  
      if (DRAW_HORIZONTAL_TRIANGLES) {
        line(p.x, p.y, p.x, p.y + y_distance, 'green')
        line(p.x, p.y + y_distance, p.x - x_distance, p.y + y_distance, 'green')
        line(p.x, p.y, hit_cell_x, hit_cell_y, 'blue')
      }
  
      if (map[cell_y] !== undefined && map[cell_y][cell_x] === 1 && map[cell_y - 1][cell_x] === 0) {
        distance = Math.sqrt(x_distance ** 2 + y_distance ** 2)
        if (distance < MAX_DISTANCE * CELL_SIZE && closest_wall_distance > distance) {
          closest_wall_distance = distance
          hit_point = [hit_cell_x, hit_cell_y]
          side = 1
        }
        break
      }
    }
  }
  
  if (DRAW_HIT_LINE && hit_point) {
    line(p.x, p.y, hit_point[0], hit_point[1], COLOR.hit_line)
    renderPlayer()
  }
  if (closest_wall_distance !== Infinity) {
    if (FIX_FISHEYE) closest_wall_distance *= Math.cos(angle)
    return { distance: closest_wall_distance, side }
  }
}
// ---

window.addEventListener('keydown', e => {
  const position_lock = [p.x, p.y]

  switch (e.key) {
    case 'ArrowUp':
      p.y--
      break
    case 'ArrowDown':
      p.y++
      break
    case 'ArrowLeft':
      p.x--
      break
    case 'ArrowRight':
      p.x++
      break
    default: return
  }

  if (map[Math.floor((p.y - 2) / CELL_SIZE)][Math.floor(p.x / CELL_SIZE)] || map[Math.floor((p.y + 1) / CELL_SIZE)][Math.floor(p.x / CELL_SIZE)] ||
    map[Math.floor(p.y / CELL_SIZE)][Math.floor((p.x - 2) / CELL_SIZE)] || map[Math.floor(p.y / CELL_SIZE)][Math.floor((p.x + 1) / CELL_SIZE)]) {
    p.x = position_lock[0]
    p.y = position_lock[1]
    return
  }

  render()
})

window.addEventListener('mousemove', e => {
  const canvas_rect = canvas.getBoundingClientRect()

  const player_abs = {
    x: OFFSET_2D + canvas_rect.x + p.x * canvas_rect.width / canvas.width,
    y: OFFSET_2D + canvas_rect.y + p.y * canvas_rect.height / canvas.height
  }

  const cursor = {
    x: e.clientX,
    y: e.clientY
  }

  const distance = {
    x: Math.abs(player_abs.x - cursor.x),
    y: Math.abs(player_abs.y - cursor.y)
  }

  p.a = Math.atan(distance.y / distance.x)
  if (cursor.x < player_abs.x) p.a = PI - p.a
  if (cursor.y > player_abs.y) p.a = 2 * PI - p.a

  render()
})

// ---

render()