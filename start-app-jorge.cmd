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
call npm.cmd run start >> ".\runtime-logs\startup.log" 2>&1
echo [%date% %time%] AppJorge finalizo con codigo %errorlevel% >> ".\runtime-logs\startup.log"
