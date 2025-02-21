export var PointerButton;
(function (PointerButton) {
    // From the "mouse" specs:
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    PointerButton[PointerButton["Main"] = 0] = "Main";
    PointerButton[PointerButton["Aux"] = 1] = "Aux";
    PointerButton[PointerButton["Second"] = 2] = "Second";
    PointerButton[PointerButton["Fourth"] = 3] = "Fourth";
    PointerButton[PointerButton["Fifth"] = 4] = "Fifth";
    // Custom
    PointerButton[PointerButton["DoubleTouch"] = 5] = "DoubleTouch";
    /**
     * Left button.
     * @alias PointerButton.Main
     */
    PointerButton[PointerButton["Left"] = 0] = "Left";
    /**
     * Middle button.
     * @alias PointerButton.Aux
     */
    PointerButton[PointerButton["Middle"] = 1] = "Middle";
    /**
     * Right button.
     * @alias PointerButton.Second
     */
    PointerButton[PointerButton["Right"] = 2] = "Right";
})(PointerButton || (PointerButton = {}));
const eventPhases = [
    'start',
    'continue',
    'end',
];
