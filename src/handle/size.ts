import { lazy } from 'some-utils-ts/lazy'
import { DestroyableObject } from 'some-utils-ts/types'

/**
 * The lazy initialization of the ResizeObserver and the map of callbacks allows
 * to use handleSize() in next-js without having to worry about the server-side
 * execution context.
 */
const init = lazy(() => {
  const resizeObserverMap = new WeakMap<Element, Set<(entry: ResizeObserverEntry) => void>>()
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const callbacks = resizeObserverMap.get(entry.target)
      if (callbacks) {
        for (const callback of callbacks) {
          callback(entry)
        }
      }
    }
  })
  return {
    resizeObserver,
    resizeObserverMap,
  }
})

class Info<T> {
  constructor(
    public readonly element: T,
    public readonly size: DOMPoint,
  ) { }

  get width() {
    return this.size.x
  }

  get height() {
    return this.size.y
  }

  get aspect() {
    return this.size.x / this.size.y
  }
}

type Callback<T> = (info: Info<T>) => void

type Options<T> = Partial<{
  onSize: Callback<T>
}>

type Params<T> = Options<T> | Callback<T> | undefined

function solveParams<T>(params: Params<T>): Required<Options<T>> {
  if (typeof params === 'function') {
    return { onSize: params }
  }
  const { onSize = () => { } } = params ?? {}
  return { onSize }
}

/**
 * One common way to handle the size of dom elements (and the window).
 */
export function handleSize<T extends (HTMLElement | SVGElement | Window)>(
  element: T,
  params?: Params<T>,
): DestroyableObject {
  const { onSize } = solveParams(params)
  const size = new DOMPoint(0, 0)
  if (element instanceof Window) {
    const _onResize = () => {
      size.x = window.innerWidth
      size.y = window.innerHeight
      onSize(new Info(element, size))
    }
    element.addEventListener('resize', _onResize)
    _onResize()
    const destroy = () => {
      element.removeEventListener('resize', _onResize)
    }
    return { destroy }
  } else {
    const {
      resizeObserver,
      resizeObserverMap,
    } = init()
    resizeObserver.observe(element)
    const callbacks = resizeObserverMap.get(element) ?? new Set()
    const callback = (entry: ResizeObserverEntry) => {
      size.x = entry.contentRect.width
      size.y = entry.contentRect.height
      onSize(new Info(element, size))
    }
    resizeObserverMap.set(element, callbacks)
    callbacks.add(callback)
    const destroy = () => {
      const callbacks = resizeObserverMap.get(element)
      if (!callbacks)
        throw new Error('Wtf??? No callbacks found for element')
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        resizeObserverMap.delete(element)
        resizeObserver.unobserve(element)
      }
    }
    return { destroy }
  }
}