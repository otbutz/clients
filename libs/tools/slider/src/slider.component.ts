import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";

@Component({
  selector: "tools-slider",
  templateUrl: "slider.component.html",
  standalone: true,
  imports: [JslibModule, CommonModule],
  encapsulation: ViewEncapsulation.None,
})
export class SliderComponent implements AfterViewInit {
  @Input() minValue = 0;
  @Input() maxValue: number;

  @ViewChild("rangeSlider", { static: true }) sliderEl!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    this.sliderEl.nativeElement.addEventListener("input", (event: InputEvent) => {
      const tempValue = Number((event.target as HTMLInputElement).value);
      const progress = (tempValue / this.maxValue) * 100;
      this.sliderEl.nativeElement.style.background = `linear-gradient(to right, rgb(var(--color-primary-600)) ${progress}%, rgb(var(--color-secondary-100)) ${progress}%)`;
    });
  }
}
