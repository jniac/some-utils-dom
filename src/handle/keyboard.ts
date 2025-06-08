import { applyStringMatcher } from 'some-utils-ts/string/match'
import { DestroyableObject, StringMatcher } from 'some-utils-ts/types'

type Info = {
  id: number
  event: KeyboardEvent
  downEvent: KeyboardEvent | null
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
   * 
   * By default, it is `true` if the target is omitted or is `document.body`, 
   * `false` otherwise.
   */
  strictTarget: undefined as boolean | undefined,
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
  /**
   * eg: "s" or "S"
   * 
   * If `keyCaseInsensitive` is `true`, it will be converted to lower case.
   */
  key: '*' as StringMatcher,
  /**
   * If `true`, the key will be converted to lower case.
   */
  keyCaseInsensitive: true,
  /**
   * eg: "KeyS", "Space" or "Enter"
   */
  code: '*' as StringMatcher,
  /**
   * If `true`, the event will match only if no modifiers are pressed.
   */
  noModifiers: false,
  /**
   * eg: "ctrl", "alt", "shift", "meta", "ctrl+shift", "alt+meta", etc.
   */
  modifiers: '' as Modifiers,
  /**
   * The phase of the event to match.
   * 
   * - 'down': matches on `keydown` events.
   * - 'up': matches on `keyup` events.
   */
  phase: 'down' as 'down' | 'up',
}

type KeyboardFilter = typeof defaultKeyboardFilter

type KeyboardFilterDeclaration =
  | StringMatcher
  | Partial<KeyboardFilter>

function fromKeyboardFilterDeclaration(filter: KeyboardFilterDeclaration): KeyboardFilter {
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

let nextId = 0

/**
 * Reminder: 
 * - KeyboardEvent.code:
 *   - eg: "KeyS", "Space" or "Enter"
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
  const id = nextId++
  const [target, options, listeners] = solveArgs(args)
  const { preventDefault } = { ...defaultOptions, ...options }
  let downEvent: KeyboardEvent | null = null
  const onKey = (event: KeyboardEvent): void => {
    const strictTarget = options.strictTarget ?? target === document.body ? true : false
    if (strictTarget && event.target !== target) {
      return
    }

    if (event.type === 'keydown')
      downEvent = event

    const { ctrlKey = false, altKey = false, shiftKey = false, metaKey = false } = downEvent ?? {} // Always use "downEvent" because "keyup" should not use modifiers.
    const info: Info = {
      id,
      event,
      downEvent,
      modifiers: { ctrl: ctrlKey, alt: altKey, shift: shiftKey, meta: metaKey },
    }

    for (let i = 0, max = listeners.length; i < max; i++) {
      const [filter, callback] = listeners[i]
      const { key, keyCaseInsensitive, code, noModifiers, modifiers, phase = 'down' } = fromKeyboardFilterDeclaration(filter)

      switch (event.type) {
        case 'keydown':
          if (phase !== 'down')
            continue
          break
        case 'keyup':
          if (phase !== 'up')
            continue
          break
      }

      const eventKey = keyCaseInsensitive ? event.key.toLowerCase() : event.key
      const matches = {
        key: applyStringMatcher(eventKey, key),
        code: applyStringMatcher(event.code, code),
        noModifiers: !noModifiers || (ctrlKey === false && altKey === false && shiftKey === false && metaKey === false),
        modifiers: modifiersMatch(downEvent!, modifiers),
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

  target.addEventListener('keydown', onKey, { passive: false })
  target.addEventListener('keyup', onKey, { passive: false })

  const destroy = () => {
    target.removeEventListener('keydown', onKey)
    target.removeEventListener('keyup', onKey)
  }

  return { destroy }
}