import { join } from 'node:path'

import { openStore } from './store.js'

/**
 * The Photos the Gallery holds.
 *
 * Slice 2 backed this with an in-memory array and a `seedPhotos` test seam,
 * because the store did not exist. It does now, so the seam is gone: tests
 * point this at a throwaway store instead.
 */

/** How many tiles the first render may contain. */
export const PAGE_SIZE = 24

/** Where Photos live when nothing says otherwise. */
export const DEFAULT_DATA_DIR = process.env.PHOTO_DATA_DIR ?? join(process.cwd(), 'data')

let store = null

/** Points the Gallery at a store. Used by tests and at startup. */
export const useStore = (next) => {
  store = next
}

export const getStore = () => {
  store ??= openStore({ directory: DEFAULT_DATA_DIR })
  return store
}

/** Photos newest Upload first, bounded to one page. */
export const listPhotos = ({ limit = PAGE_SIZE, offset = 0 } = {}) =>
  getStore().listPhotos({ limit, offset })

/** How many Photos are held in total. */
export const countPhotos = () => getStore().countPhotos()
