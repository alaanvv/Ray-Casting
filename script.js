const { PI, cos, sin, tan, sqrt, trunc, round, abs } = Math

const FOV = PI * 0.8
const VIEW_FRAGMENTS = 100
const VIEW_DENSITY = FOV / VIEW_FRAGMENTS
const FRAGMENT_WIDTH = canvas.width / VIEW_FRAGMENTS
const FIX_FISHEYE = 1

const MAX_DISTANCE = 29
const MAX_WALL_HEIGHT = canvas.height

const ANGLE_STEP = PI / 10
const MOVE_STEP = 1.49 // More than that may cause teleport trough walls

// ---

const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

const p = { x: 10, y: 10, a: PI * 0 }

// ---

function debug() {
  document.querySelector('.x').innerText = p.x
  document.querySelector('.y').innerText = p.y
  document.querySelector('.a-rad').innerText = p.a.toFixed(2)
  document.querySelector('.a-deg').innerText = (p.a / PI * 180).toFixed(2)
}

function render() {
  clear()
  debug()

  for (let i = 0; i < VIEW_FRAGMENTS; i++) {
    const angle_offset = VIEW_DENSITY * i
    const angle = p.a + FOV / 2 + VIEW_DENSITY / 2 - angle_offset
    
    const d = getDistance(angle) * (FIX_FISHEYE ? abs(cos(angle - p.a)) : 1)
    
    const wall_height = (1 - d / MAX_DISTANCE) * MAX_WALL_HEIGHT
    const wall_brightness = (1 - d / MAX_DISTANCE) * 100

    rect(FRAGMENT_WIDTH * i, (canvas.height - wall_height) / 2, FRAGMENT_WIDTH, wall_height, `rgb(${wall_brightness}, ${wall_brightness}, ${wall_brightness})`)
  }
}

function getDistance(angle) {
  let distance = 1

  while (distance <= MAX_DISTANCE) {
    dx = trunc(cos(angle) * distance)
    dy = trunc(sin(angle) * distance) * -1

    wx = p.x + dx
    wy = p.y + dy

    if (map[wy][wx]) return sqrt(dx ** 2 + dy ** 2)

    distance++
  }
}

// ---

window.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return

  const lock_pos = { x: p.x, y: p.y }
  
  switch (e.key) {
    case 'ArrowLeft':
      p.a += ANGLE_STEP
      break
    case 'ArrowRight':
      p.a -= ANGLE_STEP
      break
    case 'ArrowUp':
      p.x += cos(p.a) * MOVE_STEP
      p.y -= sin(p.a) * MOVE_STEP
      break
    case 'ArrowDown':
      p.x -= cos(p.a) * MOVE_STEP
      p.y += sin(p.a) * MOVE_STEP
      break
  }

  p.a %= 2 * PI
  if (p.a < 0) p.a += 2 * PI

  p.x = round(p.x)
  p.y = round(p.y)

  if (map[p.y][p.x]) {
    p.x = lock_pos.x
    p.y = lock_pos.y
  }

  render()
})

// ---

render()