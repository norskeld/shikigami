import { type HighlighterOptions } from 'shiki'

import { merge } from './utils'

export type HighlightRangeClasses = [start: string, inner: string, end: string]

/** Plugin options used internally. */
export type ShikigamiDefaultOptions = Required<ShikigamiOptions>

/** Plugin options. */
export interface ShikigamiOptions {
  /**
   * Use this option to change the opening token for extended Markdown syntax.
   *
   * @defaultValue '{{'
   */
  openToken?: string

  /**
   * Use this option to change the closing token for extended Markdown syntax.
   *
   * @defaultValue '}}'
   */
  closeToken?: string

  /**
   * Set to `true` to render language specified in a fenced code block. This is useful when you
   * want to show the language specified in your fenced code block.
   *
   * @defaultValue false
   */
  withLanguage?: boolean

  /**
   * Set to `true` to render line numbers.
   *
   * @defaultValue false
   */
  withLineNumbers?: boolean

  /**
   * Use this option to specify which lines or ranges of lines should be marked with specified
   * highlighting class (or classes). These classes can be customized via `highlightClasses` and
   * `highlightRangeClasses` options.
   *
   * @defaultValue []
   *
   * @example
   *
   * Highlight lines **5** and **7**:
   * ```
   * {{ highlight: [5, 7] }}
   * ```
   *
   * Highlight lines **5**, **7**, and lines in range from **10** to **15**:
   * ```
   * {{ highlight: [5, 7, [10, 15]] }}
   * ```
   */
  highlight?: Array<number | Array<number>>

  /**
   * Use this option to customize classes for highlighted lines.
   *
   * @defaultValue ['highlight']
   */
  highlightClasses?: Array<string>

  /**
   * Use this option to customize classes for highlighted ranges. Must be a tuple of exactly three
   * elements.
   *
   * @defaultValue ['highlight-start', 'highlight-inner', 'highlight-end']
   */
  highlightRangeClasses?: HighlightRangeClasses

  /**
   * Set to `true` to allow marking lines that are not highlighted with specified classes. These
   * classes can be customised via `highlightInvertClasses`.
   *
   * **Note: this will work only if `highlight` option is set to a non-empty array of lines.**
   *
   * @defaultValue false
   */
  highlightInvert?: boolean

  /**
   * Use this option to customize classes for unhighlighted lines.
   *
   * @defaultValue ["highlight-invert"]
   */
  highlightInvertClasses?: Array<string>

  /**
   * Highlighter options which will be passed right into shiki's `getHighlighter`. See
   * [shiki documentation](https://shiki.matsu.io) for available options.
   *
   * @defaultValue {}
   */
  highlighter?: HighlighterOptions
}

export function mergeOptions(
  defaults: ShikigamiDefaultOptions,
  user: ShikigamiOptions
): ShikigamiDefaultOptions {
  return merge(defaults, user)
}

export function getDefaultOptions(): ShikigamiDefaultOptions {
  return {
    openToken: '{{',
    closeToken: '}}',
    withLanguage: false,
    withLineNumbers: false,
    highlight: [],
    highlightClasses: ['highlight'],
    highlightRangeClasses: ['highlight-start', 'highlight-inner', 'highlight-end'],
    highlightInvert: false,
    highlightInvertClasses: ['highlight-invert'],
    highlighter: {}
  }
}
