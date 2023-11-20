
const canvas = document.querySelector('canvas')
canvas.width = 100
canvas.height = 100
const ctx = canvas.getContext('2d')

// ---

function getPointsInLine(v1, v2) {
  // Reminder: check Bresenham's Line Algorithm
  const points = []

  const x1 = Math.round(v1[0])
  const y1 = Math.round(v1[1])
  const x2 = Math.round(v2[0])
  const y2 = Math.round(v2[1])

  const x_size = Math.abs(x1 - x2) + 1
  const y_size = Math.abs(y1 - y2) + 1

  const x_step = Math.sign(x2 - x1)
  const y_step = Math.sign(y2 - y1)

  const x_per_y = x_size / y_size
  const y_per_x = 1 / x_per_y

  if (x_per_y > 1)
    for (let x = x1; x !== x2; x += x_step)
      points.push([x, y1 + Math.round(Math.trunc(Math.abs(x - x1) / x_per_y) * y_step)])

  else
    for (let y = y1; y !== y2; y += y_step)
      points.push([x1 + Math.round(Math.trunc(Math.abs(y - y1) / y_per_x) * x_step), y])

  points.push([x2, y2])

  return points
}

function dot(x, y, c) {
  if (isNaN(x) || x === Infinity || typeof x !== 'number') throw `Invalid "x" value in "dot" function: ${x} ${typeof x}`
  if (isNaN(y) || y === Infinity || typeof y !== 'number') throw `Invalid "y" value in "dot" function: ${y} ${typeof y}`

  x = Math.round(x)
  y = Math.round(y)

  ctx.fillStyle = c
  ctx.fillRect(x, y, 1, 1)
}

function line(x1, y1, x2, y2, c) {
  if (isNaN(x1) || x1 === Infinity || typeof x1 !== 'number') throw `Invalid "x1" value in "line" function: ${x1} ${typeof x1}`
  if (isNaN(y1) || y1 === Infinity || typeof y1 !== 'number') throw `Invalid "y1" value in "line" function: ${y1} ${typeof y1}`
  if (isNaN(x2) || x2 === Infinity || typeof x2 !== 'number') throw `Invalid "x2" value in "line" function: ${x2} ${typeof x2}`
  if (isNaN(y2) || y2 === Infinity || typeof y2 !== 'number') throw `Invalid "y2" value in "line" function: ${y2} ${typeof y2}`

  const points = getPointsInLine([x1, y1], [x2, y2])
  points.map(point => dot(point[0], point[1], c))
}

function rect(x, y, w, h, c) {
  if (isNaN(x) || x === Infinity || typeof x !== 'number') throw `Invalid "x" value in "rect" function: ${x} ${typeof x}`
  if (isNaN(y) || y === Infinity || typeof y !== 'number') throw `Invalid "y" value in "rect" function: ${y} ${typeof y}`
  if (w === 0 || h === 0) return

  for (let current_x = x; current_x - x < w; current_x++)
    line(current_x, y, current_x, y + h - 1, c)
}

function polygon(vertices, c, force_fill = 0) {
  const original_vertices = vertices

  if (vertices.length <= 2) throw 'Invalid vertices array'
  vertices.map((vertice, i) => {
    if (isNaN(vertice[0]) || vertice[0] === Infinity || typeof vertice[0] !== 'number') throw `Invalid "x" at coordinate "${i + 1}" value in "polygon" function: ${vertice[0]} ${typeof vertice[0]}`
    if (isNaN(vertice[1]) || vertice[1] === Infinity || typeof vertice[1] !== 'number') throw `Invalid "y" at coordinate "${i + 1}" value in "polygon" function: ${vertice[1]} ${typeof vertice[1]}`
  })

  const first_vertice = vertices[0]
  const second_vertice = vertices[1]
  const last_vertice = vertices[vertices.length - 1]
  vertices = vertices.slice(1) // Will not be used anymore, since we are going to manually connect him

  // Creates lines connecting first to second and first to last vertice
  line(first_vertice[0], first_vertice[1], second_vertice[0], second_vertice[1], c)
  line(first_vertice[0], first_vertice[1], last_vertice[0], last_vertice[1], c)

  // Now, connect the first vertice to all others, also filling the insides
  const lines = []
  for (let i in vertices) {
    i = Number(i)
    if (!vertices[i + 1]) continue

    lines.push([vertices[i], vertices[i + 1]])
  }

  let points = []
  for (let [v1, v2] of lines) {
    points = points.concat(getPointsInLine(v1, v2))
  }

  points.map(point => line(first_vertice[0], first_vertice[1], point[0], point[1], c))

  if (force_fill) {
    let v = original_vertices
    e = v.shift()
    v.push(e)
    polygon(v, c)
    e = v.shift()
    v.push(e)
    polygon(v, c)
  }
}

function clear() {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}