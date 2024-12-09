import { DestroyableObject } from 'some-utils-ts/types'

/**
 * A very generic utility to handle any user interaction, useful to prevent inactivity.
 * 
 * NOTE: The listener is passive, meaning it won't prevent the default behavior 
 * of the events. If the default behavior of the events should be prevented, this 
 * should be done elsewhere.
 */
export function handleAnyUserInteraction(callback: () => void): DestroyableObject
export function handleAnyUserInteraction(element: HTMLElement | Window, callback: () => void): DestroyableObject
export function handleAnyUserInteraction(...args: any[]): DestroyableObject {
  const [element, callback] = args.length === 1 ? [window, args[0]] : args
  const onInteraction = () => {
    callback()
  }
  element.addEventListener('mousemove', onInteraction, { passive: true })
  element.addEventListener('mousedown', onInteraction, { passive: true })
  element.addEventListener('mouseup', onInteraction, { passive: true })
  element.addEventListener('touchstart', onInteraction, { passive: true })
  element.addEventListener('touchmove', onInteraction, { passive: true })
  element.addEventListener('wheel', onInteraction, { passive: true })
  element.addEventListener('keydown', onInteraction, { passive: true })
  element.addEventListener('keyup', onInteraction, { passive: true })
  window.addEventListener('resize', onInteraction, { passive: true })
  const destroy = () => {
    element.removeEventListener('mousemove', onInteraction)
    element.removeEventListener('mousedown', onInteraction)
    element.removeEventListener('mouseup', onInteraction)
    element.removeEventListener('touchstart', onInteraction)
    element.removeEventListener('touchmove', onInteraction)
    element.removeEventListener('wheel', onInteraction)
    element.removeEventListener('keydown', onInteraction)
    element.removeEventListener('keyup', onInteraction)
    window.removeEventListener('resize', onInteraction)
  }
  return { destroy }
}