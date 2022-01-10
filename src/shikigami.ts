import { getHighlighter, loadTheme, type IThemedToken } from 'shiki'
import { PluginSimple } from 'markdown-it'

import { type ShikigamiOptions, type HighlightRangeClasses } from './shikigami.options'
import { getDefaultOptions, mergeOptions } from './shikigami.options'

import { type LineOption } from './renderer.options'
import { renderToHtml } from './renderer'

interface CreateLineOptions {
  classes: Array<string>
  rangeClasses: HighlightRangeClasses
  invertClasses: Array<string>
}

interface ExtractMetaOptions {
  openToken: string
  closeToken: string
}

/** Options available in extended Markdown syntax. */
interface MetaPojo {
  withLanguage?: boolean
  withLineNumbers?: boolean
  highlight?: Array<number | Array<number>>
  highlightInvert?: boolean
}

interface ExtractedMeta {
  meta: MetaPojo
  languageId: string
}

async function shikigami(userOptions: ShikigamiOptions = {}): Promise<PluginSimple> {
  const options = mergeOptions(getDefaultOptions(), userOptions)
  const highlighter = await getHighlighter(options.highlighter)

  return function plugin(md) {
    if (md.renderer.rules.fence) {
      md.renderer.rules.fence = (markdownTokens, markdownTokenIndex) => {
        const markdownToken = markdownTokens[markdownTokenIndex]
        const markdownContent = markdownToken.content.trim()

        const { meta, languageId } = extractMeta(markdownToken.info.trim(), {
          openToken: options.openToken,
          closeToken: options.closeToken
        })

        const withLanguage = options.withLanguage
        const withLineNumbers = meta.withLineNumbers ?? options.withLineNumbers

        const themedTokensRaw = highlighter.codeToThemedTokens(markdownContent, languageId)
        const themedTokens = filterOutTrailingEmptyTokens(themedTokensRaw)

        const lineOptions = createLineOptions(
          themedTokens.length,
          meta.highlight ?? options.highlight,
          {
            classes: options.highlightClasses,
            rangeClasses: options.highlightRangeClasses,
            invertClasses: options.highlightInvert ? options.highlightInvertClasses : []
          }
        )

        const foreground = highlighter.getForegroundColor()
        const background = highlighter.getBackgroundColor()

        return renderToHtml(themedTokens, {
          withLanguage,
          withLineNumbers,
          languageId,
          lineOptions,
          foreground,
          background
        })
      }
    }
  }
}

function filterOutTrailingEmptyTokens(
  sourceTokens: Array<Array<IThemedToken>>
): Array<Array<IThemedToken>> {
  const { tokens } = sourceTokens.reduceRight(
    ({ tokens, hitNonEmpty }, next) =>
      !hitNonEmpty
        ? next.length
          ? { hitNonEmpty: true, tokens: [next, ...tokens] }
          : { hitNonEmpty, tokens }
        : { hitNonEmpty, tokens: [next, ...tokens] },
    { tokens: [] as Array<Array<IThemedToken>>, hitNonEmpty: false }
  )

  return tokens
}

function extractMeta(source: string, { openToken, closeToken }: ExtractMetaOptions): ExtractedMeta {
  const hasOpenBraces = source.includes(openToken)
  const hasCloseBraces = source.includes(closeToken)

  switch (true) {
    case hasOpenBraces && hasCloseBraces: {
      const pos = {
        start: source.indexOf(openToken),
        end: source.lastIndexOf(closeToken)
      }

      const metaRaw = source.substring(pos.start + openToken.length, pos.end).trim()
      const languageId = source.substring(0, pos.start).trim()

      try {
        // NOTE: Bruteforce and low-effort solution.
        const resolveToMetaPojo = new Function(`return { ${metaRaw} }`)

        const metaPojo: MetaPojo = resolveToMetaPojo()
        const meta: MetaPojo = sanitizeMetaPojo(metaPojo)

        return {
          meta,
          languageId
        }
      } catch {
        return {
          meta: {},
          languageId
        }
      }
    }

    default: {
      const languageId = source.substring(0, source.length)

      return {
        meta: {},
        languageId
      }
    }
  }
}

function sanitizeMetaPojo(metaPojo: MetaPojo): MetaPojo {
  const ALLOWED_KEYS = ['withLanguage', 'withLineNumbers', 'highlight', 'highlightInvert'].map(
    (key) => key.toLowerCase()
  )

  return Object.entries(metaPojo)
    .filter(([key]) => ALLOWED_KEYS.includes(key.toLowerCase()))
    .reduce<MetaPojo>((acc, [key, value]) => ({ ...acc, [key]: value }), {})
}

function createLineOptions(
  sourceLinesAmount: number,
  highlightLines: Array<number | Array<number>>,
  { classes, rangeClasses, invertClasses }: CreateLineOptions
): Array<LineOption> {
  const highlightedLines = highlightLines.reduce<Array<LineOption>>(
    (acc, next) =>
      Array.isArray(next)
        ? [...acc, ...mapRange(next, rangeClasses)]
        : [...acc, ...mapFlat([next], classes)],
    []
  )

  const sourceLines =
    sourceLinesAmount && highlightedLines.length
      ? Array.from({ length: sourceLinesAmount }, (_, index) => ({
          line: index + 1,
          classes: invertClasses
        })).filter(
          (sourceLine) =>
            !highlightedLines.some((highlightedLine) => highlightedLine.line === sourceLine.line)
        )
      : []

  return [...sourceLines, ...highlightedLines]
}

function mapFlat(lines: Array<number>, classes: Array<string>) {
  return lines.map<LineOption>((line) => ({ line, classes }))
}

function mapRange(
  [start, end]: Array<number>,
  [startClass, innerClass, endClass]: HighlightRangeClasses
) {
  const length = Math.abs(end - start) + 1
  const isAscending = start <= end

  const lines = Array.from({ length }, (_, index) => (isAscending ? index + start : start - index))

  const rangeStart = lines.slice(0, 1)
  const rangeInner = lines.length > 2 ? lines.slice(1, -1) : []
  const rangeEnd = lines.slice(-1)

  return [
    ...mapFlat(rangeStart, [startClass]),
    ...mapFlat(rangeInner, [innerClass]),
    ...mapFlat(rangeEnd, [endClass])
  ]
}

export { loadTheme, shikigami }
