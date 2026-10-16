import type { Highlighter, ThemeRegistration } from "shiki";

// Printed-manual palette: ink for code, blue keywords, brown literals, grey comments.
function manualTheme(
  name: string,
  type: "light" | "dark",
  c: { fg: string; keyword: string; literal: string; comment: string; punct: string },
): ThemeRegistration {
  return {
    name,
    type,
    colors: { "editor.background": "transparent", "editor.foreground": c.fg },
    tokenColors: [
      { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: c.comment } },
      {
        scope: ["keyword", "storage.type", "storage.modifier", "entity.name.tag"],
        settings: { foreground: c.keyword },
      },
      {
        scope: ["string", "string.quoted", "constant.numeric", "constant.language"],
        settings: { foreground: c.literal },
      },
      { scope: ["punctuation", "meta.brace"], settings: { foreground: c.punct } },
    ],
  };
}

const light = manualTheme("manual-light", "light", {
  fg: "#15171a",
  keyword: "#1745c4",
  literal: "#8a4a00",
  comment: "#676d75",
  punct: "#4b5159",
});

const dark = manualTheme("manual-dark", "dark", {
  fg: "#eceef0",
  keyword: "#93b4ff",
  literal: "#f0c27a",
  comment: "#8e959d",
  punct: "#b4bac1",
});

let instance: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  instance ??= import("shiki").then(({ createHighlighter }) =>
    createHighlighter({
      themes: [light, dark],
      langs: ["typescript", "tsx", "javascript", "jsx", "bash", "json", "css"],
    }),
  );
  return instance;
}

export async function highlight(code: string, lang = "typescript"): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang: hl.getLoadedLanguages().includes(lang) ? lang : "text",
    themes: { light: "manual-light", dark: "manual-dark" },
    defaultColor: false,
  });
}
