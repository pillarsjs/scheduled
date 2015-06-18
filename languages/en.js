({
  'error': "Scheduled job error: ".red+", id> '{job.id}', pattern> '{job.pattern}' ".yellow,
  'new': "New scheduled job: ".green+", id> '{job.id}', pattern> '{job.pattern}' ".yellow,
  'start': "Scheduled job start: ".cyan+", id> '{job.id}', pattern> '{job.pattern}', next execution> {job.next}".yellow,
  'restart': "Scheduled job restart: ".cyan+", id> '{job.id}', pattern> '{job.pattern}', next execution> {job.next}".yellow,
  'stop': "Scheduled job stop: ".cyan+", id> '{job.id}', pattern> '{job.pattern}', last execution> {job.last}".yellow,
  'launch': "Scheduled job launch: ".green+", id> '{job.id}', pattern> '{job.pattern}'".yellow,
  'clear': "Scheduled job removed: ".cyan+", id> '{job.id}', pattern> '{job.pattern}'".yellow,
  'close': "All scheduled jobs stoped".cyan
})