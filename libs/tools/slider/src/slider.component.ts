import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ViewEncapsulation } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";

@Component({
  selector: "tools-slider",
  templateUrl: "slider.component.html",
  standalone: true,
  imports: [JslibModule, CommonModule],
  encapsulation: ViewEncapsulation.None,
})
export class SliderComponent implements AfterViewInit {
  maxValue = 1000;
  minValue = 0;

  constructor() {}

  ngAfterViewInit() {
    const sliderEl = document.querySelector("#rangeSlider") as HTMLElement;

    sliderEl.addEventListener("input", (event: InputEvent) => {
      const tempValue = Number((event.target as HTMLInputElement).value);
      const progress = (tempValue / this.maxValue) * 100;
      sliderEl.style.background = `linear-gradient(to right, rgb(var(--color-primary-600)) ${progress}%, rgb(var(--color-secondary-100)) ${progress}%)`;
    });
  }
}
