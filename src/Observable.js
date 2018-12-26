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
  +subscribe: ((observer: Observer<T>) => SubscriptionLike<T>) &
    ((
      onNext: (T) => mixed,
      onError?: (T) => mixed,
      onComplete?: () => mixed,
    ) => SubscriptionLike<T>),
  +[SymbolObservable]: () => ObservableLike<T>,
}

export type Subscriber<T> = (
  observer: SubscriptionObserver<T>,
) => SubscriptionLike<any> | (() => void)

const [getSubscriber, setSubscriber] = getSet<
  /* ::Observable<any>, */
  Subscriber<any>,
>('Subscriber')

const emptyFn = () => {}

const fromArray = <T>(items: $ReadOnlyArray<T>): ObservableLike<T> =>
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
  static of<V>(...items: $ReadOnlyArray<V>): ObservableLike<V> {
    return fromArray(items)
  }

  static from<V>(
    values: ObservableCompatible<V> | Iterable<V>,
  ): ObservableLike<V> {
    if (values instanceof Observable) return values

    if (typeof (values: any)[$$observable] == 'function') {
      const result: ObservableLike<V> = (values: any)[$$observable]()

      return result instanceof Observable
        ? result
        : new Observable(observer => result.subscribe(observer))
    }

    if (Array.isArray(values)) return fromArray(values)

    if (typeof (values: any)[Symbol.iterator] == 'function') {
      return new Observable(observer => {
        const iterator: Iterator<V> = (values: any)[Symbol.iterator]()

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

  /* ::
  static +from: (<V>(values: ObservableCompatible<V>) => ObservableLike<V>) &
    (<V>(values: Iterable<V>) => ObservableLike<V>)
  */

  constructor<V>(subscriber: Subscriber<V>): ObservableLike<V> {
    setSubscriber(this, subscriber)
    /* ::
    declare var instance: ObservableLike<V>;
    return instance
    */
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
