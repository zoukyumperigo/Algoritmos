#!/bin/bash
# Script para executar aplicação web

echo "=========================================="
echo "Invoice Confirmation App - Web Server"
echo "=========================================="
echo ""

# Verificar se está na pasta correta
if [ ! -f "backend/main.py" ]; then
    echo "ERRO: Execute este script da pasta web/"
    exit 1
fi

# Ativar ambiente virtual se existir
if [ -d "../venv" ]; then
    echo "Ativando ambiente virtual..."
    source ../venv/bin/activate
fi

# Instalar dependências se necessário
echo "Verificando dependências..."
cd backend
pip install -q -r requirements.txt

# Descobrir IP local
echo ""
echo "Descobrindo IP local..."
if command -v ifconfig &> /dev/null; then
    IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
elif command -v ip &> /dev/null; then
    IP=$(ip addr show | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
else
    IP="localhost"
fi

echo ""
echo "=========================================="
echo "Servidor iniciado!"
echo "=========================================="
echo ""
echo "Aceder localmente:"
echo "  → http://localhost:8000/app/index.html"
echo ""
if [ "$IP" != "localhost" ]; then
    echo "Aceder de outro dispositivo (Android, etc):"
    echo "  → http://$IP:8000/app/index.html"
    echo ""
fi
echo "API Docs (Swagger):"
echo "  → http://localhost:8000/docs"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo "=========================================="
echo ""

# Executar servidor
python main.py
