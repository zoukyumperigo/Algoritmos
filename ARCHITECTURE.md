# 🏗️ ARQUITETURA DA APLICAÇÃO - INVOICE CONFIRMATION APP

## 📊 VISÃO GERAL

Sistema desktop para validação automática de faturas SAGE contra pedidos de WhatsApp.

### Contexto do Negócio
- **Problema**: Erros humanos na emissão de faturas (produto errado, quantidade errada, cliente errado)
- **Solução**: Comparação automática pedido vs fatura com deteção inteligente de divergências
- **Utilizadores**: Operadores administrativos, contabilistas, gestores

---

## 🎯 STACK TECNOLÓGICA ESCOLHIDA

### **Python 3.10+ com PySide6 (Qt)**

#### Justificação da Escolha:

| Critério | Pontuação | Justificação |
|----------|-----------|--------------|
| **Performance** | ⭐⭐⭐⭐ | Qt é nativo, rápido e leve |
| **Parsing de dados** | ⭐⭐⭐⭐⭐ | Python tem as melhores bibliotecas (pandas, openpyxl, PyPDF2) |
| **GUI Windows** | ⭐⭐⭐⭐⭐ | Qt produz interfaces nativas indistinguíveis de apps nativas |
| **Manutenibilidade** | ⭐⭐⭐⭐⭐ | Código Python é limpo e fácil de manter |
| **Deployment** | ⭐⭐⭐⭐ | PyInstaller cria executável único para Windows |
| **Custo** | ⭐⭐⭐⭐⭐ | 100% open-source e gratuito |

#### Alternativas Rejeitadas:
- **Electron**: Muito pesado (>100MB), consome muita RAM
- **.NET/WPF**: Menos bibliotecas para parsing, lock-in Microsoft
- **Java/Swing**: Interface desatualizada, JRE necessário

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

```
PySide6==6.6.0              # Framework GUI (Qt para Python)
pandas==2.1.4               # Manipulação de dados estruturados
openpyxl==3.1.2             # Leitura/escrita de Excel
PyPDF2==3.0.1               # Extração de texto de PDFs
python-Levenshtein==0.23.0  # Fuzzy matching para normalização
reportlab==4.0.7            # Geração de PDFs
xlsxwriter==3.1.9           # Geração de Excel com formatação
pyinstaller==6.3.0          # Empacotamento para Windows
```

---

## 🏛️ ARQUITETURA DA APLICAÇÃO

### Padrão Arquitetural: **MVC Adaptado + Service Layer**

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│                   (PySide6 GUI - Qt)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ MainWindow   │  │ ComparePanel │  │ ReportDialog │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC                       │
│                     (Service Layer)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ ParseService │  │CompareService│  │ReportService │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                          │
│                    (Parsers + Models)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │WhatsAppParser│  │  SageParser  │  │  DataModels  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                        │
│            (File System, PDF/Excel I/O)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUTURA DE PASTAS

