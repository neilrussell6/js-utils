import { compose, length, maxBy, nth, isNil, slice, complement, equals, cond, propEq, join, T } from 'ramda';

function MatchSequencePartialMatchError (message = '') {
  this.name = 'MatchSequencePartialMatchError';
  this.message = message;
  const error = new Error (this.message);
  error.name = this.name;
  this.stack = error.stack;
}
MatchSequencePartialMatchError.prototype = Object.create (Error.prototype);

function MatchSequenceMismatchError (message = '') {
  this.name = 'MatchSequenceMismatchError';
  this.message = message;
  const error = new Error (this.message);
  error.name = this.name;
  this.stack = error.stack;
}
MatchSequenceMismatchError.prototype = Object.create (Error.prototype);

const MATCH_SEQUENCE_RESULT_TYPE = {
  MISMATCH: 'mismatch',
  PARTIAL_MATCH: 'partial match',
  MATCH: 'match',
};

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
const matchSequence = (xs, ys) => {
  const maxLength = compose (length, maxBy (length) (xs)) (ys);
  for (let i = 0; i < maxLength; i ++) {
    const x = nth (i) (xs);
    const y = nth (i) (ys);
    if (isNil (x)) {
      const remainingYs = slice (i) (Infinity) (ys);
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
};

/**
 * matchSequenceThrow
 *
 * Compares 2 string arrays expecting all items the second array to exist in the first array
 *
 * @param {string[]} xs
 * @param {string[]} ys
 * @returns null | MatchSequencePartialMatchError | MatchSequenceMismatchError
 */
const matchSequenceThrow = (xs, ys) => {
  const result = matchSequence (xs, ys);
  return cond ([
    [propEq ('type') (MATCH_SEQUENCE_RESULT_TYPE.PARTIAL_MATCH), ({ unmatched }) => {
      const message = `sequence partially matches, unmatched: ${join (', ') (unmatched)}`;
      throw new MatchSequencePartialMatchError (message)
    }],
    [propEq ('type') (MATCH_SEQUENCE_RESULT_TYPE.MISMATCH), ({ mismatched }) => {
      const message = `sequence contains mismatches: ${join (', ') (mismatched)}`;
      throw new MatchSequenceMismatchError (message)
    }],
    [T, () => null],
  ]) (result)
};

export { MATCH_SEQUENCE_RESULT_TYPE, MatchSequenceMismatchError, MatchSequencePartialMatchError, matchSequence, matchSequenceThrow };
