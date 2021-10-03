'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ramda = require('ramda');

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
  const maxLength = ramda.compose (ramda.length, ramda.maxBy (ramda.length) (xs)) (ys);
  for (let i = 0; i < maxLength; i ++) {
    const x = ramda.nth (i) (xs);
    const y = ramda.nth (i) (ys);
    if (ramda.isNil (x)) {
      const remainingYs = ramda.slice (i) (Infinity) (ys);
      return { type: MATCH_SEQUENCE_RESULT_TYPE.PARTIAL_MATCH, unmatched: remainingYs, mismatched: [] }
    }
    if (ramda.complement (ramda.equals) (x) (y)) {
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
  return ramda.cond ([
    [ramda.propEq ('type') (MATCH_SEQUENCE_RESULT_TYPE.PARTIAL_MATCH), ({ unmatched }) => {
      const message = `sequence partially matches, unmatched: ${ramda.join (', ') (unmatched)}`;
      throw new MatchSequencePartialMatchError (message)
    }],
    [ramda.propEq ('type') (MATCH_SEQUENCE_RESULT_TYPE.MISMATCH), ({ mismatched }) => {
      const message = `sequence contains mismatches: ${ramda.join (', ') (mismatched)}`;
      throw new MatchSequenceMismatchError (message)
    }],
    [ramda.T, () => null],
  ]) (result)
};

exports.MATCH_SEQUENCE_RESULT_TYPE = MATCH_SEQUENCE_RESULT_TYPE;
exports.MatchSequenceMismatchError = MatchSequenceMismatchError;
exports.MatchSequencePartialMatchError = MatchSequencePartialMatchError;
exports.matchSequence = matchSequence;
exports.matchSequenceThrow = matchSequenceThrow;
