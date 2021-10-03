import tape from 'tape';
import { parametrizeSync } from 'js-parametrize'

import * as SUT from './utils'
import { MATCH_SEQUENCE_RESULT_TYPE } from './constants'
import { MatchSequenceMismatchError, MatchSequencePartialMatchError } from './errors'

tape ('test.utils', (t) => {
  t.test ('matchSequence', (t) => {
    parametrizeSync ([
      // mismatch
      [['a'], [], { type: MATCH_SEQUENCE_RESULT_TYPE.MISMATCH, mismatched: ['a'], unmatched: [] }], // deviation from empty expected
      [['a', 'b', 'd'], ['a', 'b', 'c'], { type: MATCH_SEQUENCE_RESULT_TYPE.MISMATCH, mismatched: ['d'], unmatched: [] }], // actual deviates from expected before last expected
      [['a', 'c', 'b'], ['a', 'b', 'c'], { type: MATCH_SEQUENCE_RESULT_TYPE.MISMATCH, mismatched: ['c'], unmatched: [] }], // same actions but different order TODO: mention order is the problem
      // partial match
      [[], ['a'], { type: MATCH_SEQUENCE_RESULT_TYPE.PARTIAL_MATCH, mismatched: [], unmatched: ['a'] }], // always skip id empty actual
      [['a', 'b'], ['a', 'b', 'c', 'd', 'e'], { type: MATCH_SEQUENCE_RESULT_TYPE.PARTIAL_MATCH, mismatched: [], unmatched: ['c', 'd', 'e'] }], // actual matches expected, but more expected
      // match
      [[], [], { type: MATCH_SEQUENCE_RESULT_TYPE.MATCH, mismatched: [], unmatched: [] }], // always pass if both actual & expected are empty
      [['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], { type: MATCH_SEQUENCE_RESULT_TYPE.MATCH, mismatched: [], unmatched: [] }], // perfect match
    ], (actual, expected, expectedResult) => {
      // when ... we assert on the provided sequence
      // then ... should result as expected
      const result = SUT.matchSequence (actual, expected)
      t.same (result, expectedResult)
    })
    t.end ()
  })

  t.test ('matchSequenceThrows : success', (t) => {
    parametrizeSync ([
      [[], []], // always pass if both actual & expected are empty
      [['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd']], // perfect match
    ], (actual, expected) => {
      // when ... we assert on a matching sequence
      // then ... should succeed without error
      const result = SUT.matchSequenceThrow (actual, expected)
      t.same (result, null)
    })
    t.end ()
  })

  t.test ('matchSequenceThrow : failure', (t) => {
    parametrizeSync ([
      // mismatch
      [['a'], [], MatchSequenceMismatchError], // deviation from empty expected
      [['a', 'b', 'd'], ['a', 'b', 'c'], MatchSequenceMismatchError], // actual deviates from expected before last expected
      [['a', 'c', 'b'], ['a', 'b', 'c'], MatchSequenceMismatchError], // same actions but different order TODO: mention order is the problem
      // partial match
      [[], ['a'], MatchSequencePartialMatchError], // always skip id empty actual
      [['a', 'b'], ['a', 'b', 'c', 'd', 'e'], MatchSequencePartialMatchError], // actual matches expected, but more expected
    ], (actual, expected, expectedError) => {
      // when ... we assert on a non-matching sequence
      // then ... should throw the expected error
      t.throws (() => SUT.matchSequenceThrow (actual, expected), expectedError)
    })
    t.end ()
  })
  t.end ()
})
