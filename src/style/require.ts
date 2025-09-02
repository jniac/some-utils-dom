import { DestroyableObject } from 'some-utils-ts/types'

const usageMap = new Map<string, number>()

function requireElement(id: string) {
  let element = document.querySelector(`head > style#${id}`)
  if (!element) {
    element = document.createElement('style')
    element.id = id
    document.head.appendChild(element)
    usageMap.set(id, 1)
  } else {
    usageMap.set(id, usageMap.get(id)! + 1)
  }
  return element
}

export function requireStyle(id: string, style: string): DestroyableObject {
  const element = requireElement(id)
  element.textContent = style
  const destroy = () => releaseStyle(id)
  return { destroy }
}

export function releaseStyle(id: string) {
  const element = document.querySelector(`head > style#${id}`)
  if (element) {
    usageMap.set(id, usageMap.get(id)! - 1)
    if (usageMap.get(id) === 0) {
      element.remove()
      usageMap.delete(id)
    }
  }
}