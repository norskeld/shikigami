// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string, any>

function isObject(item: unknown): boolean {
  return !!item && typeof item === 'object' && !Array.isArray(item)
}

function hasOwn(target: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key)
}

export function merge<T extends AnyObject, U extends AnyObject>(target: T, source: T): U {
  const output = { ...target }

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!hasOwn(target, key)) {
          Object.assign(output, {
            [key]: source[key]
          })
        } else {
          Object.assign(output[key], merge(target[key], source[key]))
        }
      } else {
        Object.assign(output, {
          [key]: source[key]
        })
      }
    })
  }

  return output as U
}

export function groupBy<T, K>(elements: Array<T>, getter: (element: T) => K): Map<K, Array<T>> {
  const map = new Map<K, Array<T>>()

  for (const element of elements) {
    const key = getter(element)

    if (map.has(key)) {
      const group = map.get(key)

      if (group) {
        group.push(element)
      }
    } else {
      map.set(key, [element])
    }
  }

  return map
}
