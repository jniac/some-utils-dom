export function handleHtmlElementEvent(target, listeners) {
    for (const [type, listener] of Object.entries(listeners)) {
        target.addEventListener(type, listener);
    }
    return {
        destroy() {
            for (const [type, listener] of Object.entries(listeners)) {
                target.removeEventListener(type, listener);
            }
        },
    };
}
