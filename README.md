# `式神` shikigami

[![Build/Test](https://img.shields.io/github/workflow/status/norskeld/shikigami/test?style=flat-square&colorA=22272d&colorB=22272d)](https://github.com/norskeld/shikigami/actions 'Build and test workflows')
[![Coverage](https://img.shields.io/coverallsCoverage/github/norskeld/shikigami?style=flat-square&colorA=22272d&colorB=22272d)](https://coveralls.io/github/norskeld/shikigami 'Test coverage')
[![NPM](https://img.shields.io/npm/v/@nrsk/shikigami?style=flat-square&colorA=22272d&colorB=22272d)](https://npm.im/@nrsk/shikigami 'This package on NPM')
[![Supported Node Versions](https://img.shields.io/static/v1?label=node&message=14+|+16+|+18&style=flat-square&colorA=22272d&colorB=22272d)](https://github.com/norskeld/shikigami/blob/master/package.json#L25 'Supported Node versions')
[![Semantic Release](https://img.shields.io/static/v1?label=semantic+release&message=✔&style=flat-square&colorA=22272d&colorB=22272d)](https://github.com/semantic-release/semantic-release 'This package uses semantic release to handle releasing, versioning, changelog generation and tagging')

Opinionated syntax highlighting with [shiki] for [markdown-it].

![Example of rendered code](/assets/shikigami.png)

## Installation

Just use your favorite package manager.

```bash
npm i @nrsk/shikigami
```

> Note: No styles provided by default, so you need to style everything yourself, using classes described below. There's an [example of CSS here][css-example].

This package comes both in **CommonJS** and **ESM** flavors. No additional steps required, just `import` or `require` it.

## Usage with other plugins

Yet to be confirmed, but most likely this plugin is incompatible with other plugins that process fenced code blocks (e.g. **[markdown-it-attrs]**, which can be used to assign classes to elements and has similar syntax).

## Usage

This package exposes a function named **shikigami**, which is a `Promise`, that resolves to a **markdown-it** plugin function. Hence, you must `await` it (or use `.then` syntax), and only then pass the resulting function to **markdown-it**.

> _Why?_ **shiki** uses a lot of asynchrounous stuff under the hood, and its public API is mostly asynchronous as well, while **markdown-it** is synchronous, so yeah, I _had_ to wrap the plugin in a `Promise`.

Below is an example of usage.

```typescript
import { shikigami, loadTheme } from '@nrsk/shikigami'
import md from 'markdown-it'

async function processMarkdown(input) {
  const parser = md('commonmark').use(
    await shikigami({
      withLanguage: true,
      withLineNumbers: true,
      highlightInvert: true,
      highlighter: {
        // All other shiki's highlighter options are available as well,
        // so you can load additional languages and so on.
        theme: await loadTheme('./theme/custom.json')
      }
    })
  )

  return parser.render(input)
}
```

## Markdown syntax

This plugin introduces a simple syntax extension for fenced code blocks, that allows you to change plugin options in-place. Options defined this way have precedence over plugin options.

````markdown
# Example

```typescript {{ <option>: <value>, <option>: <value>, ... }}
interface User {
  id: number
  firstName: string
  lastName: string
  role: string
}
```
````

## Options

List of options that can be passed to `shikigami` function. Options allowed to be used directly in Markdown through syntax extension are marked accordingly.

### `openToken?: string`

- **Default**: `{{`
- **Allowed in Markdown**: no

Use this option to change the opening token for extended Markdown syntax.

### `closeToken?: string`

- **Default**: `}}`
- **Allowed in Markdown**: no

Use this option to change the closing token for extended Markdown syntax.

### `withLanguage?: boolean`

- **Default**: `false`
- **Allowed in Markdown**: yes

Set to `true` to allow rendering a sibling `<div>` with a `language-<languageId>` class. This is useful when you want to show the language specified in your fenced code block.

### `withLineNumbers?: boolean`

- **Default**: `false`
- **Allowed in Markdown**: yes

Set to `true` to render line numbers.

### `highlight?: Array<number | Array<number>>`

- **Default**: `[]`
- **Allowed in Markdown**: yes

Use this option to specify which lines or ranges of lines should be marked with specified highlighting class (or classes). These classes can be customized via `highlightClasses` and `highlightRangeClasses` options.

#### Examples

- Highlight lines **5** and **7**:

  ```
  {{ highlight: [5, 7] }}
  ```

- Highlight lines **5**, **7**, and lines in range from **10** to **15**:

  ```
  {{ highlight: [5, 7, [10, 15]] }}
  ```

### `highlightClasses?: Array<string>`

- **Default**: `['highlight']`
- **Allowed in Markdown**: no

Use this option to customize classes for highlighted lines.

### `highlightRangeClasses?: HighlightRangeClasses`

- **Default**: `['highlight-start', 'highlight-inner', 'highlight-end']`
- **Allowed in Markdown**: no

Use this option to customize classes for highlighted ranges. Must be a tuple of exactly three elements.

#### Explanation

- The first class is assigned to the first line of a range.
- The second class is assigned to all lines between the first and the last line of a range. _This only applied if the range covers 3 and more lines._
- The third class is assigned to the last line of a range.

_Is this overkill? Probably..._

### `highlightInvert?: boolean`

- **Default**: `false`
- **Allowed in Markdown**: yes

Set to `true` to allow marking lines that are not highlighted with specified classes. These classes can be customised via `highlightInvertClasses`.

**Note: this will work only if `highlight` option is set to a non-empty array of lines.**

### `highlightInvertClasses?: Array<string>`

- **Default**: `['highlight-invert']`
- **Allowed in Markdown**: no

Use this option to customize classes for unhighlighted lines.

### `highlighter?: HighlighterOptions`

- **Default**: `{}`
- **Allowed in Markdown**: no

Highlighter options which will be passed right into shiki's `getHighlighter`. See [shiki documentation][shiki-docs] for available options.

## API

Besides exposing the `shikigami` function, this plugin re-exports shiki's `loadTheme` just for convenience.

### `shikigami(userOptions?: ShikigamiOptions): Promise<PluginSimple>`

Plugin factory function that resolves to a **markdown-it** plugin.

```typescript
import { shikigami } from '@nrsk/shikigami'
import anchor from 'markdown-it-anchor'
import md from 'markdown-it'

async function processMarkdown(input) {
  return md('commonmark')
    .use(
      await shikigami({
        /** Plugin options. */
      })
    )
    .use(anchor)
    .render(input)
}
```

### `loadTheme(themePath: string): Promise<IShikiTheme>`

Shiki's theme loader.

## Todo

- [ ] Tests.
- [ ] Diffs support.

## License

[MIT](LICENSE).

<!-- Links. -->

[shiki]: https://shiki.matsu.io
[markdown-it]: https://github.com/markdown-it/markdown-it
[markdown-it-attrs]: https://github.com/arve0/markdown-it-attrs
[shiki-docs]: https://shiki.matsu.io
[css-example]: https://github.com/norskeld/sigma/blob/master/docs/src/components/article.module.css#L56-L159
