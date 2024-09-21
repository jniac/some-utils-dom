import { applyStringMatcher } from 'some-utils-ts/string/match'
import { DestroyableObject, StringMatcher } from 'some-utils-ts/types'

type Info = {
  event: KeyboardEvent
  modifiers: {
    ctrl: boolean
    alt: boolean
    shift: boolean
    meta: boolean
  }
}

const defaultOptions = {
  preventDefault: false,
  /**
   * If `true`, the event target must be the same as the target element.
   * 
   * Useful to avoid triggering the listener when the user is typing in an input.
   */
  strictTarget: false,
}

type Options = Partial<typeof defaultOptions>

type Modifier = 'ctrl' | 'alt' | 'shift' | 'meta'
type Combination<T extends string, U extends string = T> =
  T extends any
  ? T | `${T}+${Combination<Exclude<U, T>>}`
  : never
type Modifiers =
  | ''
  | Combination<Modifier>
  | ((modifiers: { ctrl: boolean, alt: boolean, shift: boolean, meta: boolean }) => boolean)

function modifiersMatch(event: KeyboardEvent, modifiers: Modifiers): boolean {
  const { ctrlKey, altKey, shiftKey, metaKey } = event
  if (typeof modifiers === 'function') {
    return modifiers({ ctrl: ctrlKey, alt: altKey, shift: shiftKey, meta: metaKey })
  }
  const { ctrl = false, alt = false, shift = false, meta = false } = Object.fromEntries(modifiers.split('-').map(modifier => [modifier, true]))
  return ctrl === ctrlKey && alt === altKey && shift === shiftKey && meta === metaKey
}

const defaultKeyboardFilter = {
  key: '*' as StringMatcher,
  keyCaseInsensitive: true,
  code: '*' as StringMatcher,
  noModifiers: false,
  modifiers: '' as Modifiers,
}

type KeyboardFilter = typeof defaultKeyboardFilter

type KeyboardFilterDeclaration =
  | StringMatcher
  | Partial<KeyboardFilter>

function solveKeyboardFilter(filter: KeyboardFilterDeclaration): KeyboardFilter {
  const result: KeyboardFilter = typeof filter === 'string'
    ? { ...defaultKeyboardFilter, key: filter }
    : { ...defaultKeyboardFilter, ...filter }
  if (result.keyCaseInsensitive && typeof result.key === 'string') {
    result.key = result.key.toLowerCase()
  }
  return result
}

type KeyboardListenerEntry = [
  filter: KeyboardFilterDeclaration,
  callback: (info: Info) => void,
]

function solveArgs(args: any[]): [HTMLElement, Options, KeyboardListenerEntry[]] {
  if (args.length === 1) {
    return [document.body, {}, args[0]]
  }
  if (args.length === 2) {
    return [args[0], {}, args[1]]
  }
  return args as any
}

/**
 * Reminder: 
 * - KeyboardEvent.code:
 *   - eg: "KeyS" 
 *   - is the physical key value of the key represented by the event.
 *   - layout-independent.
 * - KeyboardEvent.key:
 *   - eg: "s" 
 *   - is the key value of the key represented by the event.
 *   - Could be upper case if the key is a letter.
 * 
 * Usage:
 * ```
 * handleKeyboard([
 *   // Ctrl + Z
 *   [{ key: 'z', modifiers: m => !m.shift && (m.ctrl || m.meta) }, info => {
 *     info.event.preventDefault()
 *     history.undo()
 *   }],
 *   // Ctrl + Shift + Z
 *   [{ key: 'z', modifiers: m => m.shift && (m.ctrl || m.meta) }, info => {
 *     info.event.preventDefault()
 *     history.redo()
 *   }],
 * ])
 * ```
 * Or:
 * ```
 * handleKeyboard([
 *   [{ key: 'z', modifiers: m => m.ctrl || m.meta }, info => {
 *     info.event.preventDefault()
 *     if (info.modifiers.shift) {
 *       editor.history.redo()
 *     } else {
 *       editor.history.undo()
 *     }
 *   }],
 * ])
 * ```
 */
export function handleKeyboard(listeners: KeyboardListenerEntry[]): DestroyableObject
export function handleKeyboard(target: HTMLElement, listeners: KeyboardListenerEntry[]): DestroyableObject
export function handleKeyboard(target: HTMLElement, options: Options, listeners: KeyboardListenerEntry[]): DestroyableObject
export function handleKeyboard(...args: any[]): DestroyableObject {
  const [target, options, listeners] = solveArgs(args)
  const { preventDefault } = { ...defaultOptions, ...options }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (options.strictTarget && event.target !== target) {
      return
    }

    const { ctrlKey, altKey, shiftKey, metaKey } = event
    const info: Info = {
      event,
      modifiers: { ctrl: ctrlKey, alt: altKey, shift: shiftKey, meta: metaKey },
    }

    for (let i = 0, max = listeners.length; i < max; i++) {
      const [filter, callback] = listeners[i]
      const { key, keyCaseInsensitive, code, noModifiers, modifiers } = solveKeyboardFilter(filter)

      const eventKey = keyCaseInsensitive ? event.key.toLowerCase() : event.key
      const matches = {
        key: applyStringMatcher(eventKey, key),
        code: applyStringMatcher(event.code, code),
        noModifiers: !noModifiers || (ctrlKey === false && altKey === false && shiftKey === false && metaKey === false),
        modifiers: !modifiers || modifiersMatch(event, modifiers),
      }

      const match = Object.values(matches).every(Boolean)
      if (match) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback(info)
      }
    }
  }

  target.addEventListener('keydown', onKeyDown, { passive: false })

  const destroy = () => {
    target.removeEventListener('keydown', onKeyDown)
  }

  return { destroy }
}