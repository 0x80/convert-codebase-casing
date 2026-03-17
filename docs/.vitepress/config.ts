import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Convert Codebase Casing",
  description:
    "Convert an entire JS/TS codebase to either kebab-case or snake-case",
  base: "/",
  cleanUrls: true,

  themeConfig: {
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/" },
          { text: "Getting Started", link: "/getting-started" },
          { text: "How It Works", link: "/how-it-works" },
          { text: "CLI Reference", link: "/cli-reference" },
        ],
      },
      {
        text: "Reference",
        items: [
          {
            text: "Supported Transforms",
            link: "/supported-transforms",
          },
          { text: "Path Prefixes", link: "/path-prefixes" },
          { text: "Known Limitations", link: "/limitations" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/0x80/convert-codebase-casing",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright &copy; Thijs Koerselman",
    },
  },
});
