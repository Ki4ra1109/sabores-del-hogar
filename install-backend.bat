@echo off
chcp 65001 >nul

echo ===========================
echo Instalando BACKEND...
echo ===========================

cd /d "%~dp0\backend" || (
  echo ERROR: No se encontro la carpeta backend
  pause
  exit /b
)

npm install
echo Codigo de salida: %errorlevel%
echo.

pause
