import { DestroyableObject } from 'some-utils-ts/types'

export function handleHtmlElementEvent(target: HTMLElement, listeners: Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>): DestroyableObject {
  for (const [type, listener] of Object.entries(listeners)) {
    target.addEventListener(type, listener)
  }

  return {
    destroy() {
      for (const [type, listener] of Object.entries(listeners)) {
        target.removeEventListener(type, listener)
      }
    },
  }
}
