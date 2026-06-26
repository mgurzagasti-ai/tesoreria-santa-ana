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

## Como Usarlo

- Agregar una entrada nueva cada vez que hagamos un arreglo, cambio relevante o decision tecnica.
- Escribir solo lo importante: que se hizo, por que, y si quedo algo pendiente.
