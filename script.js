
const canvas = document.querySelector('canvas')
canvas.width = 202
canvas.height = 101
const ctx = canvas.getContext('2d')

// ---

function dot(x, y, c) {
  if (isNaN(x) || isNaN(y)) return console.log('Something is NaN')
   
  ctx.fillStyle = c
  ctx.fillRect(x, y, 1, 1)
}

function line(x1, y1, x2, y2, c) {
  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return console.log('Something is NaN')
  x1 = Math.round(x1)
  y1 = Math.round(y1)
  x2 = Math.round(x2)
  y2 = Math.round(y2)

  // Reminder: check Bresenham's Line Algorithm
  const x_size = Math.abs(x1 - x2) + 1
  const y_size = Math.abs(y1 - y2) + 1

  const x_step = Math.sign(x2 - x1)
  const y_step = Math.sign(y2 - y1)

  const x_per_y = x_size / y_size
  const y_per_x = 1 / x_per_y

  if (x_per_y > 1) {
    for (let x = x1; x !== x2; x += x_step) {
      const current_x_size = Math.abs(x - x1)
      dot(x, y1 + Math.round(Math.trunc(current_x_size / x_per_y) * y_step), c)
    }

    dot(x2, y2, c) // It will not be placed automatically because of the way I did the for condition
  }
  else {
    for (let y = y1; y !== y2; y += y_step) {
      const current_y_size = Math.abs(y - y1)
      dot(x1 + Math.round(Math.trunc(current_y_size / y_per_x) * x_step), y, c)
    }

    dot(x2, y2, c)
  }
}

function rect(x, y, w, h, c) {
  if (w === 0 || h === 0) return
  if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) return console.log('Something is NaN')

  for (let current_x = x; current_x - x < w; current_x++)
    line(current_x, y, current_x, y + h - 1, c)
}

function clear() {
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}