```
invoice-confirmation-app/
│
├── src/
│   ├── __init__.py
│   │
│   ├── models/                      # Modelos de dados
│   │   ├── __init__.py
│   │   ├── order.py                 # Modelo de Pedido (Order)
│   │   ├── invoice.py               # Modelo de Fatura (Invoice)
│   │   └── comparison.py            # Modelo de Comparação
│   │
│   ├── parsers/                     # Parsers de input
│   │   ├── __init__.py
│   │   ├── whatsapp_parser.py       # Parser de mensagens WhatsApp
│   │   ├── sage_excel_parser.py     # Parser de Excel do SAGE
│   │   ├── sage_csv_parser.py       # Parser de CSV do SAGE
│   │   └── sage_pdf_parser.py       # Parser de PDF do SAGE
│   │
│   ├── services/                    # Lógica de negócio
│   │   ├── __init__.py
│   │   ├── comparison_service.py    # Motor de comparação
│   │   ├── normalization_service.py # Normalização de nomes
│   │   └── report_service.py        # Geração de relatórios
│   │
│   ├── gui/                         # Interface gráfica
│   │   ├── __init__.py
│   │   ├── main_window.py           # Janela principal
│   │   ├── compare_panel.py         # Painel de comparação
│   │   ├── widgets/                 # Widgets personalizados
│   │   │   ├── __init__.py
│   │   │   ├── order_view.py        # Vista do pedido
│   │   │   ├── invoice_view.py      # Vista da fatura
│   │   │   └── diff_view.py         # Vista de diferenças
│   │   └── styles/                  # Estilos Qt
│   │       └── app_style.qss
│   │
│   ├── utils/                       # Utilitários
│   │   ├── __init__.py
│   │   ├── file_handler.py          # Gestão de ficheiros
│   │   ├── logger.py                # Sistema de logs
│   │   └── config.py                # Configurações
│   │
│   └── main.py                      # Entry point da aplicação
│
├── tests/                           # Testes unitários
│   ├── __init__.py
│   ├── test_parsers.py
│   ├── test_comparison.py
│   └── test_data/
│       ├── sample_whatsapp.txt
│       ├── sample_invoice.xlsx
│       └── sample_invoice.pdf
│
├── resources/                       # Recursos da aplicação
│   ├── icons/
│   ├── images/
│   └── templates/
│       ├── report_template.html
│       └── excel_template.xlsx
│
├── docs/                           # Documentação
│   ├── USER_GUIDE.md               # Guia do utilizador
│   ├── ARCHITECTURE.md             # Este documento
│   └── API_SAGE.md                 # Documentação futura API SAGE
│
├── build/                          # Ficheiros de build (gitignore)
├── dist/                           # Executável final (gitignore)
│
├── requirements.txt                # Dependências Python
├── requirements-dev.txt            # Dependências de desenvolvimento
├── setup.py                        # Script de instalação
├── build.spec                      # Configuração PyInstaller
├── README.md                       # Readme principal
└── .gitignore
```

---

## 🔄 FLUXO COMPLETO DO UTILIZADOR

### Cenário 1: Comparação Básica

```
1. ABRIR APLICAÇÃO
   └─> Janela principal com 3 painéis vazios

2. IMPORTAR PEDIDO WHATSAPP
   ├─> Botão "Importar WhatsApp"
   ├─> Escolher método:
   │   ├─> Ficheiro TXT
   │   ├─> Copiar/Colar
   │   └─> Exportação WhatsApp Web
   └─> Parser extrai:
       ├─> Distribuidor
       ├─> Cliente
       └─> Lista de produtos + quantidades

3. IMPORTAR FATURA SAGE
   ├─> Botão "Importar Fatura"
   ├─> Escolher formato:
   │   ├─> Excel (.xlsx, .xls)
   │   ├─> CSV
   │   └─> PDF
   └─> Parser extrai os mesmos campos

4. COMPARAÇÃO AUTOMÁTICA
   ├─> Sistema normaliza nomes de produtos
   ├─> Compara campo a campo
   └─> Gera lista de divergências

5. VISUALIZAÇÃO DE RESULTADOS
   ├─> Painel esquerdo: Pedido (formato original)
   ├─> Painel direito: Fatura (formato original)
   └─> Painel central: Diferenças com cores:
       ├─> 🟢 Verde: Tudo correto
       ├─> 🟡 Amarelo: Divergência leve (quantidade)
       └─> 🔴 Vermelho: Erro grave (produto errado, cliente errado)

6. GERAR RELATÓRIO
   ├─> Botão "Exportar Relatório"
   ├─> Escolher formato (PDF ou Excel)
   ├─> Sistema gera relatório com:
   │   ├─> Cabeçalho (data, hora, operador)
   │   ├─> Resumo executivo
   │   ├─> Lista de divergências
   │   └─> Detalhes completos
   └─> Abrir/Guardar ficheiro
```

---

## 🧠 LÓGICA DE COMPARAÇÃO

### Algoritmo de Comparação (Pseudo-código)

