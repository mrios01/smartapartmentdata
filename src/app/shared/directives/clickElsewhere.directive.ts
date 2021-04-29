import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[clickElsewhere]'
})
export class ClickElsewhereDirective {

  @Output() clickOff = new EventEmitter<MouseEvent>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Check if the click was outside the element
    if (targetElement && !this.elementRef.nativeElement.contains(targetElement)) {

      this.clickOff.emit(event);
    }
  }

}
