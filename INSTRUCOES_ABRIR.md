# 🚀 Como Abrir a Aplicação Corretamente

## Problema Comum: Perda de Cores e Formatação

Se está a ver a aplicação sem cores ou descentralizada, o problema é provavelmente **cache do navegador** ou abrir o ficheiro HTML diretamente.

---

## ✅ SOLUÇÃO 1: Usar Servidor Local (RECOMENDADO)

### Passo 1: Iniciar Servidor
No terminal, na pasta do projeto:

```bash
cd /home/user/Algoritmos
python3 -m http.server 8000
```

### Passo 2: Abrir no Navegador
Abra o navegador e acesse:

```
http://localhost:8000
```

---

## ✅ SOLUÇÃO 2: Limpar Cache do Navegador

### Chrome/Edge:
1. Abra a página da aplicação
2. Pressione **Ctrl + Shift + Delete**
3. Selecione "Imagens e ficheiros em cache"
4. Clique em "Limpar dados"
5. Recarregue a página com **Ctrl + F5**

### Firefox:
1. Abra a página da aplicação
2. Pressione **Ctrl + Shift + Delete**
3. Selecione "Cache"
4. Clique em "Limpar agora"
5. Recarregue a página com **Ctrl + F5**

---

## ✅ SOLUÇÃO 3: Forçar Recarregamento

Quando abrir a aplicação:

- **Windows/Linux**: Pressione **Ctrl + F5** ou **Ctrl + Shift + R**
- **Mac**: Pressione **Cmd + Shift + R**

---

## 🔍 Verificar se Funciona

Quando abrir corretamente, deve ver:

✅ **Cabeçalho azul** com "Sistema de Gestão de Armazém"
✅ **Botões de navegação** com cores (azul quando ativo)
✅ **Zona de importação** com fundo branco
✅ **Cores nas zonas** da lista de picking:
   - 🔵 Azul para Frozen Seafood
   - 🔴 Vermelho para Frozen Meat
   - 🟠 Laranja para Frozen Pre-cooked
   - 🟢 Verde para Dry Goods

---

## 🐛 Se Continuar com Problemas

Abra o **Console do Navegador**:
- Pressione **F12**
- Vá ao tab "Console"
- Procure por erros (texto vermelho)
- Copie os erros e reporte

---

## 📊 Verificar Console da Aplicação

Quando a página carregar corretamente, deve ver no console:

```
==============================================================
🏢 WAREHOUSE MANAGEMENT SYSTEM
==============================================================
Console Commands:
  - showAppInfo()      : Show application information
  - exportAllData()    : Export all data to JSON
  - resetAllData()     : Reset all data (DANGEROUS!)
  - App.storage        : Access storage service
  - App.pickingUI      : Access picking UI
==============================================================

🚀 Initializing Warehouse Management System...
✅ Application initialized successfully!
   - 21 products loaded
   - 4 distributors loaded
   - 0 orders in history
```

---

## 🔄 Git Está Sincronizado

Todos os ficheiros já estão no GitHub:
- Branch: `claude/whatsapp-order-import-lwczX`
- Status: ✅ Sincronizado
- Último commit: "Add grouping by distributor/courier feature to picking list"

Não precisa fazer mais nada no Git - está tudo atualizado! 🎉
