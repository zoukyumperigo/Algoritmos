# 🧾 Invoice Confirmation App

Sistema desktop profissional para validação automática de faturas SAGE contra pedidos de WhatsApp.

---

## 📋 Visão Geral

Esta aplicação resolve um problema crítico no processo de faturação: **erros humanos na emissão de faturas**.

### Problema
- Encomendas feitas via WhatsApp
- Faturas emitidas manualmente no SAGE
- Erros frequentes: quantidades erradas, produtos errados, cliente errado

### Solução
- Importação automática de pedidos WhatsApp
- Importação de faturas SAGE (Excel, CSV, PDF)
- Comparação inteligente com fuzzy matching
- Deteção automática de divergências
- Relatórios profissionais em PDF/Excel

---

## ✨ Funcionalidades

### ✅ Importação de Dados
- **WhatsApp**: Ficheiro TXT ou copiar/colar
- **SAGE**: Excel (.xlsx, .xls), CSV, PDF

### 🔍 Comparação Inteligente
- Normalização automática de nomes
- Fuzzy matching (tolera diferenças ortográficas)
- Deteção de:
  - Cliente errado ❌ (crítico)
  - Distribuidor errado ❌ (crítico)
  - Produtos em falta 🔴 (erro)
  - Produtos não pedidos 🔴 (erro)
  - Quantidades diferentes 🟡 (aviso)

### 📊 Interface Intuitiva
- 3 painéis lado a lado
- Cores visuais (verde, amarelo, vermelho)
- Resumo claro de divergências
- Navegação simples

### 📄 Relatórios Profissionais
- **PDF**: Relatório formatado com logo e cores
- **Excel**: Dados estruturados em múltiplas abas
- Timestamp e nome do operador
- Resumo executivo

---

## 🚀 Instalação

### Requisitos
- Windows 10/11 (64-bit)
- Python 3.10+ (para desenvolvimento)

### Opção 1: Executável (Recomendado para utilizadores)

```bash
# Download do executável
# Duplo clique em InvoiceConfirmationApp.exe
```

### Opção 2: Instalação via Python (Para desenvolvimento)

```bash
# 1. Clonar repositório
git clone <repository-url>
cd invoice-confirmation-app

# 2. Criar ambiente virtual
python -m venv venv
venv\Scripts\activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Executar aplicação
python src/main.py
```

---

## 📖 Como Usar

### Passo 1: Importar Pedido WhatsApp

**Formato esperado:**
```
MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO 20/30
2 POTA LIMPA
1 LULA INTEIRA
```

**Métodos:**
- Ficheiro → Importar WhatsApp → Ficheiro TXT
- Ficheiro → Importar WhatsApp → Copiar/Colar

### Passo 2: Importar Fatura SAGE

**Formatos aceites:**
- Excel (.xlsx, .xls)
- CSV
- PDF

**Método:**
- Ficheiro → Importar Fatura → Selecionar ficheiro

### Passo 3: Comparar

- Clicar em **🔍 Comparar**
- Aguardar processamento (< 5 segundos)
- Ver resultado no painel central

### Passo 4: Exportar Relatório (Opcional)

- **📄 Relatório PDF** - Para impressão/email
- **📊 Relatório Excel** - Para análise de dados

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica
- **Python 3.10+**
- **PySide6 (Qt)** - Interface gráfica
- **pandas** - Manipulação de dados
- **openpyxl** - Leitura/escrita Excel
- **PyPDF2** - Leitura de PDFs
- **python-Levenshtein** - Fuzzy matching
- **reportlab** - Geração de PDFs

### Estrutura do Projeto
```
invoice-confirmation-app/
├── src/
│   ├── models/          # Modelos de dados
│   ├── parsers/         # Importadores
│   ├── services/        # Lógica de negócio
│   ├── gui/             # Interface gráfica
│   └── utils/           # Utilitários
├── tests/               # Testes unitários
├── docs/                # Documentação
└── resources/           # Recursos (ícones, templates)
```

### Padrão Arquitetural
- **MVC Adaptado** + **Service Layer**
- Separação clara de responsabilidades
- Código modular e testável

---

## 🧪 Testes

### Executar Testes
```bash
pytest tests/ -v
```

### Cobertura
```bash
pytest tests/ --cov=src --cov-report=html
```

---

## 📦 Build para Produção

### Criar Executável Windows

```bash
# Instalar PyInstaller
pip install pyinstaller

# Criar executável
pyinstaller build.spec

# Resultado em: dist/InvoiceConfirmationApp.exe
```

O executável é **standalone** (não precisa Python instalado).

---

## 🔧 Configuração

### Ficheiro de Configuração
`config/user_config.json`

```json
{
  "similarity_threshold": 0.85,
  "operator_name": "João Silva",
  "default_export_folder": "C:/Relatorios"
}
```

### Logs
Logs automáticos em: `logs/app_YYYYMMDD.log`

---

## 🛠️ Desenvolvimento

### Adicionar Nova Funcionalidade

1. Criar branch
```bash
git checkout -b feature/nova-funcionalidade
```

2. Implementar
```python
# src/services/novo_servico.py
class NovoServico:
    ...
```

3. Testar
```bash
pytest tests/test_novo_servico.py
```

4. Commit
```bash
git add .
git commit -m "feat: adicionar nova funcionalidade"
git push
```

### Code Style
- **Black** para formatação
- **Flake8** para linting
- **mypy** para type checking

```bash
black src/
flake8 src/
mypy src/
```

---

## 📈 Roadmap

### Versão 1.1 (Q2 2024)
- [ ] Integração com API do SAGE
- [ ] OCR para faturas em papel
- [ ] Dashboard de estatísticas

### Versão 2.0 (Q3 2024)
- [ ] Machine Learning para normalização
- [ ] Portal web complementar
- [ ] Multi-utilizador

---

## 🐛 Reportar Bugs

Encontrou um bug? Abra um issue:
1. Descreva o problema
2. Passos para reproduzir
3. Comportamento esperado
4. Screenshots (se aplicável)

---

## 📞 Suporte

- **Email**: suporte@empresa.pt
- **Documentação**: [USER_GUIDE.md](docs/USER_GUIDE.md)
- **FAQ**: [Perguntas Frequentes](docs/FAQ.md)

---

## 📄 Licença

© 2024 Todos os direitos reservados.

---

## 👥 Contribuidores

- **Arquitetura**: Equipa de Desenvolvimento
- **Backend**: Equipa de Desenvolvimento
- **Frontend**: Equipa de Desenvolvimento
- **Testes**: Equipa QA

---

## 🙏 Agradecimentos

Obrigado a todos que contribuíram para este projeto!

---

**Versão**: 1.0.0
**Última atualização**: Janeiro 2024
