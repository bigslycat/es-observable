/* @flow */

export type GetSet<O: Object, T> = [
  (instance: O) => T,
  (instance: O, value: T) => T,
]

declare export function getSet<O: Object, T>(keyName?: string): GetSet<O, T>

export function getSet(keyName) {
  const key = Symbol(keyName)
  return [
    instance => instance[key],
    (instance, value) => (instance[key] = value),
  ]
}
