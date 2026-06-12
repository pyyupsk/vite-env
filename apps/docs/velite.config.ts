import { defineConfig, defineCollection, s } from "velite";
import rehypeSlug from "rehype-slug";

const docs = defineCollection({
  name: "Doc",
  pattern: "**/*.mdx",
  schema: s.object({
    title: s.string(),
    description: s.string().optional(),
    section: s.string(),
    order: s.number().default(0),
    slug: s.path(),
    toc: s.toc(),
    body: s.mdx({ gfm: true, rehypePlugins: [rehypeSlug] }),
  }),
});

export default defineConfig({
  root: "./src/content",
  output: {
    data: "./.velite",
    assets: "./public/static",
    base: "/static/",
    clean: true,
  },
  collections: { docs },
});
