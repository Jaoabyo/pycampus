@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando as dependencias do PyCampus...
  call npm.cmd install
  if errorlevel 1 (
    echo Nao foi possivel instalar. Confira se o Node.js esta instalado.
    pause
    exit /b 1
  )
)
echo Abra http://127.0.0.1:5173 no navegador.
echo Mantenha este terminal aberto enquanto estuda. Para encerrar, pressione Ctrl+C.
call npm.cmd run dev -- --open
pause
