import { Vector2Like } from 'some-utils-ts/types'
import { isAncestorOf } from '../../utils/tree'
import { PointerInfoBase } from './info'
import { PointerTarget } from './type'
import { EventModifiers } from './utils'

class TapInfo extends PointerInfoBase {
  originalUpEvent: PointerEvent = null!

  upTimestamp = -1
  tapCount = 1

  modifiers: EventModifiers

  /**
   * @deprecated Use `orignalDownEvent` instead. The name was a typo but is kept for backward compatibility.
   */
  get orignalDownEvent() {
    return this.originalDownEvent
  }

  /**
   * @deprecated Use `timestamp` instead. The name was misleading but is kept for backward compatibility.
   */
  get timestamp() {
    return this.downTimestamp
  }

  constructor(
    public downTimestamp: number,
    public readonly tapTarget: HTMLElement | SVGElement,
    public readonly downTarget: HTMLElement | SVGElement,
    public readonly downPosition: DOMPoint,
    public readonly originalDownEvent: PointerEvent,
  ) {
    super()
    this.position = downPosition
    this.modifiers = new EventModifiers(originalDownEvent)
  }

  override get targetElement() {
    return this.tapTarget
  }

  override get button() {
    return this.originalDownEvent.button
  }

  getLocalDownPosition<T extends Vector2Like>(out?: T): T {
    const { x, y } = this.localPosition
    out ??= {} as T
    out.x = x
    out.y = y
    return out
  }

  get localDownPosition(): DOMPoint {
    return this.localPosition
  }
}

type Callback = (info: TapInfo) => void

const defaultParams = {
  /** 
   * The max distance that the user may travel when down. 
   */
  maxDistance: 10,
  /** 
   * The max duration that the user may stay down (seconds).
   */
  maxDuration: .3,
  /**
   * When multiple taps are detected, they will all trigger the callback.
   */
  maxIntervalBetweenMultipleTaps: .1,
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
    maxIntervalBetweenMultipleTaps,
    onTap,
  } = { ...defaultParams, ...params }

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let info: TapInfo | null = null

  const onPointerDown = (event: PointerEvent) => {
    const now = Date.now()

    if (info !== null && (now - info.upTimestamp) / 1000 <= maxIntervalBetweenMultipleTaps) {
      info.downTimestamp = now
      info.tapCount++
      clearTimeout(timeoutId!)
    }

    else {
      info = new TapInfo(
        now,
        element,
        event.target as HTMLElement,
        new DOMPoint(event.clientX, event.clientY),
        event,
      )
    }
    window.addEventListener('pointerup', onPointerUp)
  }

  const onPointerUp = (event: PointerEvent) => {
    window.removeEventListener('pointerup', onPointerUp)

    if (info === null)
      throw new Error(`This can't happen, pointerup without pointerdown (???)`)

    if (isAncestorOf(info.downTarget, event.target as HTMLElement)) {
      const duration = (Date.now() - info.downTimestamp) / 1e3
      if (duration <= maxDuration) {
        const x = event.clientX - info.downPosition.x
        const y = event.clientY - info.downPosition.y
        const distance = Math.hypot(x, y)
        if (distance <= maxDistance) {
          info.originalUpEvent = event
          info.upTimestamp = Date.now()
          // Reminder: 
          // The callback must be always delayed, even if 'maxIntervalBetweenMultipleTaps' 
          // is 0, to avoid collision with other events (native eg: 'click', or custom)
          timeoutId = setTimeout(() => {
            const currentInfo = info!
            info = null
            onTap?.(currentInfo)
          }, maxIntervalBetweenMultipleTaps * 1000)
        }
      }
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
  handleTap,
  hasTapCallback
}

