# 📱 Invoice Confirmation App - Versão Web/Mobile

Versão web mobile-friendly da aplicação que **funciona no Android, iOS, Windows, Mac** - qualquer dispositivo com browser.

---

## 🎯 O Que Foi Criado

Uma **aplicação web completa** que reutiliza 80% do código Python existente:

### ✅ Backend (FastAPI - Python)
- API REST completa
- **Reutiliza todos os parsers** (WhatsApp, Excel, CSV, PDF)
- **Reutiliza motor de comparação**
- **Reutiliza geração de relatórios**
- Upload de ficheiros
- CORS configurado

### ✅ Frontend (HTML/CSS/JavaScript)
- Interface **mobile-first** (optimizada para telemóvel)
- Design responsivo
- PWA (Progressive Web App) - pode instalar como app
- Funciona offline (após primeira carga)
- Touch-friendly

---

## 🚀 Como Executar

### Opção 1: Execução Local (Desenvolvimento)

```bash
# 1. Navegar para pasta web/backend
cd web/backend

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Executar servidor
python main.py

# 4. Abrir no browser (incluindo Android!)
# Desktop: http://localhost:8000/app/index.html
# Android: http://<IP-DO-PC>:8000/app/index.html
```

**Descobrir IP do PC:**
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig

# Exemplo: http://192.168.1.100:8000/app/index.html
```

---

### Opção 2: Deploy em Servidor (Produção)

#### A. Deploy no Heroku (Gratuito)

```bash
# 1. Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Criar app
cd web/backend
heroku create invoice-app-sua-empresa

# 4. Deploy
git init
git add .
git commit -m "Deploy inicial"
git push heroku main

# 5. Abrir app
heroku open
```

**Ficheiro `Procfile` (já incluído):**
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### B. Deploy no Railway.app (Recomendado)

1. Ir para https://railway.app
2. Conectar GitHub
3. "New Project" → "Deploy from GitHub"
4. Selecionar repositório
5. Railway deteta Python automaticamente
6. Deploy em ~2 minutos!

**URL final:** `https://invoice-app.railway.app`

#### C. Deploy no seu próprio servidor (VPS)

```bash
# 1. SSH para servidor
ssh user@seu-servidor.com

# 2. Clonar repositório
git clone <repo-url>
cd invoice-confirmation-app/web/backend

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Executar com supervisor/systemd
# Exemplo com uvicorn
uvicorn main:app --host 0.0.0.0 --port 80
```

---

## 📱 Como Usar no Android

### Opção 1: Browser (Mais simples)

1. Abrir **Chrome** no Android
2. Ir para `http://<IP-DO-SERVIDOR>:8000/app/index.html`
3. Usar normalmente!

### Opção 2: Instalar como App (PWA)

1. Abrir no Chrome Android
2. Menu (⋮) → **"Adicionar ao ecrã inicial"**
3. App aparece como ícone no launcher
4. Funciona como app nativa! 🎉

**Vantagens:**
- ✅ Ícone próprio
- ✅ Abre em fullscreen
- ✅ Funciona offline
- ✅ Parece app nativa

---

## 🎨 Capturas de Ecrã (Mobile)

```
┌─────────────────────┐
│ 🧾 Invoice Checker  │
│ Validação de Faturas│
├─────────────────────┤
│ 1️⃣ Pedido WhatsApp  │
│ ┌─────────────────┐ │
│ │ ✍️ Colar | 📁 File│ │
│ └─────────────────┘ │
│ [Texto colado aqui] │
│ [📤 Enviar Texto]   │
├─────────────────────┤
│ 2️⃣ Fatura SAGE      │
│ [📂 Selecionar]     │
│ Excel, CSV ou PDF   │
├─────────────────────┤
│ 3️⃣ Comparar         │
│ [🔍 Comparar Agora] │
├─────────────────────┤
│ RESULTADO           │
│ ┌─────────────────┐ │
│ │   ✅            │ │
│ │ TUDO CORRETO    │ │
│ │ Confiança: 100% │ │
│ └─────────────────┘ │
│ [📄 Download PDF]   │
│ [📊 Download Excel] │
└─────────────────────┘
```

---

## 🔧 Arquitetura

```
┌──────────────────────────────────────────┐
│           FRONTEND (Browser)             │
│  ┌────────────────────────────────────┐  │
│  │  HTML + CSS + JavaScript           │  │
│  │  - Interface mobile-friendly       │  │
│  │  - Upload de ficheiros             │  │
│  │  - Display de resultados           │  │
│  └────────────────────────────────────┘  │
│              ↕ HTTP/JSON                 │
├──────────────────────────────────────────┤
│           BACKEND (FastAPI)              │
│  ┌────────────────────────────────────┐  │
│  │  REST API Endpoints:               │  │
│  │  POST /api/upload/whatsapp         │  │
│  │  POST /api/upload/invoice          │  │
│  │  POST /api/compare                 │  │
│  │  GET  /api/report/pdf              │  │
│  │  GET  /api/report/excel            │  │
│  └────────────────────────────────────┘  │
│              ↕ Import                    │
│  ┌────────────────────────────────────┐  │
│  │  Código Python Existente ✅        │  │
│  │  - src/parsers/                    │  │
│  │  - src/services/                   │  │
│  │  - src/models/                     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘

Android/iOS ──→ Browser ──→ API ──→ Código Python
```

---

## 📡 API Endpoints

### 1. Upload WhatsApp
**POST** `/api/upload/whatsapp`

**Body (form-data):**
```
text: "MAR AZUL LDA\nRestaurante Sol Nascente\n5 CAMARÃO"
session_id: "session_123"
```

**Ou:**
```
file: [ficheiro.txt]
session_id: "session_123"
```

