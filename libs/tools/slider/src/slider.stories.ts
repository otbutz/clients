import { moduleMetadata, Meta, StoryObj } from "@storybook/angular";

import { SliderComponent } from "./slider.component";

export default {
  title: "Tools/Slider",
  component: SliderComponent,
  decorators: [
    moduleMetadata({
      imports: [SliderComponent],
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

export const Default: Story = {
  args: {
    minValue: 0,
    maxValue: 100,
  },

  render: (args) => {
    return {
      props: {
        ...args,
      },
    };
  },
};
