# minicanva

Editor de Stories e carrosséis de Instagram em formato de revista (capa + miolo), com layouts, tipografia e imagens customizáveis, e export para PNG, ZIP e PDF. Tudo corre no browser, sem backend nem APIs pagas.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · react-konva / Konva · Zustand · jsPDF · JSZip

## O que faz (v1)

- **Layouts de capa:** capa com imagem e capa tipográfica
- **Layouts de miolo:** imagem e texto, só texto, duas colunas (com imagem opcional), imagem inteira e citação
- **Temas:** Editorial serif (Playfair Display + Source Serif 4), Tech mono (Space Mono + IBM Plex Mono) e Minimal sans (Inter), todos do Google Fonts. Cada página pode usar outro tema ou outras cores.
- **Formatos:** quadrado 1080×1080, retrato 1080×1350 e Story 1080×1920. No 9:16 o texto fica fora dos ~250 px de cima e de baixo, que a interface do Instagram tapa.
- **Barra lateral:** layout, título, texto, imagem (botão ou arrastar para a página) e tema da página; nome, formato e tema do Story
- **Tira de páginas:** miniaturas de todas as páginas, reordenar arrastando, adicionar, duplicar e apagar
- **Export:** PNG da página, ZIP com todas as páginas, PDF no tamanho do formato ou em A4, com resolução 1× ou 2×
- **Guardar:** o Story fica no `localStorage` e as imagens no IndexedDB (no `localStorage` só cabiam poucas fotos)

## Estrutura

```
types/story.ts                     Tipos Story, StoryPage, Theme, PageLayout
lib/themes.ts                      Temas e junção do themeOverride da página
lib/formats.ts                     Formato → dimensões em píxeis
lib/defaults.ts                    Story em branco, Story de exemplo e página nova
lib/store.ts                       Estado com Zustand, guardado no localStorage
lib/images.ts                      Imagens no IndexedDB (referência "idb:<id>" na página)
lib/export.ts                      PNG, ZIP e PDF
lib/stages.ts                      Registo dos Stages das miniaturas, usados pelo export
components/story/layouts/          Um componente por layout (recebe página + tema, devolve nós Konva)
components/story/primitives.tsx    Peças partilhadas: imagem recortada, rodapé, cabeçalho, medição de texto
components/editor/                 Cabeçalho, vista principal, tira de páginas e barra lateral
```

Os layouts desenham sempre no tamanho real do formato. Os `Stage` só reduzem a escala para o ecrã. O export volta a desenhar cada miniatura com `pixelRatio = largura do formato / largura da miniatura` (× 2 em 2×), por isso sai sempre no tamanho exato.

## Correr localmente

```bash
npm install
npm run dev
```

Depois abre http://localhost:3000.
