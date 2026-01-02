# ⚡ QUICKSTART - Testar no Android em 5 Minutos

---

## 🚀 Passos Rápidos

### 1. Executar Servidor (no PC)

**Windows:**
```bash
cd web
run.bat
```

**Linux/Mac:**
```bash
cd web
chmod +x run.sh
./run.sh
```

**Alternativa (direto):**
```bash
cd web/backend
pip install -r requirements.txt
python main.py
```

### 2. Ver o IP

O script mostra automaticamente:
```
Aceder de outro dispositivo (Android, etc):
  → http://192.168.1.100:8000/app/index.html
       ^^^^^^^^^^^^
       Este é o seu IP
```

**Não apareceu o IP? Descobrir manualmente:**

**Windows:**
```bash
ipconfig
# Procurar: "Endereço IPv4"
# Exemplo: 192.168.1.100
```

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr show
# Procurar: inet 192.168.x.x
```

### 3. Abrir no Android

1. **Android e PC na mesma rede WiFi** ✅
2. Abrir **Chrome** no Android
3. Ir para: `http://192.168.1.100:8000/app/index.html`
   (substituir pelo teu IP)
4. **Pronto!** 🎉

---

## 📱 Testar a Aplicação

### Passo 1: Importar WhatsApp

**Colar este texto de exemplo:**
```
MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO 20/30
2 POTA LIMPA
1 LULA INTEIRA
```

1. Copiar o texto acima
2. Colar no campo de texto
3. Clicar "📤 Enviar Texto"
4. Ver confirmação verde ✅

### Passo 2: Importar Fatura (Exemplo)

**Para testar, criar ficheiro Excel simples:**

| Produto | Quantidade |
|---------|-----------|
| CAMARÃO 20/30 | 5 |
| POTA LIMPA | 2 |
| LULA INTEIRA | 1 |

1. Guardar como `teste.xlsx`
2. Upload na app
3. Ver confirmação verde ✅

### Passo 3: Comparar

1. Clicar **"🔍 Comparar Agora"**
2. Aguardar 2-3 segundos
3. Ver resultado:
   ```
   ✅ TUDO CORRETO
   Confiança: 100%
   ```

### Passo 4: Download Relatório

1. Clicar **"📄 Download PDF"**
2. Ficheiro descarrega automaticamente
3. Abrir e ver relatório profissional

---

## 🎯 URLs Úteis

| Página | URL | Descrição |
|--------|-----|-----------|
| **App Principal** | http://IP:8000/app/index.html | Interface principal |
| **API Docs** | http://IP:8000/docs | Documentação Swagger |
| **Health Check** | http://IP:8000/health | Verificar se API está a funcionar |
| **ReDoc** | http://IP:8000/redoc | Documentação alternativa |

---

## ✅ Checklist de Teste

- [ ] Servidor iniciou sem erros
- [ ] Abriu no PC (localhost:8000/app/index.html)
- [ ] Android e PC na mesma WiFi
- [ ] Abriu no Android com IP do PC
- [ ] Upload de texto WhatsApp funcionou
- [ ] Upload de fatura funcionou
- [ ] Comparação executou com sucesso
- [ ] Download PDF funcionou
- [ ] Download Excel funcionou

---

## 🐛 Problemas Comuns

### No Android: "Não é possível aceder ao site"

**Causas possíveis:**
1. ❌ Android e PC em redes WiFi diferentes
2. ❌ Firewall do Windows a bloquear porta 8000
3. ❌ IP errado

**Soluções:**
1. ✅ Conectar ambos à mesma WiFi
2. ✅ Desativar firewall temporariamente (testar)
3. ✅ Verificar IP com `ipconfig` (Windows) ou `ifconfig` (Linux)

### Servidor dá erro ao iniciar

**Erro:** `ModuleNotFoundError: No module named 'fastapi'`

**Solução:**
```bash
pip install -r web/backend/requirements.txt
```

### Upload de ficheiro não funciona

**Causas:**
1. Ficheiro muito grande (>10MB)
2. Formato não suportado

**Solução:**
1. Usar ficheiros pequenos para teste
2. Apenas .xlsx, .xls, .csv, .pdf

---

## 📊 Exemplo Completo

### Criar ficheiro de teste `pedido.txt`:
```
PEIXARIA CENTRAL LDA
Restaurante Marisqueira do Porto
3 CAMARÃO TIGRE
5 LULAS GRANDES
2 POLVO FRESCO
1 DOURADA INTEIRA
```

### Criar ficheiro Excel `fatura.xlsx`:
```
| Artigo | Qtd |
|--------|-----|
| CAMARÃO TIGRE | 3 |
| LULAS GRANDES | 5 |
| POLVO FRESCO | 2 |
| DOURADA INTEIRA | 1 |
```

### Testar:
1. Upload `pedido.txt` (ou colar texto)
2. Upload `fatura.xlsx`
3. Comparar
4. **Resultado:** ✅ 100% correto

---

## 🎉 Próximos Passos

### Depois de testar:

1. **Instalar como App no Android:**
   - Chrome → Menu (⋮) → "Adicionar ao ecrã inicial"
   - App fica no launcher! 📱

2. **Deploy Online (para acesso de qualquer lugar):**
   - Ver `web/README.md` secção "Deploy"
   - Opções: Heroku, Railway, VPS próprio

3. **Personalizar:**
   - Mudar cores em `web/frontend/css/style.css`
   - Adicionar logo em `web/frontend/assets/`
   - Mudar nome da app em `manifest.json`

---

## 📞 Precisa de Ajuda?

1. **Logs do servidor:**
   ```bash
   # Ver no terminal onde executou python main.py
   ```

2. **Logs do browser (Android):**
   - Chrome → Menu → "Ferramentas do programador"
   - Ver console para erros

3. **Testar API diretamente:**
   ```bash
   curl http://IP:8000/health
   # Deve retornar: {"status":"healthy","version":"1.0.0"}
   ```

---

**Tempo estimado:** 5-10 minutos
**Dificuldade:** ⭐ Fácil

🚀 **Boa sorte!**
