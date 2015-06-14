textualization = {
  'error': "Error en tarea programada: ".red+", id> '{job.id}', pattern> '{job.pattern}' ".yellow,
  'new': "Nueva tarea programada: ".green+", id> '{job.id}', pattern> '{job.pattern}' ".yellow,
  'start': "Iniciada tarea programada: ".cyan+", id> '{job.id}', pattern> '{job.pattern}', próxima llamada> {job.next}".yellow,
  'restart': "Reiniciada tarea programada: ".cyan+", id> '{job.id}', pattern> '{job.pattern}', próxima llamada> {job.next}".yellow,
  'stop': "Tarea programada parada: ".cyan+", id> '{job.id}', pattern> '{job.pattern}', última llamada> {job.last}".yellow,
  'launch': "Lanzando tarea programada: ".green+", id> '{job.id}', pattern> '{job.pattern}'".yellow,
  'clear': "Tarea programada borrada: ".cyan+", id> '{job.id}', pattern> '{job.pattern}'".yellow,
  'close': "Detenidas todas las tareas programadas".cyan
};