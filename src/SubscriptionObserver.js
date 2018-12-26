/* @flow */

import type { Observer } from './Observer'
import type { Subscription } from './Subscription'

import { getSet } from './getSet'

const [getSubscription, setSubscription] = getSet<
  /* :: SubscriptionObserver<any>, */
  Subscription<any>,
>('subscription')

const [getNext, setNext] = getSet<
  /* :: SubscriptionObserver<any>, */
  (any) => mixed,
>('next')

const [getError, setError] = getSet<
  /* :: SubscriptionObserver<any>, */
  (Error) => mixed,
>('error')

const [getComplete, setComplete] = getSet<
  /* :: SubscriptionObserver<any>, */
  () => mixed,
>('next')

const emptyFn = () => {}

export const cleanupSubscriptionObserver = <T>(
  observer: SubscriptionObserver<T>,
) => {
  setNext(observer, emptyFn)
  setError(observer, emptyFn)
  setComplete(observer, emptyFn)
}

export class SubscriptionObserver<T> {
  constructor(observer: Observer<T>, subscription: Subscription<T>) {
    const { next, error, complete } = observer
    setNext(this, typeof next == 'function' ? next.bind(observer) : emptyFn)
    setError(this, typeof error == 'function' ? error.bind(observer) : emptyFn)
    setComplete(
      this,
      typeof complete == 'function' ? complete.bind(observer) : emptyFn,
    )
    setSubscription(this, subscription)
  }

  next(value: T): void {
    getNext(this)(value)
  }

  error(errorValue: Error): void {
    getError(this)(errorValue)
    getSubscription(this).unsubscribe()
  }

  complete(): void {
    getComplete(this)()
    getSubscription(this).unsubscribe()
  }

  get closed(): boolean {
    return getSubscription(this).closed
  }
}
