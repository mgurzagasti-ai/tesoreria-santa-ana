@echo off
setlocal

cd /d "%~dp0"

if not exist ".\runtime-logs" mkdir ".\runtime-logs"

set HTTP_PROXY=
set HTTPS_PROXY=
set ALL_PROXY=
set GIT_HTTP_PROXY=
set GIT_HTTPS_PROXY=

echo [%date% %time%] Iniciando AppJorge en modo produccion >> ".\runtime-logs\startup.log"
for /f "tokens=2 delims=:" %%v in ('findstr /r /c:"\"version\"" package.json') do (
  echo [%date% %time%] Version %%v >> ".\runtime-logs\startup.log"
  goto version_logged
)
:version_logged

echo Buscando proceso viejo en el puerto 3008...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":3008 .*LISTENING"') do (
  echo Cerrando PID %%a...
  echo [%date% %time%] Cerrando PID %%a en puerto 3008 >> ".\runtime-logs\startup.log"
  taskkill /PID %%a /F >nul 2>&1
)

call npm.cmd run start >> ".\runtime-logs\startup.log" 2>&1
echo [%date% %time%] AppJorge finalizo con codigo %errorlevel% >> ".\runtime-logs\startup.log"
