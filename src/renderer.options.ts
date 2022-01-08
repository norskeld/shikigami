import { merge } from './utils'

export interface LineOption {
  /** Line number. **1-based**. */
  line: number

  /** Line's classes list. */
  classes: Array<string>
}

export type HtmlRendererDefaultOptions = Required<HtmlRendererOptions>

export interface HtmlRendererOptions {
  /**
   * Set to `true` to render language specified in a fenced code block.
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
   * Use this to assign classes for specific lines.
   *
   * @defaultValue []
   */
  lineOptions?: Array<LineOption>

  /**
   * Use this to change rendered language (if enabled).
   *
   * @defaultValue ''
   */
  languageId?: string

  /**
   * Use this to override text color for unstyled tokens.
   *
   * @defaultValue "#000"
   */
  foreground?: string

  /**
   * Use this to override background color for the whole `<pre>` block.
   *
   * @defaultValue "#fff"
   */
  background?: string
}

export function mergeOptions(
  defaults: HtmlRendererDefaultOptions,
  user: HtmlRendererOptions
): HtmlRendererDefaultOptions {
  return merge(defaults, user)
}

export function getDefaultOptions(): HtmlRendererDefaultOptions {
  return {
    withLanguage: false,
    withLineNumbers: false,
    languageId: '',
    lineOptions: [],
    foreground: '#000',
    background: '#fff'
  }
}