```python
def comparar_pedido_fatura(pedido: Order, fatura: Invoice) -> ComparisonResult:
    """
    Compara pedido do WhatsApp com fatura do SAGE.

    Retorna objeto com:
    - status: OK / WARNING / ERROR
    - divergencias: lista de Divergence objects
    - confianca: score 0-100%
    """

    resultado = ComparisonResult()

    # 1. VALIDAR CLIENTE
    if not normalizar(pedido.cliente) == normalizar(fatura.cliente):
        resultado.adicionar_divergencia(
            tipo="CLIENTE_DIFERENTE",
            severidade="CRITICO",
            esperado=pedido.cliente,
            obtido=fatura.cliente
        )
        return resultado  # Erro crítico, parar aqui

    # 2. VALIDAR DISTRIBUIDOR
    if not normalizar(pedido.distribuidor) == normalizar(fatura.distribuidor):
        resultado.adicionar_divergencia(
            tipo="DISTRIBUIDOR_DIFERENTE",
            severidade="CRITICO"
        )

    # 3. CRIAR MAPAS DE PRODUTOS
    produtos_pedido = {normalizar(p.nome): p.quantidade for p in pedido.produtos}
    produtos_fatura = {normalizar(p.nome): p.quantidade for p in fatura.produtos}

    # 4. VERIFICAR PRODUTOS EM FALTA
    for nome_produto, qtd_pedido in produtos_pedido.items():
        if nome_produto not in produtos_fatura:
            # Tentar fuzzy match (ex: "CAMARAO" vs "CAMARÃO")
            match = encontrar_similar(nome_produto, produtos_fatura.keys())

            if match and similaridade(nome_produto, match) > 0.85:
                # Produto encontrado com nome ligeiramente diferente
                qtd_fatura = produtos_fatura[match]

                if qtd_pedido != qtd_fatura:
                    resultado.adicionar_divergencia(
                        tipo="QUANTIDADE_DIFERENTE",
                        severidade="AVISO",
                        produto=nome_produto,
                        esperado=qtd_pedido,
                        obtido=qtd_fatura
                    )
            else:
                # Produto não encontrado
                resultado.adicionar_divergencia(
                    tipo="PRODUTO_EM_FALTA",
                    severidade="ERRO",
                    produto=nome_produto,
                    esperado=qtd_pedido,
                    obtido=0
                )

    # 5. VERIFICAR PRODUTOS A MAIS
    for nome_produto, qtd_fatura in produtos_fatura.items():
        if nome_produto not in produtos_pedido:
            if not encontrar_similar(nome_produto, produtos_pedido.keys()):
                resultado.adicionar_divergencia(
                    tipo="PRODUTO_NAO_PEDIDO",
                    severidade="ERRO",
                    produto=nome_produto,
                    esperado=0,
                    obtido=qtd_fatura
                )

    # 6. CALCULAR SCORE DE CONFIANÇA
    resultado.calcular_confianca()

    return resultado
```

### Normalização de Nomes

```python
def normalizar(texto: str) -> str:
    """
    Normaliza texto para comparação.

    Transformações:
    - Remove acentos: "CAMARÃO" -> "CAMARAO"
    - Remove espaços extra: "POTA  LIMPA" -> "POTA LIMPA"
    - Uppercase: "Lula" -> "LULA"
    - Remove pontuação: "20/30" -> "20 30"
    """
    import unicodedata
    import re

    # Remover acentos
    texto = ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    )

    # Uppercase
    texto = texto.upper()

    # Remover caracteres especiais (manter letras, números, espaços)
    texto = re.sub(r'[^A-Z0-9\s]', ' ', texto)

    # Remover espaços extra
    texto = ' '.join(texto.split())

    return texto


def encontrar_similar(produto: str, lista_produtos: list, limiar=0.85) -> str:
    """
    Encontra produto similar usando Levenshtein distance.

    Retorna melhor match se similaridade > limiar, senão None.
    """
    from Levenshtein import ratio

    melhor_match = None
    melhor_score = 0

    for candidato in lista_produtos:
        score = ratio(produto, candidato)
        if score > melhor_score and score >= limiar:
            melhor_score = score
            melhor_match = candidato

    return melhor_match
```

---

## 🎨 DESIGN DA INTERFACE

### Layout Principal

