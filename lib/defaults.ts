import type { Story, StoryFormat, StoryPage } from "@/types/story";
import { THEMES } from "@/lib/themes";
import { uid } from "@/lib/uid";

// GitHub Pages serves this app from /minicanva/, so root-relative public asset paths
// need the same prefix Next.js applies to its own routes (see next.config.mjs).
const publicAsset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;

/** Built-in pattern images (public/images), used for covers and as the default image of new pages. */
export const DEFAULT_IMAGES = Array.from({ length: 11 }, (_, i) => publicAsset(`/images/pattern-${String(i + 1).padStart(2, "0")}.jpg`));
const pattern = (n: number) => DEFAULT_IMAGES[n - 1];
/** A different default image each time, so new pages don't all look the same. */
const randomImage = () => DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];

export function newPage(): StoryPage {
  return { id: uid(), layout: "image-top-text-bottom", title: "Novo título", body: "Escreve aqui o texto desta página.", imageUrl: randomImage() };
}

export function blankStory(format: StoryFormat): Story {
  return {
    id: uid(),
    name: "Sem título",
    format,
    theme: THEMES[0],
    cover: { id: uid(), layout: "cover-title-image", title: "Título da capa", body: "Um subtítulo curto para a capa.", imageUrl: randomImage() },
    pages: [newPage()],
  };
}

export function sampleStory(): Story {
  return {
    id: uid(),
    name: "Revista minicanva",
    format: "4:5",
    theme: THEMES[0],
    cover: {
      id: uid(),
      layout: "cover-title-image",
      title: "O regresso da tipografia editorial",
      body: "Porque é que os carrosséis estão a voltar a parecer revistas.",
      imageUrl: pattern(8),
    },
    pages: [
      {
        id: uid(),
        layout: "image-top-text-bottom",
        title: "Quando a página volta a ser um objeto",
        body:
          "Durante anos, o feed tratou cada imagem como descartável. Agora, os carrosséis em formato de revista pedem outra atenção: margens generosas, hierarquia clara e um ritmo de leitura que convida a passar para a página seguinte.",
        imageUrl: pattern(2),
      },
      {
        id: uid(),
        layout: "two-column",
        title: "Três regras para um bom miolo",
        body:
          "Primeiro, uma ideia por página. Um carrossel não é um artigo comprimido; é uma sequência de momentos, e cada um precisa de espaço para respirar.\nSegundo, a tipografia faz o trabalho pesado. Um título forte e um corpo de texto legível dizem mais do que qualquer efeito.\nTerceiro, o ritmo. Alterna páginas densas com páginas de imagem ou de citação, para que quem lê nunca sinta que está a trabalhar.",
      },
      {
        id: uid(),
        layout: "quote-centered",
        title: "A tipografia é o que a linguagem parece.",
        body: "Ellen Lupton",
      },
      {
        id: uid(),
        layout: "image-full-bleed",
        title: "Deixa a imagem falar",
        body: "Uma página inteira de imagem dá descanso entre blocos de texto.",
        imageUrl: pattern(9),
      },
      {
        id: uid(),
        layout: "text-only",
        title: "Para terminar",
        body:
          "Guarda o Story, exporta as páginas em PNG ou junta tudo num PDF. Tudo corre no teu browser: nada é enviado para nenhum servidor.",
      },
    ],
  };
}
