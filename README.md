# Tesoreria - Migracion a Next.js

Esta carpeta conserva la app Java original y suma una nueva version web en `Next.js` para continuar la migracion sin perder referencia funcional.

## Stack propuesto

- `Next.js` para la interfaz y rutas protegidas
- `Prisma` como ORM
- `SQLite` para levantar local sin dependencias externas
- `PostgreSQL` como siguiente paso recomendado si luego se necesita uso multiusuario
- sesiones seguras con cookie `httpOnly`

## Mejoras implementadas

- login obligatorio para ingresar
- validacion de `legajo` numerico con 1 o mas digitos
- estructura modular con acciones de servidor
- unificacion de movimientos en un solo modelo
- eliminacion de SQL embebido en la interfaz

## Puesta en marcha

1. Copiar `.env.example` a `.env`.
2. Ejecutar:

```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed-admin
npm run dev
```

## Credenciales iniciales

Se generan desde `.env` usando:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Modulos disponibles

- `/login`
- `/dashboard`
- `/empleados`
- `/movimientos`

## Siguiente etapa sugerida

- importar datos historicos desde MySQL
- replicar impresiones y reportes PDF
- agregar auditoria por usuario y exportacion Excel
- empaquetar como escritorio con Electron o Tauri

## Memoria de trabajo

Para retomar mas rapido en futuras sesiones:

- revisar `PROJECT_MEMORY.md` para el contexto estable del proyecto
- revisar `SESSION_LOG.md` para los cambios y arreglos recientes

## Importacion de la base anterior

La carpeta `data/` contiene el directorio fisico de MariaDB/MySQL de la app vieja. Ese formato no se puede leer directo desde `Prisma`, asi que el importador nuevo admite dos caminos:

1. Conexion directa a la base legacy:

```bash
LEGACY_MYSQL_URL="mysql://usuario:clave@localhost:3306/bd_tesoreria" npm run prisma:import-legacy
```

2. Exportacion previa a JSON y luego importacion:

```bash
LEGACY_EMPLOYEES_JSON="C:/ruta/empleados.json" LEGACY_SALDOS_JSON="C:/ruta/saldos.json" npm run prisma:import-legacy
```

### Mapeo aplicado

- `empleados` legacy -> `Employee`
- `saldos` legacy -> `Movement`
- `Activo = S/N` -> `ACTIVE/INACTIVE`
- `ImporteN` se importa como debito
- `ImporteP` se importa como credito
- las categorias nuevas se infieren desde `Concepto` y `NVale`

### Nota importante

Si solo tenemos `.ibd` y `.frm`, primero hay que montar esa carpeta en un MariaDB/MySQL compatible o exportar las tablas desde otra instalacion. Con los archivos crudos solos no alcanza para leer filas desde Node.
