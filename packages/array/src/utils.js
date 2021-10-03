import {
  complement,
  compose,
  equals,
  length,
  maxBy,
  nth,
  isNil,
  slice,
  cond,
  propEq,
  join,
  T,
} from 'ramda'

import { MatchSequenceMismatchError, MatchSequencePartialMatchError } from './errors'
import { MATCH_SEQUENCE_RESULT_TYPE } from './constants'

/**
 * @typedef {Object} MatchSequenceResult
 * @property {string} type - MATCH_SEQUENCE_RESULT_TYPE (MISMATCH | PARTIAL_MATCH | MATCH)
 * @property {string[]} unmatched - a list of unmatched items, ie. items in the expected list that where not in actual list
 * @property {string[]} mismatched - a list of mismatched actions, ie. items in the actual list that where not in expected list
 */

/**
 * matchSequence
 *
 * Compares 2 string arrays expecting all items the second array to exist in the first array
 *
 * @param {string[]} xs
 * @param {string[]} ys
 * @returns MatchSequenceResult
 */
export const matchSequence = (xs, ys) => {
  const maxLength = compose (length, maxBy (length) (xs)) (ys)
  for (let i = 0; i < maxLength; i ++) {
    const x = nth (i) (xs)
    const y = nth (i) (ys)
    if (isNil (x)) {
      const remainingYs = slice (i) (Infinity) (ys)
      return { type: MATCH_SEQUENCE_RESULT_TYPE.PARTIAL_MATCH, unmatched: remainingYs, mismatched: [] }
    }
    if (complement (equals) (x) (y)) {
      return { type: MATCH_SEQUENCE_RESULT_TYPE.MISMATCH, unmatched: [], mismatched: [x] }
    }
  }
  return {
    type: MATCH_SEQUENCE_RESULT_TYPE.MATCH,
    unmatched: [],
    mismatched: [],
  }
}

/**
 * matchSequenceThrow
 *
 * Compares 2 string arrays expecting all items the second array to exist in the first array
 *
 * @param {string[]} xs
 * @param {string[]} ys
 * @returns null | MatchSequencePartialMatchError | MatchSequenceMismatchError
 */
export const matchSequenceThrow = (xs, ys) => {
  const result = matchSequence (xs, ys)
  return cond ([
    [propEq ('type') (MATCH_SEQUENCE_RESULT_TYPE.PARTIAL_MATCH), ({ unmatched }) => {
      const message = `sequence partially matches, unmatched: ${join (', ') (unmatched)}`
      throw new MatchSequencePartialMatchError (message)
    }],
    [propEq ('type') (MATCH_SEQUENCE_RESULT_TYPE.MISMATCH), ({ mismatched }) => {
      const message = `sequence contains mismatches: ${join (', ') (mismatched)}`
      throw new MatchSequenceMismatchError (message)
    }],
    [T, () => null],
  ]) (result)
}
