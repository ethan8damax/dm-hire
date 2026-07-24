import assert from 'node:assert/strict'
import { clampIndex } from '../src/components/why/clampIndex.js'

// prev is a no-op at the first index
assert.equal(clampIndex(0, -1, 5), 0)

// next is a no-op at the last index
assert.equal(clampIndex(4, 1, 5), 4)

// normal prev/next move by one
assert.equal(clampIndex(2, -1, 5), 1)
assert.equal(clampIndex(2, 1, 5), 3)

// single-item list clamps both directions
assert.equal(clampIndex(0, 1, 1), 0)
assert.equal(clampIndex(0, -1, 1), 0)

console.log('why-walkthrough clampIndex: all checks passed')
