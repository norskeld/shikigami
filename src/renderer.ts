import { FontStyle, type IThemedToken } from 'shiki'

import { type HtmlRendererOptions, type LineOption } from './renderer.options'
import { getDefaultOptions, mergeOptions } from './renderer.options'
import { useBuilder } from './builder'
import { groupBy } from './utils'

export function renderToHtml(
  tokens: Array<Array<IThemedToken>>,
  userOptions: HtmlRendererOptions = {}
): string {
  const options = mergeOptions(getDefaultOptions(), userOptions)
  const [html, append] = useBuilder()

  // NOTE: This is a check for the edge case when we render tokens from a fenced code block without
  // language defined, i.e. plain text.
  const lines = isPlainText(tokens) ? transformPlainText(tokens) : tokens

  // Process possible edge case when we have an array of options for the same line, but with
  // differrent class names.
  const groupedLineOptions = groupBy(options.lineOptions, ({ line }) => line)

  // Open: building.
  append(`<pre class="shiki" style="background-color: ${options.background}">`)

  // Optionally add a div with `language-{languageId}` class and the `languageId` label itself.
  if (options.withLanguage && options.languageId.length) {
    append(`<div class="language-id">${options.languageId}</div>`)
  }

  // Open: building the code section.
  append(`<code>`)

  // Optionally add a div with line numbers.
  if (options.withLineNumbers) {
    append(
      `<div class="line-numbers">
        ${lines.map((_, lineIndex) => `<div class="line-number">${lineIndex + 1}</div>`).join('')}
      </div>`
    )
  }

  // Open: building the lines with code.
  append(`<div class="lines">`)

  // console.log(lines)

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1
    const lineOptions = groupedLineOptions.get(lineNumber) ?? []
    const lineClasses = getLineClasses(lineOptions).join(' ')

    // Open: line.
    append(`<div class="${lineClasses}">`)

    if (line.length) {
      line.forEach((token) => {
        const { color, fontStyle, content } = token

        const cssDeclarations = [
          `color: ${color ?? options.foreground}`,
          ...(fontStyle && fontStyle & FontStyle.Italic ? ['font-style: italic'] : []),
          ...(fontStyle && fontStyle & FontStyle.Bold ? ['font-weight: bold'] : []),
          ...(fontStyle && fontStyle & FontStyle.Underline ? ['text-decoration: underline'] : [])
        ]

        append(
          `<div class="line-token" style="${cssDeclarations.join('; ')}">${escapeHtml(
            content
          )}</div>`
        )
      })
    } else {
      append(`<div class="line-token">&nbsp;</div>`)
    }

    // Close: line.
    append(`</div>`)
  })

  // Close: building the lines with code.
  append(`</div>`)

  // Close: building the code section.
  append(`</code>`)

  // Close: building.
  append(`</pre>`)

  return html()
}

function escapeHtml(html: string) {
  // prettier-ignore
  const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;'
}

  return html.replace(/[&<>"']/g, (char) => htmlEscapes[char])
}

function isPlainText(tokens: Array<Array<IThemedToken>>): boolean {
  const [line] = tokens ?? [[]]
  const [token] = line ?? []

  const hasSingleLine = tokens.length === 1
  const hasSingleToken = line && line.length === 1
  const hasContentOnly = token && !token.color && !token.fontStyle && !!token.content

  return hasSingleLine && hasSingleToken && hasContentOnly
}

function transformPlainText(tokens: Array<Array<IThemedToken>>): Array<Array<IThemedToken>> {
  const [line] = tokens
  const [token] = line

  const strings = token.content.split('\n')

  const lines = strings
    .map<IThemedToken>((content) => ({ content }))
    .map<Array<IThemedToken>>((token) => (token.content.length ? [token] : []))

  return lines
}

function getLineClasses(lineOptions: Array<LineOption>): Array<string> {
  const lineClasses = new Set(['line'])

  for (const lineOption of lineOptions) {
    for (const lineClass of lineOption.classes ?? []) {
      lineClasses.add(lineClass)
    }
  }

  return Array.from(lineClasses)
}
