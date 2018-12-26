/* @flow */

import $$observable, { type SymbolObservable } from 'symbol-observable'

import type { Observer } from './Observer'
import { Subscription, type SubscriptionLike } from './Subscription'
import { SubscriptionObserver } from './SubscriptionObserver'
import { getSet } from './getSet'

export type ObservableCompatible<T> = {
  +[SymbolObservable]: () => ObservableLike<T>,
}

export type ObservableLike<T> = {
  subscribe(
    onNext: (T) => mixed,
    onError?: (Error) => mixed,
    onComplete?: () => mixed,
  ): SubscriptionLike<T>,

  subscribe(observer: Observer<T>): SubscriptionLike<T>,

  +[typeof $$observable]: () => ObservableLike<T>,
}

export type Subscriber<T> = (
  observer: SubscriptionObserver<T>,
) => SubscriptionLike<any> | (() => void)

const [getSubscriber, setSubscriber] = getSet<
  /* ::Observable<any>, */
  Subscriber<any>,
>('Subscriber')

const emptyFn = () => {}

const fromArray = <T>(items: $ReadOnlyArray<T>): Observable<T> =>
  new Observable(observer => {
    try {
      items.forEach(value => observer.next(value))
      observer.complete()
    } catch (e) {
      observer.error(e)
    }

    return emptyFn
  })

export class Observable<T> {
  static of<V>(...items: $ReadOnlyArray<V>): Observable<V> {
    return fromArray(items)
  }

  /* :: static from: <V>(values: ObservableCompatible<V> | Iterable<V>) => Observable<V> */

  static from<V>(values: any): Observable<V> {
    if (values instanceof Observable) return values

    if (typeof values[$$observable] == 'function') {
      const result: ObservableLike<V> = values[$$observable]()

      return result instanceof Observable
        ? result
        : new Observable(observer => result.subscribe(observer))
    }

    if (Array.isArray(values)) return fromArray(values)

    if (typeof values[Symbol.iterator] == 'function') {
      return new Observable(observer => {
        const iterator: Iterator<V> = values[Symbol.iterator]()

        let current = iterator.next()

        while (!current.done) {
          observer.next(current.value)
          current = iterator.next()
        }

        observer.complete()

        return emptyFn
      })
    }

    throw new TypeError('values must be an Array, Observable or Iterable')
  }

  constructor(subscriber: Subscriber<T>) {
    setSubscriber(this, subscriber)
  }

  /* ::
  +subscribe: ((Observer<T>) => Subscription<T>) &
    ((
      onNext: (T) => mixed,
      onError?: (T) => mixed,
      onComplete?: () => mixed,
    ) => Subscription<T>)
  */

  subscribe(
    onNext: Observer<T> | (T => mixed),
    onError?: Error => mixed,
    onComplete?: () => mixed,
  ): Subscription<T> {
    const observer: {
      +start?: (Subscription<T>) => mixed,
      +next?: T => mixed,
      +error?: Error => mixed,
      +complete?: () => mixed,
    } =
      typeof onNext == 'function'
        ? {
            next: onNext,
            error: onError,
            complete: onComplete,
          }
        : onNext

    return new Subscription(observer, getSubscriber(this))
  }

  // $FlowFixMe
  [$$observable](): Observable<T> {
    return this
  }
}
