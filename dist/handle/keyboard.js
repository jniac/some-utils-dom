import { applyStringMatcher } from 'some-utils-ts/string/match';
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
    strictTarget: undefined,
};
function modifiersMatch(event, modifiers) {
    const { ctrlKey, altKey, shiftKey, metaKey } = event;
    if (typeof modifiers === 'function') {
        return modifiers({ ctrl: ctrlKey, alt: altKey, shift: shiftKey, meta: metaKey });
    }
    const { ctrl = false, alt = false, shift = false, meta = false } = Object.fromEntries(modifiers.split('-').map(modifier => [modifier, true]));
    return ctrl === ctrlKey && alt === altKey && shift === shiftKey && meta === metaKey;
}
const defaultKeyboardFilter = {
    key: '*',
    keyCaseInsensitive: true,
    code: '*',
    noModifiers: false,
    modifiers: '',
    phase: 'down',
};
function fromKeyboardFilterDeclaration(filter) {
    const result = typeof filter === 'string'
        ? { ...defaultKeyboardFilter, key: filter }
        : { ...defaultKeyboardFilter, ...filter };
    if (result.keyCaseInsensitive && typeof result.key === 'string') {
        result.key = result.key.toLowerCase();
    }
    return result;
}
function solveArgs(args) {
    if (args.length === 1) {
        return [document.body, {}, args[0]];
    }
    if (args.length === 2) {
        return [args[0], {}, args[1]];
    }
    return args;
}
export function handleKeyboard(...args) {
    const [target, options, listeners] = solveArgs(args);
    const { preventDefault } = { ...defaultOptions, ...options };
    let downEvent = null;
    const onKey = (event) => {
        const strictTarget = options.strictTarget ?? target === document.body ? true : false;
        if (strictTarget && event.target !== target) {
            return;
        }
        if (event.type === 'keydown')
            downEvent = event;
        const { ctrlKey, altKey, shiftKey, metaKey } = downEvent; // Always use "downEvent" because "keyup" should not use modifiers.
        const info = {
            event,
            downEvent: downEvent,
            modifiers: { ctrl: ctrlKey, alt: altKey, shift: shiftKey, meta: metaKey },
        };
        for (let i = 0, max = listeners.length; i < max; i++) {
            const [filter, callback] = listeners[i];
            const { key, keyCaseInsensitive, code, noModifiers, modifiers, phase = 'down' } = fromKeyboardFilterDeclaration(filter);
            switch (event.type) {
                case 'keydown':
                    if (phase !== 'down')
                        continue;
                    break;
                case 'keyup':
                    if (phase !== 'up')
                        continue;
                    break;
            }
            const eventKey = keyCaseInsensitive ? event.key.toLowerCase() : event.key;
            const matches = {
                key: applyStringMatcher(eventKey, key),
                code: applyStringMatcher(event.code, code),
                noModifiers: !noModifiers || (ctrlKey === false && altKey === false && shiftKey === false && metaKey === false),
                modifiers: modifiersMatch(downEvent, modifiers),
            };
            const match = Object.values(matches).every(Boolean);
            if (match) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callback(info);
            }
        }
    };
    target.addEventListener('keydown', onKey, { passive: false });
    target.addEventListener('keyup', onKey, { passive: false });
    const destroy = () => {
        target.removeEventListener('keydown', onKey);
        target.removeEventListener('keyup', onKey);
    };
    return { destroy };
}
