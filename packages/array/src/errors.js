export function MatchSequencePartialMatchError (message = '') {
  this.name = 'MatchSequencePartialMatchError'
  this.message = message
  const error = new Error (this.message)
  error.name = this.name
  this.stack = error.stack
}
MatchSequencePartialMatchError.prototype = Object.create (Error.prototype)

export function MatchSequenceMismatchError (message = '') {
  this.name = 'MatchSequenceMismatchError'
  this.message = message
  const error = new Error (this.message)
  error.name = this.name
  this.stack = error.stack
}
MatchSequenceMismatchError.prototype = Object.create (Error.prototype)
