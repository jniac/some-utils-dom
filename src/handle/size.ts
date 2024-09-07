import { lazy } from 'some-utils-ts/lazy'
import { DestroyableObject } from 'some-utils-ts/types'

/**
 * The lazy initialization of the ResizeObserver and the map of callbacks allows
 * to use handleSize() in next-js without having to worry about the server-side
 * execution context.
 */
const init = lazy(() => {
  const resizeObserverMap = new WeakMap<Element, any>()
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      resizeObserverMap.get(entry.target)?.(entry)
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
    resizeObserverMap.set(element, (entry: ResizeObserverEntry) => {
      size.x = entry.contentRect.width
      size.y = entry.contentRect.height
      onSize(new Info(element, size))
    })
    const destroy = () => resizeObserver.unobserve(element)
    return { destroy }
  }
}