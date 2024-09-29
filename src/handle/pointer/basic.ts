import { PointerInfoBase } from './info'
import { PointerTarget } from './type'

class BasicPointerInfo extends PointerInfoBase {
  constructor(
    public entered: boolean = false,
    public pressed: boolean = false,
    public downPosition: DOMPoint = new DOMPoint(),
    public upPosition: DOMPoint = new DOMPoint,
    public event: Event = null!,
  ) { super() }

  get targetElement() {
    const target = this.event!.target
    if (target instanceof Element) {
      return target
    }
    throw new Error('targetElement is not an Element')
  }

  /**
   * [mdn](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button)
   */
  get button() {
    return (
      this.event instanceof MouseEvent ? this.event.button :
        this.event instanceof PointerEvent ? this.event.button :
          0
    )
  }

  get localPosition(): DOMPoint {
    const rect = this.targetElement.getBoundingClientRect()
    const { x, y } = this.position
    return new DOMPoint(x - rect.x, y - rect.y)
  }
}

type Callback = (info: BasicPointerInfo) => void

const defaultParams = {
}

const callbackNames = [
  'onDown',
  'onUp',
  'onChange',
  'onEnter',
  'onLeave',
] as const

type CallbackName = (typeof callbackNames)[number]

type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>

function hasBasicPointerCallback(params: Record<string, any>): boolean {
  return callbackNames.some(name => name in params)
}

/**
 * MEMO:
 *  - "pointer" events are fire BEFORE any "mouse" or "touch" events, order is:
 *    - pointer -> touch -> mouse
 * 
 * For multiple reasons related to the "mouse" & "touch" reunification, 
 * "mouse" & "touch" are handled separately (that is to say: not through the 
 * common "pointer" interface). 
 * 
 * Reasons are:
 * - when tracking pointer position "onChange" callback is better than an "onMove"
 *   because "onMove" (onMouseMove + onPointerMove) is not fired when a new touch 
 *   started (but a new touch start implies generally a new position).
 * - "onChange" has to be called before "onDown" (ex: for updating a raycaster), 
 *   so this requires to use the "mousedown" & "touchstart" and not "pointer" 
 *   since ("pointer" are fired first, "touchstart" will necesseray be late).
 * 
 * NOTE:
 * 
 * A special effort is made to handle to avoid double "down/up" calls when "touch"
 * events are fired (when "touch" events are fired, "mouse" events are also fired).
 * Since in debug mode, it is possible to switch between "touch" & "mouse" events
 * an heuristic is used that combine "touch started" state and "touch timestamp".
 * This allows to go back and forth between "touch" & "mouse" events without 
 * reloading the page.
 */
function handleBasicPointer(element: PointerTarget, params: Params): () => void {
  const state = {
    touchStarted: false,
    touchTimestamp: -1,
  }
  /**
   * We consider that the user is using a touch device if:
   * - any touch event has been fired in the last second
   * - or if a touch "down" is currently happening (that could be a long press, with no move).
   */
  function isTouch() {
    return state.touchStarted || state.touchTimestamp > Date.now() - 1000
  }

  const info = new BasicPointerInfo()

  // INFO UPDATE:
  const updateDown = (event: Event, x: number, y: number) => {
    info.pressed = true
    info.downPosition.x = x
    info.downPosition.y = y
    update(event, x, y)
    params.onDown?.(info)
  }

  const updateUp = (event: Event, x: number, y: number) => {
    info.pressed = false
    info.upPosition.x = x
    info.upPosition.y = y
    update(event, x, y)
    params.onUp?.(info)

    // reset position
    info.position.x = -1
    info.position.y = -1
  }

  const update = (event: Event, x: number, y: number) => {
    if (info.position.x !== x || info.position.y !== y) {
      info.event = event
      info.position.x = x
      info.position.y = y
      params.onChange?.(info)
    }
  }

  // MOUSE:
  const onMouseDown = (event: MouseEvent) => {
    if (isTouch() === false) {
      updateDown(event, event.clientX, event.clientY)
    }
  }

  const onMouseUp = (event: MouseEvent) => {
    if (isTouch() === false) {
      updateUp(event, event.clientX, event.clientY)
    }
  }

  const onMouseMove = (event: MouseEvent) => {
    if (isTouch() === false) {
      update(event, event.clientX, event.clientY)
    }
  }

  const onMouseOver = () => {
    document.body.addEventListener('mouseup', onBodyMouseUp)
    checkForEnter()
  }

  const onMouseOut = () => {
    checkForLeave()
  }

  const onBodyMouseUp = () => {
    info.pressed = false
    checkForLeave()
    document.documentElement.removeEventListener('mouseup', onBodyMouseUp)
  }

  const checkForEnter = () => {
    if (info.entered === false) {
      info.entered = true
      params.onEnter?.(info)
    }
  }

  const checkForLeave = () => {
    if (info.entered) {
      if (info.pressed === false) {
        info.entered = false
        params.onLeave?.(info)
      }
    }
  }

  // TOUCH:
  const onTouchStart = (event: TouchEvent) => {
    // Because when the touch start the position is not the same as the previous touch.
    if (event.touches.length === 1) { // ignore multi-touch
      state.touchStarted = true
      state.touchTimestamp = Date.now()
      updateDown(event, event.touches[0].clientX, event.touches[0].clientY)
    }
  }

  const onTouchEnd = (event: TouchEvent) => {
    if (event.touches.length === 0) { // ignore multi-touch
      state.touchStarted = false
      state.touchTimestamp = Date.now()
      updateUp(event, event.changedTouches[0].clientX, event.changedTouches[0].clientY)
    }
  }

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 1) { // ignore multi-touch
      state.touchTimestamp = Date.now()
      update(event, event.touches[0].clientX, event.touches[0].clientY)
    }
  }

  // EVENTS:
  element.addEventListener('mouseover', onMouseOver)
  element.addEventListener('mouseout', onMouseOut)
  element.addEventListener('mousedown', onMouseDown)
  element.addEventListener('mouseup', onMouseUp)
  element.addEventListener('mousemove', onMouseMove)

  element.addEventListener('touchstart', onTouchStart, { passive: false })
  element.addEventListener('touchend', onTouchEnd, { passive: false })
  element.addEventListener('touchmove', onTouchMove, { passive: false })

  return () => {
    element.removeEventListener('mouseover', onMouseOver)
    element.removeEventListener('mouseout', onMouseOut)
    element.removeEventListener('mousedown', onMouseDown)
    element.removeEventListener('mouseup', onMouseUp)
    element.removeEventListener('mousemove', onMouseMove)

    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchend', onTouchEnd)
    element.removeEventListener('touchmove', onTouchMove)

    document.body.removeEventListener('mouseup', onBodyMouseUp)
  }
}

export type {
  BasicPointerInfo,
  Params as HandleBasicPointerParams
}

export {
  handleBasicPointer,
  hasBasicPointerCallback
}
