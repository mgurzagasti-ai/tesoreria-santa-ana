@echo off
setlocal

cd /d "%~dp0"

if not exist ".\runtime-logs" mkdir ".\runtime-logs"
set LOG_FILE=.\runtime-logs\startup-%RANDOM%-%RANDOM%.log

set HTTP_PROXY=
set HTTPS_PROXY=
set ALL_PROXY=
set GIT_HTTP_PROXY=
set GIT_HTTPS_PROXY=

echo [%date% %time%] Iniciando AppJorge en modo produccion >> "%LOG_FILE%"
for /f "tokens=2 delims=:" %%v in ('findstr /r /c:"\"version\"" package.json') do (
  echo [%date% %time%] Version %%v >> "%LOG_FILE%"
  goto version_logged
)
:version_logged

echo Buscando proceso viejo en el puerto 3008...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /r /c:":3008 .*LISTENING"') do (
  echo Cerrando PID %%a...
  echo [%date% %time%] Cerrando PID %%a en puerto 3008 >> "%LOG_FILE%"
  taskkill /PID %%a /F >nul 2>&1
)

call npm.cmd run start >> "%LOG_FILE%" 2>&1
echo [%date% %time%] AppJorge finalizo con codigo %errorlevel% >> "%LOG_FILE%"
