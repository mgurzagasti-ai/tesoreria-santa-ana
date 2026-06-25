@echo off
setlocal

cd /d "%~dp0"

echo Buscando proceso en el puerto 3008...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3008') do (
  echo Cerrando PID %%a...
  taskkill /PID %%a /F >nul 2>&1
)

echo Iniciando AppJorge en modo desarrollo...
call npm.cmd run dev
