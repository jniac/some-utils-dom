import { Rectangle } from 'some-utils-ts/math/geom/rectangle'
import { PointerTarget } from './type'

type PressInfo = {
  position: DOMPoint
  delta: DOMPoint
  target: PointerTarget
  targetRectOnDown: Rectangle
  /**
   * Whether the pointer is still inside the target element's rect since the press started. 
   * 
   * Notes:
   * - This is based on the rect at the time of the press start, so it won't update 
   * if the element moves or resizes during the press.
   */
  pointerIsInside: boolean
  /**
   * Duration of the press in seconds.
   */
  pressDuration: number
}

type Callback = (info: PressInfo) => void

const callbackNames = [
  'onPressStart',
  'onPressStop',
  'onPressFrame',
] as const

type CallbackName = (typeof callbackNames)[number]

type Params = Partial<Record<CallbackName, Callback>>

function hasPressCallback(params: Record<string, any>): boolean {
  return callbackNames.some(name => name in params)
}

function handlePress(element: PointerTarget, params: Params) {
  const {
    onPressStart,
    onPressStop,
    onPressFrame,
  } = params

  let dragged = false
  let frameID = -1
  let downTime = 0
  const pointer = new DOMPoint(0, 0)
  const position = new DOMPoint(0, 0)
  const delta = new DOMPoint(0, 0)
  const info: PressInfo = {
    position,
    delta,
    target: element,
    targetRectOnDown: new Rectangle(),
    get pointerIsInside() {
      return info.targetRectOnDown.contains(pointer.x, pointer.y)
    },
    pressDuration: 0,
  }

  const dragFrame = () => {
    if (dragged) {
      frameID = window.requestAnimationFrame(dragFrame)
      delta.x = pointer.x - position.x
      delta.y = pointer.y - position.y
      position.x += delta.x
      position.y += delta.y
      onPressFrame?.(info)
    }
  }

  const start = (x: number, y: number) => {
    dragged = true
    downTime = window.performance.now()
    info.targetRectOnDown.copy(element.getBoundingClientRect())
    delta.x = 0
    delta.y = 0
    position.x = x
    position.y = y
    pointer.x = x
    pointer.y = y
    info.pressDuration = 0
    onPressStart?.(info)
  }

  const stop = () => {
    dragged = false
    info.pressDuration = (window.performance.now() - downTime) / 1000
    onPressStop?.(info)
  }

  const onMouseDown = (event: MouseEvent) => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    frameID = window.requestAnimationFrame(dragFrame)
    dragged = true
    info.targetRectOnDown.copy(element.getBoundingClientRect())
    start(event.clientX, event.clientY)
  }

  const onMouseMove = (event: MouseEvent) => {
    pointer.x = event.clientX
    pointer.y = event.clientY
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    stop()
  }

  const onTouchStart = (event: TouchEvent) => {
    event.preventDefault() // prevent mouse events to be fired
    const touch = event.touches[0]
    if (touch) {
      window.addEventListener('touchmove', onTouchMove)
      window.addEventListener('touchend', onTouchEnd)
      frameID = window.requestAnimationFrame(dragFrame)
      start(touch.clientX, touch.clientY)
    }
  }

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (touch) {
      pointer.x = touch.clientX
      pointer.y = touch.clientY
    }
  }

  const onTouchEnd = (event: TouchEvent) => {
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    stop()
  }

  element.addEventListener('mousedown', onMouseDown, { passive: false })
  element.addEventListener('touchstart', onTouchStart, { passive: false })

  return () => {
    element.removeEventListener('mousedown', onMouseDown)
    element.removeEventListener('touchstart', onTouchStart)

    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)

    window.cancelAnimationFrame(frameID)
  }
}

export type {
  Params as HandlePressParams,
  PressInfo
}

export {
  handlePress,
  hasPressCallback
}

