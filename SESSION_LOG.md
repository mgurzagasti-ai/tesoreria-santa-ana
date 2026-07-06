# Session Log

## 2026-06-25

- Se confirmo que los cambios no se pierden al reiniciar la PC porque quedan guardados en archivos y en `prisma/dev.db`.
- Se confirmo que la app web esta configurada para escuchar por red local en `0.0.0.0:3008`.
- Se detecto que para acceso desde otras PCs la aplicacion debe estar corriendo en la PC principal.
- Se dejo `PROJECT_MEMORY.md` como contexto persistente para futuras sesiones.
- Se corrigio nuevamente `DATABASE_URL` para Prisma SQLite: debe ser `file:./dev.db` porque la ruta se resuelve desde `prisma/schema.prisma`; eso apunta correctamente a `prisma/dev.db`.
- Se ajusto el importador Excel de haberes para no interpretar numeros chicos como fechas validas; esto evitara casos donde un legajo como `987` termine mostrado como `1902-09-13`.
- Se alineo la ayuda del importador con el formato de Excel acordado: `fecha`, `legajo`, `empleado`, `concepto`, `periodo`, `importe`.
- Se simplifico el listado de `/haberes` quitando la columna `Categoria` para evitar confusion con el usuario final.
- Se corrigio la importacion de `APP.xlsx`: el `PERIODO` venia como fecha Excel (`2026-05-01`) y el sistema lo estaba leyendo mal. Se reparo el parser para interpretar fechas reales en la columna `periodo`.
- Se limpiaron los registros incorrectos de `APP.xlsx` en `prisma/dev.db` y se reinsertaron las 6 filas correctas con concepto `DIFERENCIAS`, fecha `2026-06-12` y periodo `mayo 2026`.
- Se fijo la regla de negocio para importaciones: solo `SUELDO/HABERES` y `SAC` suman. El resto de los conceptos debe restar por defecto.
- Las 6 filas `DIFERENCIAS` de `APP.xlsx` se actualizaron a `ADJUSTMENT_DEBIT` con tipo `DEBIT`, para que descuenten del neto en `Saldos`.
- Se mejoro la pantalla de `Saldos` y su version imprimible para mostrar por separado `Saldo inicial`, `Haberes que suman`, `Descuentos que restan`, `Neto del periodo` y saldo final.
- Se agrego impresion multiple de saldos por lista de legajos o rango desde/hasta. La nueva vista imprime 2 empleados por hoja A4 en formato compacto para ahorrar hojas.

## 2026-06-26

- Se agrego a `Movement` un campo `code` opcional para guardar un codigo numerico editable por movimiento.
- Se asignaron codigos numericos por defecto a las categorias manuales y se incorporo la nueva categoria `Gratificacion extraordinaria` con codigo sugerido `208`.
- La nueva categoria `Gratificacion extraordinaria` se registra como movimiento que suma (`CREDIT`), y el pago posterior puede cargarse con el mismo codigo en un movimiento que reste para impactar correctamente en `Saldos`.
- Se actualizaron `movimientos/historial`, `saldos` y las vistas imprimibles para mostrar el codigo del movimiento.
- Se reemplazo la lista fija de conceptos manuales por un maestro `Concept` en base de datos, con `codigo`, `descripcion`, `impacto` y `estado`.
- Se agrego `ABM de Conceptos` en el navbar, con alta, baja logica y modificacion para administrar los conceptos futuros sin tocar codigo.
- La carga manual de movimientos ahora toma el concepto desde ese maestro, muestra el codigo y define automaticamente si suma o resta en la liquidacion.
- Se ajusto la importacion Excel de haberes para buscar primero el `codigo` del concepto activo (por ejemplo `208`) y tomar desde ese maestro el impacto `CREDIT/DEBIT`; si no encuentra codigo, recien ahi hace fallback por descripcion para no romper planillas viejas.
- Se corrigieron `245` movimientos importados desde `APP.xlsx` que habian quedado como `HABERES/SALARY` sin codigo: se reasignaron al concepto activo `208 - GRATIFICACION EXTRAORDINARIA` sin borrar registros.
- Se ajustaron las vistas de `Saldos` para no repetir `categoria - concepto` cuando ambos textos son iguales; ahora en esos casos se muestra una sola descripcion.

## 2026-06-29

