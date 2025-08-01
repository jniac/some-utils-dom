import { DestroyableObject, StringMatcher } from 'some-utils-ts/types';
type Info = {
    id: number;
    event: KeyboardEvent;
    downEvent: KeyboardEvent | null;
    modifiers: {
        ctrl: boolean;
        alt: boolean;
        shift: boolean;
        meta: boolean;
    };
};
declare const defaultOptions: {
    preventDefault: boolean;
    /**
     * If `true`, the event target must be the same as the target element.
     *
     * Useful to avoid triggering the listener when the user is typing in an input.
     *
     * By default, it is `true` if the target is omitted or is `document.body`,
     * `false` otherwise.
     */
    strictTarget: boolean | undefined;
};
type Options = Partial<typeof defaultOptions>;
type Modifier = 'ctrl' | 'alt' | 'shift' | 'meta';
type Combination<T extends string, U extends string = T> = T extends any ? T | `${T}+${Combination<Exclude<U, T>>}` : never;
type Modifiers = '' | Combination<Modifier> | ((modifiers: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
}) => boolean);
declare const defaultKeyboardFilter: {
    /**
     * eg: "s" or "S"
     *
     * If `keyCaseInsensitive` is `true`, it will be converted to lower case.
     */
    key: StringMatcher;
    /**
     * If `true`, the key will be converted to lower case.
     */
    keyCaseInsensitive: boolean;
    /**
     * eg: "KeyS", "Space" or "Enter"
     */
    code: StringMatcher;
    /**
     * If `true`, the event will match only if no modifiers are pressed.
     */
    noModifiers: boolean;
    /**
     * eg: "ctrl", "alt", "shift", "meta", "ctrl+shift", "alt+meta", etc.
     */
    modifiers: Modifiers;
    /**
     * The phase of the event to match.
     *
     * - 'down': matches on `keydown` events.
     * - 'up': matches on `keyup` events.
     */
    phase: "down" | "up";
};
type KeyboardFilter = typeof defaultKeyboardFilter;
type KeyboardFilterDeclaration = StringMatcher | Partial<KeyboardFilter>;
type KeyboardListenerEntry = [
    filter: KeyboardFilterDeclaration,
    callback: (info: Info) => void
];
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
export declare function handleKeyboard(listeners: KeyboardListenerEntry[]): DestroyableObject;
export declare function handleKeyboard(target: HTMLElement, listeners: KeyboardListenerEntry[]): DestroyableObject;
export declare function handleKeyboard(target: HTMLElement, options: Options, listeners: KeyboardListenerEntry[]): DestroyableObject;
export {};
