import tailwind from "@astrojs/tailwind"
import Compress from "astro-compress"
import icon from "astro-icon"
import { defineConfig } from "astro/config"
import Color from "colorjs.io"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeKatex from "rehype-katex"
import rehypeSlug from "rehype-slug"
import remarkMath from "remark-math"
import remarkBlockcuoteAdmonitions from 'remark-github-beta-blockquote-admonitions'
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs"
import svelte from "@astrojs/svelte"
import swup from '@swup/astro';
import sitemap from '@astrojs/sitemap';

const oklchToHex = (str) => {
  const DEFAULT_HUE = 250
  const regex = /-?\d+(\.\d+)?/g
  const matches = str.string.match(regex)
  const lch = [matches[0], matches[1], DEFAULT_HUE]
  return new Color("oklch", lch).to("srgb").toString({
    format: "hex",
  })
}

// https://astro.build/config
export default defineConfig({
  site: "https://fuwari.vercel.app/",
  base: "/",
  integrations: [
    tailwind(),
    swup({
      theme: false,
      animationClass: 'transition-',
      containers: ['main'],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      globalInstance: true,
    }),
    icon({
      include: {
        "material-symbols": ["*"],
        "fa6-brands": ["*"],
        "fa6-regular": ["*"],
        "fa6-solid": ["*"],
      },
    }),
    Compress({
      Image: false,
    }),
    svelte(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkReadingTime,
      [
        remarkBlockcuoteAdmonitions,
        {
          titleFilter: title =>
            title.match(/\[!(TIP|NOTE|CAUTION|WARNING|IMPORTANT)( ?\/*.*)\]/),
          titleTextMap: title => ({
            displayTitle:
              title.indexOf('/') !== -1
                ? title.slice(title.indexOf('/') + 1, -1).trim()
                : title.match(/(?:\[!)(.+?)(?:\/|\]| )/)[1],
            checkedTitle: title.match(/(?:\[!)(.+?)(?:\/|\]| )/)[1],
          }),
          classNameMaps: {
            block: str => [str.toLowerCase(), 'admonitions'],
            title: ['admonitions-title'],
          },
          dataMaps: {
            block: data => ({ ...data, hName: 'blockquote' }),
            title: data => ({ data }),
          },
        },
      ],
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["anchor"],
          },
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["anchor-icon"],
              'data-pagefind-ignore': true,
            },
            children: [
              {
                type: "text",
                value: "#",
              },
            ],
          },
        },
      ],
    ],
  },
  vite: {
    css: {
      preprocessorOptions: {
        stylus: {
          define: {
            oklchToHex: oklchToHex,
          },
        },
      },
    },
  },
})
