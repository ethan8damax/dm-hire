export function clampIndex(index, delta, length) {
  const next = index + delta
  return next < 0 || next >= length ? index : next
}
