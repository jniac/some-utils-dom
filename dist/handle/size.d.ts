import { DestroyableObject } from 'some-utils-ts/types';
declare class Info<T> {
    readonly element: T;
    readonly size: DOMPoint;
    constructor(element: T, size: DOMPoint);
    get width(): number;
    get height(): number;
    get aspect(): number;
}
type Callback<T> = (info: Info<T>) => void;
type Options<T> = Partial<{
    onSize: Callback<T>;
}>;
type Params<T> = Options<T> | Callback<T> | undefined;
/**
 * One common way to handle the size of dom elements (and the window).
 */
export declare function handleSize<T extends (HTMLElement | SVGElement | Window)>(element: T, params?: Params<T>): DestroyableObject;
export {};