- Se agrego memoria persistente del proyecto en `PROJECT_MEMORY.md` y se reforzo su uso como punto de arranque para futuras sesiones.
- Se intento primero un flujo nuevo en `Movimientos` para separar `items que suman` y `items que restan`, pero despues se descarto como pantalla principal porque no era lo que necesitaba la operadora.
- El flujo correcto quedo en `/haberes`: el importador Excel ahora tiene dos pestanas, `Carga de haberes` y `Carga de descuentos`.
- `Carga de haberes` se usa para conceptos que suman, incluyendo `Neto a cobrar`, `Sueldos`, `Aguinaldo` y `SAC`.
- `Carga de descuentos` se usa para conceptos que restan, incluyendo anticipos, vales y otros descuentos.
- Se elimino del navbar el item `ABM de Conceptos`; el acceso al maestro sigue disponible desde `Movimientos`.
- Se eliminaron de `prisma/dev.db` los `245` movimientos mal cargados como `SALARY/HABERES` del `2026-06-25` (periodo `05/2026`, `$ 26.000,00`) y antes se dejo respaldo en `prisma/dev-backup-before-delete-sueldo-haberes-20260629.db`.
- Se rehizo la logica de `/haberes` para trabajar con Excel simple (`legajo`, `apellido y nombre`, `monto`) y tomar el concepto desde la pantalla, no desde el archivo.
- En `/haberes` cada pestana ahora solo acepta conceptos compatibles con su impacto: `Carga de haberes` usa conceptos `CREDIT` y `Carga de descuentos` usa conceptos `DEBIT`.
- Se agrego en `/haberes` la opcion `Concepto manual` y un campo editable de descripcion para aplicar el mismo texto a toda la carga.
- Si se elige un concepto del maestro, la operadora igualmente puede ajustar la descripcion final antes de importar.
- En `Saldos` y en las vistas imprimibles, las cargas manuales ahora muestran solo la descripcion escrita por la operadora, sin prefijos tecnicos como `MANUAL -`.
- Se saco de la pantalla `/movimientos` la tarjeta visible `Submenu / Items que suman y restan`.
- La ruta `/movimientos/exportar` y el helper `lib/movement-export.ts` siguen existiendo en el codigo, pero ya no estan visibles en la pantalla principal; quedaron como candidato de limpieza futura si se confirma que no se van a usar.

## 2026-06-30

- Se libero nuevamente el puerto `3008` para poder levantar `npm run dev` cuando habia procesos `node` viejos bloqueando el arranque.
- Se corrigio el manejo de sesion en `lib/auth.ts`: `getCurrentUser()` ya no intenta borrar cookies durante el render del layout, porque Next solo permite modificar cookies en `Server Actions` o `Route Handlers`.
- Se corrigio el loop de redireccion entre `/login` y `/dashboard`: `proxy.ts` ya no redirige esas rutas solo por existencia de cookie, y ahora queda como guardia rapida unicamente para rutas privadas sin cookie.
- Se agrego `/conceptos` al conjunto de rutas protegidas en `proxy.ts`.
- Se detectaron y eliminaron movimientos duplicados del codigo `901 - GRATIFICACION CUOTA 9` para los legajos `826`, `829` y `832`, dejando un solo registro correcto por cada legajo.
- Se corrigio la deduplicacion en `app/actions/haberes.ts` para que una misma importacion Excel no vuelva a insertar dos filas identicas dentro del mismo lote.
- Se confirmo que en `/movimientos/historial` ya existe busqueda por `legajo`, `apellido`, `nombre`, `concepto` y `codigo` usando el campo de texto `q`.
- Se agrando visualmente el campo de busqueda del historial en `app/globals.css` para que el filtro por legajo se vea mejor y sea mas comodo de usar.
- Para retomar rapido en futuras sesiones conviene leer primero `SESSION_LOG.md` y usar `PROJECT_MEMORY.md` solo como contexto estable del proyecto.

## 2026-07-06

- Se agregaron campos explicitos en `/haberes` para definir `Periodo mes`, `Periodo año` y `Fecha de acreditacion` al cargar Excel.
- La importacion de haberes/descuentos ahora usa esos valores para todas las filas revisadas, evitando que el sistema infiera julio por fecha actual, nombre del archivo o columnas ambiguas.
- En `Saldos` se mantiene la columna como `Fecha`; esa fecha corresponde al valor elegido al cargar el Excel, no a la fecha de carga del archivo.
- Se simplifico la cabecera de detalle en `Saldos`: se quitaron las tarjetas `Saldo de arranque`, `Haberes que suman`, `Descuentos que restan`, `Neto del periodo` y `Pendiente/A cobrar`, dejando solo la identificacion del empleado.
- Se ajusto el filtro `Legajo` de `Saldos` para que tenga ancho compacto de 4 digitos y limite la carga a 4 caracteres.
- Se compacto la grilla de filtros principales de `Saldos` para que legajo, empleado, estado, mes, año y fechas entren en una sola linea en escritorio.
- Se ajustaron nuevamente los anchos de filtros y botones de `Saldos` para evitar desborde horizontal, y se corrigio el texto visible `Anio` por `Año`.
- En la impresion individual de `Saldos` se quitaron del resumen las tarjetas `Saldo de arranque`, `Haberes que suman` y `Descuentos que restan`; se corrigio `Anio` por `Año`.
- En la impresion individual de `Saldos` se quito del encabezado la linea de periodo y el bloque `Desde`, `Hasta` y `Pendiente/A cobrar`.
- En la impresion individual de `Saldos` se quito tambien la fila `Saldo de arranque` de la tabla de detalle.

## Como Usarlo

- Agregar una entrada nueva cada vez que hagamos un arreglo, cambio relevante o decision tecnica.
- Escribir solo lo importante: que se hizo, por que, y si quedo algo pendiente.
