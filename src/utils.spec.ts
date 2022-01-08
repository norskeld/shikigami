import { merge } from './utils'

describe(merge, () => {
  it('should merge two shallow objects', () => {
    const actual = merge({ one: 'one', two: 'two' }, { one: '1', three: '3' })
    const expected = { one: '1', two: 'two', three: '3' }

    expect(actual).toEqual(expected)
  })

  it('should merge two nested objects with primitive values', () => {
    const actual = merge(
      {
        withLanguage: false,
        withLineNumbers: false,
        highlighter: {
          theme: 'nord'
        }
      },
      {
        withLanguage: true,
        highlighter: {
          theme: 'norskeld'
        }
      }
    )

    const expected = {
      withLanguage: true,
      withLineNumbers: false,
      highlighter: {
        theme: 'norskeld'
      }
    }

    expect(actual).toEqual(expected)
  })

  it('should merge two nested objects with compound values', () => {
    const actual = merge(
      {
        withLanguage: false,
        withLineNumbers: false,
        highlight: [],
        highlighter: {
          theme: 'nord'
        }
      },
      {
        withLanguage: true,
        highlight: [1, [2, 3]],
        highlighter: {
          theme: 'norskeld',
          langs: ['eon', 'fsharp']
        }
      }
    )

    const expected = {
      withLanguage: true,
      withLineNumbers: false,
      highlight: [1, [2, 3]],
      highlighter: {
        theme: 'norskeld',
        langs: ['eon', 'fsharp']
      }
    }

    expect(actual).toEqual(expected)
  })

  it('should merge complex objects', () => {
    const actual = merge(
      {
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
      },
      {
        withLanguage: true,
        withLineNumbers: true,
        highlightInvert: true,
        highlighter: {
          theme: 'github-dark'
        }
      }
    )

    const expected = {
      openToken: '{{',
      closeToken: '}}',
      withLanguage: true,
      withLineNumbers: true,
      highlight: [],
      highlightClasses: ['highlight'],
      highlightRangeClasses: ['highlight-start', 'highlight-inner', 'highlight-end'],
      highlightInvert: true,
      highlightInvertClasses: ['highlight-invert'],
      highlighter: {
        theme: 'github-dark'
      }
    }

    expect(actual).toEqual(expected)
  })
})
