import { DestroyableObject } from 'some-utils-ts/types';
/**
 * A very generic utility to handle any user interaction, useful to prevent inactivity.
 *
 * NOTE: The listener is passive, meaning it won't prevent the default behavior
 * of the events. If the default behavior of the events should be prevented, this
 * should be done elsewhere.
 */
export declare function handleAnyUserInteraction(callback: () => void): DestroyableObject;
export declare function handleAnyUserInteraction(element: HTMLElement | Window, callback: () => void): DestroyableObject;
