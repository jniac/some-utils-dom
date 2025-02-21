const defaultParams = {};
const callbackNames = [
    'onFocusEnter',
    'onFocusLeave',
];
function hasFocusCallback(params) {
    return callbackNames.some(name => name in params);
}
function handleFocus(element, params) {
    const { onFocusEnter, onFocusLeave, } = { ...defaultParams, ...params };
    const _onFocus = () => {
        element.addEventListener('blur', _onBlur);
        onFocusEnter?.({});
    };
    const _onBlur = () => {
        element.removeEventListener('blur', _onBlur);
        onFocusLeave?.({});
    };
    element.addEventListener('focus', _onFocus);
    return () => {
        element.removeEventListener('focus', _onFocus);
        element.removeEventListener('blur', _onBlur);
    };
}
export { handleFocus, hasFocusCallback };