```
┌────────────────────────────────────────────────────────────────┐
│ Invoice Confirmation App                          [_][□][X]    │
├────────────────────────────────────────────────────────────────┤
│ Arquivo  Editar  Ver  Ferramentas  Ajuda                       │
├────────────────────────────────────────────────────────────────┤
│ [📁 Importar WhatsApp] [📁 Importar Fatura] [🔍 Comparar] [📄 Relatório] │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐ │
│  │ PEDIDO WHATSAPP │ │   COMPARAÇÃO     │ │  FATURA SAGE    │ │
│  ├─────────────────┤ ├──────────────────┤ ├─────────────────┤ │
│  │                 │ │                  │ │                 │ │
│  │ MAR AZUL LDA    │ │ Status: ❌ ERRO  │ │ MAR AZUL LDA    │ │
│  │                 │ │                  │ │                 │ │
│  │ Restaurante:    │ │ Divergências: 2  │ │ Cliente:        │ │
│  │ Sol Nascente    │ │                  │ │ Sol Nascente    │ │
│  │                 │ │ ┌──────────────┐ │ │                 │ │
│  │ Produtos:       │ │ │🔴 PRODUTO    │ │ │ Produtos:       │ │
│  │ 5 CAMARÃO 20/30 │ │ │  EM FALTA    │ │ │ 5 CAMARÃO 20/30 │ │
│  │ 2 POTA LIMPA    │ │ │              │ │ │ 3 POTA LIMPA ⚠️ │ │
│  │ 1 LULA INTEIRA  │ │ │  Esperado: 1 │ │ │                 │ │
│  │                 │ │ │  LULA INTEIRA│ │ │                 │ │
│  │                 │ │ │  Obtido: 0   │ │ │                 │ │
│  │                 │ │ │              │ │ │                 │ │
│  │                 │ │ │🟡 QUANTIDADE │ │ │                 │ │
│  │                 │ │ │  DIFERENTE   │ │ │                 │ │
│  │                 │ │ │              │ │ │                 │ │
│  │                 │ │ │  POTA LIMPA  │ │ │                 │ │
│  │                 │ │ │  Esperado: 2 │ │ │                 │ │
│  │                 │ │ │  Obtido: 3   │ │ │                 │ │
│  └─────────────────┘ └──────────────────┘ └─────────────────┘ │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│ Status: Pronto | Operador: utilizador | Data: 2024-01-15      │
└────────────────────────────────────────────────────────────────┘
```

### Código de Cores

```python
CORES = {
    "SUCESSO": "#4CAF50",      # Verde - Tudo correto
    "AVISO": "#FFC107",        # Amarelo - Divergência leve
    "ERRO": "#F44336",         # Vermelho - Erro grave
    "INFO": "#2196F3",         # Azul - Informação
    "NEUTRO": "#9E9E9E"        # Cinza - Sem dados
}

SEVERIDADES = {
    "CRITICO": "ERRO",         # Cliente errado, distribuidor errado
    "ERRO": "ERRO",            # Produto em falta, produto a mais
    "AVISO": "AVISO",          # Quantidade diferente (pequena)
    "INFO": "INFO"             # Notas, observações
}
```

---

## 📄 FORMATO DE RELATÓRIOS

### Relatório PDF

```
┌─────────────────────────────────────────────────────────┐
│         RELATÓRIO DE VALIDAÇÃO DE FATURA                │
│                                                          │
│  Data: 15/01/2024 14:35                                 │
│  Operador: João Silva                                   │
│  Status: ❌ ERRO DETETADO                               │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  RESUMO EXECUTIVO                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Cliente: Restaurante Sol Nascente                      │
│  Distribuidor: MAR AZUL LDA                             │
│  Nº Fatura: FAT-2024-00123 (se disponível)             │
│                                                          │
│  Total de divergências: 2                               │
│  └─ Erros críticos: 1                                   │
│  └─ Avisos: 1                                           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  DIVERGÊNCIAS DETETADAS                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🔴 ERRO #1: PRODUTO EM FALTA                           │
│     Produto: LULA INTEIRA                               │
│     Quantidade pedida: 1                                │
│     Quantidade faturada: 0                              │
│     Impacto: CRÍTICO                                    │
│                                                          │
│  🟡 AVISO #2: QUANTIDADE DIFERENTE                      │
│     Produto: POTA LIMPA                                 │
│     Quantidade pedida: 2                                │
│     Quantidade faturada: 3                              │
│     Diferença: +1 unidade                               │
│     Impacto: MÉDIO                                      │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  PRODUTOS CORRETOS                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ CAMARÃO 20/30: 5 unidades                           │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  RECOMENDAÇÕES                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  • Verificar falta de LULA INTEIRA na fatura            │
│  • Confirmar quantidade de POTA LIMPA com cliente       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Relatório Excel

```
Aba 1 - RESUMO
┌─────────────┬──────────────────────────┐
│ Campo       │ Valor                    │
├─────────────┼──────────────────────────┤
│ Data        │ 15/01/2024 14:35        │
│ Operador    │ João Silva               │
│ Cliente     │ Rest. Sol Nascente       │
│ Distribuidor│ MAR AZUL LDA             │
│ Status      │ ERRO                     │
│ Divergências│ 2                        │
└─────────────┴──────────────────────────┘

