const usageMap = new Map();
function requireElement(id) {
    let element = document.querySelector(`head > style#${id}`);
    if (!element) {
        element = document.createElement('style');
        element.id = id;
        document.head.appendChild(element);
        usageMap.set(id, 1);
    }
    else {
        usageMap.set(id, usageMap.get(id) + 1);
    }
    return element;
}
export function requireStyle(id, style) {
    const element = requireElement(id);
    element.textContent = style;
    const destroy = () => releaseStyle(id);
    return { destroy };
}
export function releaseStyle(id) {
    const element = document.querySelector(`head > style#${id}`);
    if (element) {
        usageMap.set(id, usageMap.get(id) - 1);
        if (usageMap.get(id) === 0) {
            element.remove();
            usageMap.delete(id);
        }
    }
}