**Response:**
```json
{
  "success": true,
  "message": "Pedido WhatsApp importado com sucesso",
  "data": {
    "distributor": "MAR AZUL LDA",
    "customer": "Sol Nascente",
    "items": [...],
    "total_items": 8
  }
}
```

### 2. Upload Fatura
**POST** `/api/upload/invoice`

**Body (form-data):**
```
file: [fatura.xlsx]
session_id: "session_123"
```

**Response:**
```json
{
  "success": true,
  "message": "Fatura importada com sucesso (.xlsx)",
  "data": {
    "distributor": "MAR AZUL LDA",
    "customer": "Sol Nascente",
    "items": [...],
    "total_items": 8
  }
}
```

### 3. Comparar
**POST** `/api/compare`

**Body (form-data):**
```
session_id: "session_123"
```

**Response:**
```json
{
  "success": true,
  "message": "Comparação realizada com sucesso",
  "data": {
    "status": "OK",
    "confidence_score": 100.0,
    "divergences": [],
    "critical_count": 0,
    "error_count": 0,
    "warning_count": 0
  }
}
```

### 4. Relatório PDF
**GET** `/api/report/pdf/{session_id}`

**Response:** Ficheiro PDF (download)

### 5. Relatório Excel
**GET** `/api/report/excel/{session_id}`

**Response:** Ficheiro Excel (download)

### 6. Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## 🔐 Segurança

### Produção
Para deploy em produção, **alterar** em `main.py`:

```python
# DESENVOLVIMENTO (permite todos)
allow_origins=["*"]

# PRODUÇÃO (apenas domínios específicos)
allow_origins=[
    "https://invoice-app.sua-empresa.com",
    "https://www.sua-empresa.com"
]
```

### HTTPS
Em produção, **sempre usar HTTPS**:
- Heroku/Railway: HTTPS automático ✅
- VPS próprio: Usar Nginx + Let's Encrypt

---

## 📊 Comparação: Desktop vs Web

| Característica | Desktop (PySide6) | Web (FastAPI) |
|----------------|-------------------|---------------|
| **Plataforma** | Windows apenas | Android, iOS, Windows, Mac, Linux |
| **Instalação** | Executável ~50MB | Nenhuma (browser) |
| **Atualizações** | Manual | Automática (servidor) |
| **Offline** | ✅ Sim | ⚠️ Limitado (PWA) |
| **Interface** | Janelas nativas | HTML responsivo |
| **Melhor para** | Operadores fixos | Utilizadores móveis, múltiplos devices |
| **Código reutilizado** | 100% Python | 80% Python (parsers, lógica) |

---

## 🐛 Troubleshooting

### Problema: API não responde

**Solução:**
```bash
# Verificar se servidor está a correr
curl http://localhost:8000/health

# Ver logs
python main.py  # Deve mostrar: "Uvicorn running on..."
```

### Problema: CORS error no browser

**Solução:**
Verificar que CORS está ativado em `main.py`:
```python
allow_origins=["*"]  # Desenvolvimento
```

### Problema: Ficheiro não faz upload

**Solução:**
1. Verificar tamanho máximo (default FastAPI: 10MB)
2. Ver console do browser (F12) para erros
3. Verificar formato (só .xlsx, .xls, .csv, .pdf)

### Problema: No Android não abre

**Solução:**
1. PC e Android na **mesma rede WiFi**
2. Usar IP do PC, não `localhost`
3. Firewall do Windows pode estar a bloquear porta 8000

---

## 📈 Melhorias Futuras

### Fase 1 (Curto prazo)
- [ ] Autenticação de utilizadores
- [ ] Base de dados (PostgreSQL) em vez de memória
- [ ] Histórico de comparações
- [ ] Cache de sessões

### Fase 2 (Médio prazo)
- [ ] Notificações push (PWA)
- [ ] Modo offline completo
- [ ] Sincronização multi-dispositivo
- [ ] Dashboard de estatísticas

### Fase 3 (Longo prazo)
- [ ] App nativa Android/iOS
- [ ] Integração WhatsApp Business API
- [ ] Machine Learning para melhorias
- [ ] Multi-tenant (várias empresas)

---

## 🧪 Testes

```bash
# 1. Testar API localmente
curl http://localhost:8000/health

# 2. Testar upload (com curl)
curl -X POST http://localhost:8000/api/upload/whatsapp \
  -F "text=MAR AZUL LDA\nSol Nascente\n5 CAMARÃO" \
  -F "session_id=test123"

# 3. Testar no browser
# Abrir: http://localhost:8000/docs
# (FastAPI Swagger UI automático)
```

---

## 📞 Suporte

### Documentação
- **API Docs**: http://localhost:8000/docs (Swagger)
- **ReDoc**: http://localhost:8000/redoc
- **Este README**: Para deployment

### Logs
```bash
# Ver logs em tempo real
tail -f logs/app_*.log
```

---

## ✅ Checklist de Deploy

### Desenvolvimento
- [x] Backend FastAPI implementado
- [x] Frontend mobile-friendly criado
- [x] API endpoints funcionais
- [x] Upload de ficheiros
- [x] Geração de relatórios
- [x] CORS configurado

### Produção
- [ ] Mudar `allow_origins` para domínios específicos
- [ ] Configurar HTTPS
- [ ] Adicionar autenticação
- [ ] Usar base de dados (não memória)
- [ ] Configurar logs persistentes
- [ ] Monitorização (Sentry, etc)
- [ ] Backups

---

**Versão**: 1.0.0
**Data**: Janeiro 2024
**Compatibilidade**: Android 7+, iOS 12+, Chrome, Firefox, Safari

🚀 **A aplicação está pronta para testar no Android!**
