export class EventModifiers {
  constructor(
    public event: Event
  ) { }

  get altKey() {
    return (
      this.event instanceof MouseEvent ? this.event.altKey :
        this.event instanceof PointerEvent ? this.event.altKey :
          false
    )
  }

  get ctrlKey() {
    return (
      this.event instanceof MouseEvent ? this.event.ctrlKey :
        this.event instanceof PointerEvent ? this.event.ctrlKey :
          false
    )
  }

  get metaKey() {
    return (
      this.event instanceof MouseEvent ? this.event.metaKey :
        this.event instanceof PointerEvent ? this.event.metaKey :
          false
    )
  }

  get shiftKey() {
    return (
      this.event instanceof MouseEvent ? this.event.shiftKey :
        this.event instanceof PointerEvent ? this.event.shiftKey :
          false
    )
  }
}
