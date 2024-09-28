export function isDescendantOf(child: Element | null, parent: Element | null): boolean {
  if (!parent) {
    return false
  }
  let current = child
  while (current) {
    if (current === parent) {
      return true
    }
    current = current.parentElement
  }
  return false
}

export function isAncestorOf(parent: Element | null, child: any): boolean {
  return isDescendantOf(child, parent)
}