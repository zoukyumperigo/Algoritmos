@echo off
REM Script para executar Invoice Confirmation App no Windows

echo ========================================
echo Invoice Confirmation App
echo ========================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Python nao encontrado!
    echo Por favor, instale Python 3.10+ de https://www.python.org
    pause
    exit /b 1
)

REM Verificar se venv existe
if not exist "venv\" (
    echo Criando ambiente virtual...
    python -m venv venv

    echo Instalando dependencias...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate.bat
)

REM Executar aplicação
echo.
echo Iniciando aplicacao...
python src/main.py

REM Desativar venv
deactivate

pause
