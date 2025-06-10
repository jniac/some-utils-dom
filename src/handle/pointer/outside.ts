import { PointerTarget } from './type'

class OutsideInfo { }

type Callback = (info: OutsideInfo) => void

const defaultParams = {
  /** The max distance that the user may travel when down. */
  maxDistance: 10,
  /** The max duration that the user may stay down (seconds). */
  maxDuration: .3,
}

const callbackNames = [
  'onDownOutside',
] as const

type CallbackName = (typeof callbackNames)[number]

type Params = Partial<typeof defaultParams & Record<CallbackName, Callback>>

function hasOutsideCallback(params: Record<string, any>): boolean {
  return callbackNames.some(name => name in params)
}

function handleOutside(element: PointerTarget, params: Params): () => void {
  const onPointerDown = (event: PointerEvent) => {
    const outside = event.target !== element && (element as HTMLElement).contains(event.target as Node) === false
    if (outside && params.onDownOutside) {
      const info = new OutsideInfo()
      params.onDownOutside(info)
    }
  }

  document.body.addEventListener('pointerdown', onPointerDown, { passive: true })

  return () => {
    document.body.removeEventListener('pointerdown', onPointerDown)
  }
}


export type {
  Params as HandleOutsideParams,
  OutsideInfo
}

export {
  handleOutside,
  hasOutsideCallback
}

