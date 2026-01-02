@echo off
REM Script para criar executável Windows

echo ========================================
echo Build Invoice Confirmation App
echo ========================================
echo.

REM Ativar ambiente virtual
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo ERRO: Ambiente virtual nao encontrado!
    echo Execute run.bat primeiro.
    pause
    exit /b 1
)

REM Instalar PyInstaller se necessário
pip install pyinstaller

REM Limpar builds anteriores
if exist "build\" rmdir /s /q build
if exist "dist\" rmdir /s /q dist

REM Criar executável
echo.
echo Criando executavel...
pyinstaller build.spec

REM Verificar se foi criado
if exist "dist\InvoiceConfirmationApp.exe" (
    echo.
    echo ========================================
    echo BUILD COMPLETO!
    echo ========================================
    echo Executavel criado em: dist\InvoiceConfirmationApp.exe
    echo.
) else (
    echo.
    echo ERRO: Falha ao criar executavel!
    pause
    exit /b 1
)

pause
