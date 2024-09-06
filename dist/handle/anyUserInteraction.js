export function handleAnyUserInteraction(...args) {
    const [element, callback] = args.length === 1 ? [window, args[0]] : args;
    const onInteraction = () => {
        callback();
    };
    element.addEventListener('mousemove', onInteraction);
    element.addEventListener('mousedown', onInteraction);
    element.addEventListener('mouseup', onInteraction);
    element.addEventListener('touchstart', onInteraction);
    element.addEventListener('touchmove', onInteraction);
    element.addEventListener('wheel', onInteraction);
    element.addEventListener('keydown', onInteraction);
    element.addEventListener('keyup', onInteraction);
    window.addEventListener('resize', onInteraction);
    const destroy = () => {
        element.removeEventListener('mousemove', onInteraction);
        element.removeEventListener('mousedown', onInteraction);
        element.removeEventListener('mouseup', onInteraction);
        element.removeEventListener('touchstart', onInteraction);
        element.removeEventListener('touchmove', onInteraction);
        element.removeEventListener('wheel', onInteraction);
        element.removeEventListener('keydown', onInteraction);
        element.removeEventListener('keyup', onInteraction);
        window.removeEventListener('resize', onInteraction);
    };
    return { destroy };
}
