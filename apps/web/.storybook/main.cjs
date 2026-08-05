const path = require("path");
const { mergeConfig } = require("vite");

/** @type {import('@storybook/react-vite').StorybookConfig} */
module.exports = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "../src")
        }
      }
    })
};
