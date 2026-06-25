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

## Decisiones Ya Tomadas

- Se priorizo mantener los datos actuales dentro del proyecto para no depender de un servidor externo.
- La app debe poder abrirse desde otras PCs de la red local.
- `SESSION_COOKIE_SECURE="false"` se usa para permitir acceso por `http` en red local.

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
