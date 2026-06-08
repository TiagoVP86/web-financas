# Finanças+ — Kit de Marca

Pacote de assets da marca **Finanças+** (app de controle financeiro pessoal), no tema
dark/light esmeralda.

## Estrutura

```
assets/
├─ logo/
│  ├─ logo-dark.png          → logo completo p/ fundo escuro
│  ├─ logo-light.png         → logo completo p/ fundo claro
│  ├─ logo-mais-dark.png     → variação ícone "+" + nome (escuro)
│  ├─ logo-mais-light.png    → variação ícone "+" + nome (claro)
│  ├─ wordmark-dark.png      → só o nome (escuro)
│  └─ wordmark-light.png     → só o nome (claro)
├─ icon/
│  ├─ icon.svg               → ícone do app ("+" em tile) — vetorial
│  ├─ icon-grafico.svg       → variação do ícone (gráfico)
│  ├─ marca-mais-3d.svg      → o "+" 3D isolado (selo/decoração)
│  ├─ favicon.svg            → favicon vetorial
│  ├─ favicon-16/32/48/64.png
│  ├─ favicon-192/512.png    → PWA / Android
│  └─ apple-touch-icon-180.png
├─ categorias/               → 12 ícones de linha (SVG, stroke=currentColor)
│  └─ mercado, transporte, moradia, alimentacao, saude, lazer,
│     cartao, salario, investimentos, educacao, assinaturas, outros
└─ ilustracoes/              → telas vazias (SVG, tema escuro)
   └─ sem-transacoes, tudo-em-dia, sem-grafico
```

## Favicon (cole no <head>)

```html
<link rel="icon" type="image/svg+xml" href="/assets/icon/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icon/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/assets/icon/apple-touch-icon-180.png" />
```

## Ícones de categoria

São SVG com `stroke="currentColor"`, então herdam a cor do texto — basta definir
`color` no contêiner. Ex:

```html
<span style="color:#34D399"><img src="/assets/categorias/salario.svg" width="24" /></span>
```

## Tipografia

- **Newsreader** (serifada) — nome/títulos/valores. Combina com o estilo atual do app.
- **Manrope** (sans) — rótulos e textos de UI.

```
@import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap');
```

## Cores

| Token        | Hex       | Uso |
|--------------|-----------|-----|
| Esmeralda    | `#34D399` | primária / receitas / positivo |
| Esmeralda escura | `#10B981` | gradientes |
| Esmeralda clara  | `#6EE7B7` | brilho do ícone |
| Rosa         | `#FB7185` | despesas |
| Âmbar        | `#FBBF24` | alertas / a vencer |
| Índigo       | `#818CF8` | IA / destaques |
| Fundo dark   | `#000000` | tema escuro |
| Fundo light  | `#F5F5F1` | tema claro |

> Os PNGs de logo vêm com o fundo do tema (preto / off-white). Para fundo
> transparente em escala maior, use o `icon.svg` + o nome em Newsreader, ou me peça
> a versão que precisar.
