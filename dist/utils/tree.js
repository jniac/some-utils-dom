export function isDescendantOf(child, parent) {
    if (!parent) {
        return false;
    }
    let current = child;
    while (current) {
        if (current === parent) {
            return true;
        }
        current = current.parentElement;
    }
    return false;
}
export function isAncestorOf(parent, child) {
    return isDescendantOf(child, parent);
}
