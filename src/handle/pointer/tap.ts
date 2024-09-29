import { PointerInfoBase } from './info'
import { PointerTarget } from './type'

class TapInfo extends PointerInfoBase {
  constructor(
    readonly timestamp: number,
    readonly tapTarget: HTMLElement | SVGElement,
    readonly downTarget: HTMLElement | SVGElement,
    readonly downPosition: DOMPoint,
    readonly orignalDownEvent: PointerEvent,
  ) {
    super()
    this.position = downPosition
  }

  override get button() {
    return this.orignalDownEvent.button
  }

  get localDownPosition(): DOMPoint {
    return this.localPosition
  }
}

type Callback = (info: TapInfo) => void

const defaultParams = {
  /** The max distance that the user may travel when down. */
  maxDistance: 10,
  /** The max duration that the user may stay down (seconds). */
  maxDuration: .3,
}

const callbackNames = [
  'onTap',
] as const

type CallbackName = (typeof callbackNames)[number]

type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>

function hasTapCallback(params: Record<string, any>): boolean {
  return callbackNames.some(name => name in params)
}

function handleTap(element: PointerTarget, params: Params): () => void {
  const {
    maxDistance,
    maxDuration,
    onTap,
  } = { ...defaultParams, ...params }

  let info: TapInfo = null!

  const onPointerDown = (event: PointerEvent) => {
    info = new TapInfo(
      Date.now(),
      element,
      event.target as HTMLElement,
      new DOMPoint(event.clientX, event.clientY),
      event,
    )
    window.addEventListener('pointerup', onPointerUp)
  }
  const onPointerUp = (event: PointerEvent) => {
    window.removeEventListener('pointerup', onPointerUp)
    const duration = (Date.now() - info.timestamp) / 1e3
    const x = event.clientX - info.downPosition.x
    const y = event.clientY - info.downPosition.y
    const distance = Math.sqrt(x * x + y * y)
    if (distance <= maxDistance && duration < maxDuration) {
      onTap?.(info)
    }
  }

  element.addEventListener('pointerdown', onPointerDown)

  return () => {
    element.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
  }
}

export type {
  Params as HandleTapParams,
  TapInfo
}

export {
  handleTap, hasTapCallback
}

