import { describe, expect, it } from 'vitest'

import { useBuilder } from './builder'

describe('useBuilder', () => {
  it('should return a getter and a setter functions', () => {
    const [getter, setter] = useBuilder()

    expect(getter).toBeInstanceOf(Function)
    expect(setter).toBeInstanceOf(Function)
  })

  it('should return a builder with initial values', () => {
    const [getter] = useBuilder(['one', 'two'])
    expect(getter()).toBe('onetwo')
  })

  it('should properly append values', () => {
    const [getter, setter] = useBuilder()

    setter('one')
    setter('two')

    expect(getter()).toBe('onetwo')
  })
})
