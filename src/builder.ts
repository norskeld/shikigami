type SetterFn = (value: string) => void
type GetterFn = (separator?: string) => string

type Builder = [getter: GetterFn, setter: SetterFn]

/** Simple string builder. */
export function useBuilder(initial: Array<string> = []): Builder {
  const strings = Array.from(initial)

  const setterFn: SetterFn = (value: string) => strings.push(value)
  const getterFn: GetterFn = (separator = '') => strings.join(separator)

  return [getterFn, setterFn]
}
