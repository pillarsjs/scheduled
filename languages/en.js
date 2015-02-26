textualization = {
  'error': "Scheduled job error: ".red+" id:'{job.id}' pattern:'{job.pattern}' ".yellow+"\n\n{error}\n".bgRed,
  'new': "New scheduled job: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' ".yellow,
  'start': "Scheduled job start: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' next execution:{job.next}".yellow,
  'stop': "Scheduled job stop: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' last execution:{job.last}".yellow,
  'launch': "Scheduled job launch: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' last execution:{job.last}".yellow,
  'clear': "Scheduled job removed: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' last execution:{job.last}".yellow
};