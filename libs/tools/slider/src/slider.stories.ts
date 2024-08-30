import { moduleMetadata, Meta, StoryObj } from "@storybook/angular";

import { SliderComponent } from "./slider.component";

// Metadata configuration for the story
export default {
  title: "Tools/Slider",
  component: SliderComponent,
  decorators: [
    moduleMetadata({
      imports: [SliderComponent], // Include the component itself and any other necessary modules
    }),
  ],
  argTypes: {
    minValue: {
      control: { type: "number" },
      description: "Minimum value for the slider",
      defaultValue: 0,
    },
    maxValue: {
      control: { type: "number" },
      description: "Maximum value for the slider",
      defaultValue: 1000,
    },
  },
} as Meta<SliderComponent>;

type Story = StoryObj<SliderComponent>;

// Default story
export const Default: Story = {
  render: (args) => {
    return {
      props: {
        ...args,
      },
      template: `<tools-slider></tools-slider>`,
    };
  },
};
