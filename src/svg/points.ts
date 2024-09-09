export function regularPolygon({
  cx = 0,
  cy = 0,
  r = 1,
  count = 3,
  turnOffset = 0,
} = {}) {
  const points = [] as string[]
  for (let i = 0; i < count; i++) {
    const angle = (i / count + turnOffset) * Math.PI * 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    points.push(`${x.toFixed(3)},${y.toFixed(3)}`)
  }
  return points.join(' ')
}
