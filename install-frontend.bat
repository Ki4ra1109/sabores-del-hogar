@echo off
chcp 65001 >nul

echo ===========================
echo Instalando FRONTEND...
echo ===========================

cd /d "%~dp0\frontend" || (
  echo ERROR: No se encontro la carpeta frontend
  pause
  exit /b
)

npm install
echo Codigo de salida: %errorlevel%
echo.

pause
