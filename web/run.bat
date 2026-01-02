@echo off
REM Script para executar aplicação web no Windows

echo ==========================================
echo Invoice Confirmation App - Web Server
echo ==========================================
echo.

REM Verificar se está na pasta correta
if not exist "backend\main.py" (
    echo ERRO: Execute este script da pasta web\
    pause
    exit /b 1
)

REM Ativar ambiente virtual se existir
if exist "..\venv\Scripts\activate.bat" (
    echo Ativando ambiente virtual...
    call ..\venv\Scripts\activate.bat
)

REM Instalar dependências
echo Verificando dependencias...
cd backend
pip install -q -r requirements.txt

REM Descobrir IP local
echo.
echo Descobrindo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%

echo.
echo ==========================================
echo Servidor iniciado!
echo ==========================================
echo.
echo Aceder localmente:
echo   -^> http://localhost:8000/app/index.html
echo.
if defined IP (
    echo Aceder de outro dispositivo (Android, etc):
    echo   -^> http://%IP%:8000/app/index.html
    echo.
)
echo API Docs (Swagger):
echo   -^> http://localhost:8000/docs
echo.
echo Pressione Ctrl+C para parar o servidor
echo ==========================================
echo.

REM Executar servidor
python main.py

pause
