import type { Story, StoryFormat, StoryPage } from "@/types/story";
import { THEMES } from "@/lib/themes";
import { uid } from "@/lib/uid";

export function newPage(): StoryPage {
  return { id: uid(), layout: "image-top-text-bottom", title: "Novo título", body: "Escreve aqui o texto desta página." };
}

export function blankStory(format: StoryFormat): Story {
  return {
    id: uid(),
    name: "Sem título",
    format,
    theme: THEMES[0],
    cover: { id: uid(), layout: "cover-title-only", title: "Título da capa", body: "Um subtítulo curto para a capa." },
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
      imageUrl: "/mock/landscape.svg",
    },
    pages: [
      {
        id: uid(),
        layout: "image-top-text-bottom",
        title: "Quando a página volta a ser um objeto",
        body:
          "Durante anos, o feed tratou cada imagem como descartável. Agora, os carrosséis em formato de revista pedem outra atenção: margens generosas, hierarquia clara e um ritmo de leitura que convida a passar para a página seguinte.",
        imageUrl: "/mock/landscape.svg",
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
        imageUrl: "/mock/shapes.svg",
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
