# Instructivo De Instalacion En Otra PC

## Objetivo

Instalar la aplicacion `Tesoreria Santa Ana` en otra computadora con Windows, conservando los datos actuales.

## Que hay que llevar a la otra PC

Copiar la carpeta del proyecto completa, pero con estas recomendaciones:

- Si vas a copiar manualmente, lleva toda la carpeta `AppJorge`.
- Es importante incluir `prisma/dev.db` porque ahi esta la base de datos con los datos actuales.
- Tambien llevar `.env`.

No hace falta copiar estas carpetas porque se pueden regenerar:

- `node_modules`
- `.next`

## Programas que hay que instalar antes

Instalar en la nueva PC:

1. `Node.js`
2. `Git` opcional, solo si despues queres actualizar el proyecto desde repositorio

## Version recomendada

Usar una version actual de `Node.js` LTS.

Para comprobar si quedo bien instalado, abrir una terminal y ejecutar:

```powershell
node -v
npm -v
```

## Donde ubicar la carpeta

Copiar el proyecto por ejemplo en:

```text
C:\Tesoreria\AppJorge
```

## Ajuste obligatorio del archivo .env

Abrir el archivo `.env` y revisar `DATABASE_URL`.

Si figura una ruta absoluta de otra PC, cambiarla.

Dejarlo asi:

```env
DATABASE_URL="file:./dev.db"
SESSION_COOKIE_NAME="tesoreria_session"
SESSION_COOKIE_SECURE="false"
SESSION_TTL_HOURS="12"
APP_NAME="Tesoreria Santa Ana"
ADMIN_EMAIL="admin@tesoreria.local"
ADMIN_PASSWORD="Cambiar123!"
```

`SESSION_COOKIE_SECURE="false"` es importante si la app se va a abrir desde otras PCs por red local usando `http://IP:3008`. Si algun dia la publicas con `https`, podes cambiarlo a `"true"`.

## Instalacion paso a paso

Abrir una terminal dentro de la carpeta del proyecto y ejecutar en este orden:

```powershell
npm install
npm run prisma:generate
npm run prisma:push
```

## Si la base ya viene copiada

Si copiaste `prisma/dev.db`, no hace falta importar datos.

En ese caso, con estos comandos alcanza:

```powershell
npm install
npm run prisma:generate
npm run prisma:push
```

## Si la base no viene copiada

La app va a arrancar vacia.

En ese caso, despues de los comandos anteriores ejecutar:

```powershell
npm run prisma:seed-admin
```

Eso crea el usuario administrador usando:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

definidos en `.env`.

## Como iniciar la aplicacion

Para usarla normalmente en modo local:

```powershell
npm run dev
```

La aplicacion queda disponible en:

```text
http://localhost:3008
```

## Como ingresar

Entrar con el usuario configurado en `.env`:

- Email: el valor de `ADMIN_EMAIL`
- Clave: el valor de `ADMIN_PASSWORD`

## Verificacion final

Si todo salio bien:

1. Abre `http://localhost:3008`
2. Inicia sesion
3. Verifica que aparezcan empleados
4. Verifica que aparezcan saldos y movimientos

## Problemas comunes

### Error por base de datos

Revisar que exista este archivo:

```text
prisma/dev.db
```

Y revisar que `.env` tenga:

```env
DATABASE_URL="file:./dev.db"
```

### Error porque no reconoce comandos npm o node

Significa que `Node.js` no esta instalado o no quedo agregado al sistema.

Cerrar y volver a abrir la terminal. Si sigue igual, reinstalar `Node.js`.

### La app abre pero no hay datos

Probablemente no se copio `prisma/dev.db`.

Solucion:

- copiar `prisma/dev.db` desde la PC original
- o cargar/importar los datos nuevamente

### Error de dependencias

Ejecutar otra vez:

```powershell
npm install
```

## Resumen corto

1. Instalar `Node.js`
2. Copiar la carpeta del proyecto
3. Copiar `prisma/dev.db`
4. Ajustar `.env` con `DATABASE_URL="file:./dev.db"`
5. Ejecutar:

```powershell
npm install
npm run prisma:generate
npm run prisma:push
npm run dev
```

6. Abrir `http://localhost:3008`
