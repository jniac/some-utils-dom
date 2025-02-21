import { DestroyableObject } from 'some-utils-ts/types';
export declare function handleHtmlElementEvent(target: HTMLElement, listeners: Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>): DestroyableObject;
