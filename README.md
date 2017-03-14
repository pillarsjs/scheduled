# Scheduled

Esta librería permite programar tareas a ejecutar mediante un patrón de tiempo. Dispone de control de estado, conociendo en todo momento todas las tareas que se han programado en la propiedad *Scheduled.jobs* y pudiendo por lo tanto, realizar acciones sobre éstas.

Para crear una tarea se instancia un objeto de tipo Scheduled: 

```javascript
var Scheduled = require("scheduled");

var myJob = new Scheduled({
	id: "minuteTaskEven",
	pattern: "*/2", // Tarea a ejecutar cada dos minutos
	task: function(){
		console.log("Minuto par");
	}
}).start();

```
## Crear una tarea
Al instanciar el objeto para crea una tarea hay que definir un conjunto de propiedades:
+ **id**: String. Identificador de la tarea.
+ **pattern**: String. Patrón de tiempo en el que se ejecutará la tarea. Sigue el [formato cron](http://www.nncron.ru/help/EN/working/cron-format.htm).
+ **task**: function. Tarea a ejecutar.

```javascript
var myJob = new Scheduled({
	id: "minuteTaskEven",
	pattern: "*/2", 
	task: function(){
		console.log("Minuto par");
	}
}).start();

```


## Propiedades
### Scheduled.jobs
Propiedad estática.
Es de tipo *ObjectArray*, contiene todas las tareas que se han programado.  Cada vez que se crea un nueva tarea programada se inserta en Scheduled.jobs.

Al ser de tipo ObjectArray permite capturar mediante identificador una tarea y manipularla, entre muchas otras funcionalidades. [Ver ObjectArray](https://github.com/pillarsjs/ObjectArray).

### myJob.last
Última vez que se ejecutó la tarea. En caso de aún no haberse ejecutado, devolverá *undefined*.

### myJob.next
Próxima vez que se va a ejecutar la tarea. Si no se va a ejecutar más, devolverá *undefined*.

## Métodos
### Scheduled.close()
Método estático.
Para todas tareas programadas.

### myJob.start()
Inicia la programación de una tarea. Si no toca que se ejecute, no se ejecutará.

### myJob.stop();
Detiene la programación de una tarea.

### myJob.launch();
Ejecuta una tarea sin iniciar su programación.

### myJob.clear();
Elimina la tarea de Scheduled.jobs.


