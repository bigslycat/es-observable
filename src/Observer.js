/* @flow */

import type { Subscription } from './Subscription'

export type Observer<T> = {
  +start?: (subscription: Subscription<T>) => mixed,
  +next?: (value: T) => mixed,
  +error?: (errorValue: Error) => mixed,
  +complete?: () => mixed,
}
