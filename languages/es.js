textualization = {
  'error': "Error en tarea programada: ".red+" id:'{job.id}' pattern:'{job.pattern}' ".yellow+"\n\n{error}\n".bgRed,
  'new': "Nueva tarea programada: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' ".yellow,
  'start': "Iniciada tarea programada: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' próxima llamada:{job.next}".yellow,
  'stop': "Tarea programada parada: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' última llamada:{job.last}".yellow,
  'launch': "Lanzando tarea programada: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' última llamada:{job.last}".yellow,
  'clear': "Tarea programada borrada: ".cyan+" id:'{job.id}' pattern: '{job.pattern}' última llamada:{job.last}".yellow
};