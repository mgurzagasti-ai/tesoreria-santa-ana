# Memoria Del Proyecto

## Objetivo

Este archivo guarda el contexto estable del proyecto para retomar trabajo sin volver a revisar todo desde cero.

## Estado Actual

- Proyecto principal: migracion de `Tesoreria Santa Ana` a una version web con `Next.js`.
- La app escucha en red local por `0.0.0.0:3008`.
- La base actual usada por la app web es `SQLite`.
- Archivo de base actual: `prisma/dev.db`.
- El archivo `.env` usa `DATABASE_URL="file:./dev.db"`.
- Hay instructivo para instalar en otra PC: `INSTRUCTIVO_INSTALACION_PC_NUEVA.md`.
- Existe script de arranque: `start-app-jorge.cmd`.
- Existe lanzador oculto: `start-app-jorge-hidden.vbs`.
- La pantalla de importacion operativa para Excel es `/haberes`.
- El flujo vigente de importacion Excel se separa en dos pestanas: `Carga de haberes` y `Carga de descuentos`.
- El Excel operativo esperado para `/haberes` ahora puede ser simple: `legajo`, `apellido y nombre`, `monto`.
- En `/haberes` la operadora puede elegir un concepto del maestro o usar `Concepto manual` y escribir la descripcion que quiera aplicar a toda la carga.

## Decisiones Ya Tomadas

- Se priorizo mantener los datos actuales dentro del proyecto para no depender de un servidor externo.
- La app debe poder abrirse desde otras PCs de la red local.
- `SESSION_COOKIE_SECURE="false"` se usa para permitir acceso por `http` en red local.
- La operadora no debe depender de codigos manuales para importar Excel; el sistema debe clasificar por conceptos que suman o restan.
- Para importacion Excel:
  `Carga de haberes` debe tomar conceptos que suman, como `Neto a cobrar`, `Sueldos`, `Aguinaldo` y `SAC`.
  `Carga de descuentos` debe tomar los conceptos que restan, como anticipos, vales y otros descuentos.
- Si se usa `Concepto manual`, la descripcion escrita por la operadora debe verse luego en `Saldos` y en los detalles imprimibles, sin prefijos tecnicos como `MANUAL -`.

## Cosas Importantes A Recordar

- Reiniciar la PC no borra los cambios guardados en archivos ni en `prisma/dev.db`.
- Si la PC se reinicia, la app deja de estar corriendo hasta volver a iniciarla.
- Para que otras PCs la vean, esta PC debe estar encendida y la app debe estar ejecutandose.
- Para entrar desde otra PC se debe usar `http://IP-DE-ESTA-PC:3008`.
- `SQLite` sirve para uso local o liviano, pero si varias PCs van a operar al mismo tiempo conviene evaluar una base servidor.

## Forma De Trabajo Recomendada

- Antes de arrancar una nueva sesion, leer primero este archivo.
- Despues de cada cambio importante, agregar una nota breve en `SESSION_LOG.md`.
- Si se toma una decision tecnica nueva, actualizar este archivo para que quede como contexto estable.

## Proxima Revision Sugerida

- Confirmar si queremos autoarranque de la app al iniciar Windows.
- Confirmar si la app sera usada por una sola PC a la vez o por varias al mismo tiempo.
- Evaluar si conviene borrar del codigo la ruta vieja `/movimientos/exportar`, porque ya no se usa en la pantalla principal aunque todavia existe en el proyecto.
