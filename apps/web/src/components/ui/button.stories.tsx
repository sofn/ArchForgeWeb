import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "ghost"]
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"]
    }
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button"
  }
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline"
  }
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost"
  }
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm"
  }
};

export const Large: Story = {
  args: {
    children: "Large",
    size: "lg"
  }
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true
  }
};
