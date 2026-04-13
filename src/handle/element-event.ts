import { DestroyableObject } from 'some-utils-ts/types'

/**
 * Usage: 
 * ```ts
 * yield handleElementEvent(document.documentElement, {
 *   fullscreenchange: () => {
 *     if (document.fullscreenElement) {
 *       div.style.setProperty('display', 'none')
 *     } else {
 *       div.style.removeProperty('display')
 *     }
 *   },
 * })
 * ```
 */
function handleElementEvent(target: HTMLElement, listeners: Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>): DestroyableObject {
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

/**
 * @deprecated use `handleElementEvent` instead
 */
const handleHtmlElementEvent = handleElementEvent

export {
  handleElementEvent,
  handleHtmlElementEvent
}