Aba 2 - DIVERGÊNCIAS
┌──────┬─────────────────┬──────────┬──────────┬────────────┬───────────┐
│ #    │ Tipo            │ Produto  │ Esperado │ Obtido     │ Severidade│
├──────┼─────────────────┼──────────┼──────────┼────────────┼───────────┤
│ 1    │ PRODUTO_FALTA   │ LULA INT │ 1        │ 0          │ ERRO      │
│ 2    │ QTD_DIFERENTE   │ POTA LIM │ 2        │ 3          │ AVISO     │
└──────┴─────────────────┴──────────┴──────────┴────────────┴───────────┘

Aba 3 - DETALHES COMPLETOS
[Dados completos do pedido e fatura]
```

---

## 🚀 MELHORIAS FUTURAS (ROADMAP)

### Fase 2 - Automação Avançada (3-6 meses)

1. **Integração direta com SAGE**
   - API REST para importar faturas automaticamente
   - Sincronização em tempo real
   - Sem necessidade de exportação manual

2. **OCR para faturas em papel**
   - Scanner integrado
   - Reconhecimento de texto com Tesseract
   - Validação de faturas físicas

3. **Integração com WhatsApp Business API**
   - Importação automática de mensagens
   - Sem necessidade de exportação manual
   - Notificações em tempo real

### Fase 3 - Inteligência Artificial (6-12 meses)

1. **Machine Learning para normalização**
   - Treinar modelo para reconhecer produtos
   - Aprender variações de nomes automaticamente
   - Melhorar precisão ao longo do tempo

2. **Deteção de padrões**
   - Identificar erros recorrentes
   - Sugerir correções automáticas
   - Alertas proativos

3. **Análise preditiva**
   - Prever erros antes de acontecerem
   - Sugestões de validação extra
   - Dashboard de métricas

### Fase 4 - Multi-empresa (12-18 meses)

1. **Suporte para múltiplos clientes**
   - Configuração por empresa
   - Templates personalizados
   - Base de dados centralizada

2. **Portal web complementar**
   - Acesso remoto via browser
   - Sincronização multi-dispositivo
   - Colaboração em equipa

3. **API pública**
   - Permitir integrações externas
   - Webhooks para eventos
   - Documentação completa

---

## 🔐 SEGURANÇA E COMPLIANCE

### Dados Sensíveis

- **Não armazenar** dados financeiros sem encriptação
- **Logs anonimizados** (sem nomes de clientes)
- **Sessões temporárias** (dados limpos após uso)

### RGPD (GDPR)

- Consentimento para guardar relatórios
- Direito ao esquecimento (apagar dados)
- Exportação de dados pessoais

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs Principais

1. **Taxa de deteção de erros**: > 95%
2. **Falsos positivos**: < 5%
3. **Tempo de validação**: < 30 segundos
4. **Satisfação do utilizador**: > 4/5

### Monitorização

- Logs de todas as comparações
- Estatísticas de uso
- Relatório mensal de performance

---

## 🛠️ DEPLOYMENT

### Build para Windows

```bash
# Instalar dependências
pip install -r requirements.txt

# Criar executável
pyinstaller build.spec

# Resultado: dist/InvoiceConfirmationApp.exe (executável único)
```

### Instalação

1. Copiar `.exe` para pasta desejada
2. Executar pela primeira vez (pode demorar alguns segundos)
3. Criar atalho no ambiente de trabalho (opcional)

### Atualizações

- Sistema de auto-update (verificar versão no GitHub)
- Notificar utilizador quando nova versão disponível
- Download e instalação automática (opcional)

---

## 📞 SUPORTE

### Níveis de Suporte

1. **Tier 1**: FAQ e documentação
2. **Tier 2**: Email (suporte@empresa.pt)
3. **Tier 3**: Telefone/TeamViewer para casos críticos

---

**Versão**: 1.0.0
**Data**: Janeiro 2024
**Autor**: Equipa de Desenvolvimento
