@echo off
cd /d "%~dp0"

if not exist node_modules (
  echo A instalar os programas necessarios pela primeira vez...
  echo Isto precisa de internet, mas so acontece uma vez.
  call npm install
)

echo A iniciar o servidor do Decap CMS...
start "Decap Server" cmd /k "npm run cms"

timeout /t 3 /nobreak >nul

echo A iniciar o servidor do site...
start "Live Server" cmd /k "npm run site"

echo.
echo Os dois servidores foram iniciados em janelas separadas.
echo Nao feches essas janelas enquanto estiveres a trabalhar no site.
pause
