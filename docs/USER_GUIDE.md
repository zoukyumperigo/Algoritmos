# 📘 Guia do Utilizador - Invoice Confirmation App

Guia completo para utilizadores finais da aplicação.

---

## 🎯 Introdução

O Invoice Confirmation App ajuda a **eliminar erros** na emissão de faturas, comparando automaticamente pedidos do WhatsApp com faturas do SAGE.

### Quem deve usar?
- Operadores administrativos
- Contabilistas
- Gestores de faturação
- Equipas financeiras

---

## 🚀 Começar a Usar

### 1. Abrir a Aplicação

Duplo clique no ícone **Invoice Confirmation App** no ambiente de trabalho.

![Janela Principal](../resources/screenshots/main_window.png)

Verá 3 painéis:
- **Esquerda**: Pedido WhatsApp
- **Centro**: Resultado da comparação
- **Direita**: Fatura SAGE

---

## 📥 Importar Pedido WhatsApp

### Método 1: Ficheiro TXT (Recomendado)

1. Clicar em **📁 Importar WhatsApp**
2. Escolher **Ficheiro TXT**
3. Navegar até ao ficheiro
4. Clicar em **Abrir**

### Método 2: Copiar/Colar

1. No WhatsApp, selecionar a mensagem completa
2. Copiar (Ctrl+C)
3. Na aplicação, clicar em **📁 Importar WhatsApp**
4. Escolher **Copiar/Colar**
5. Colar o texto (Ctrl+V)
6. Clicar em **OK**

### ⚠️ Formato Correto

O pedido deve seguir SEMPRE esta estrutura:

```
DISTRIBUIDOR LDA
Restaurante Nome do Cliente
5 PRODUTO A
2 PRODUTO B
1 PRODUTO C
```

**Importante:**
- Linha 1: Nome do distribuidor
- Linha 2: Nome do restaurante (pode ter ou não "Restaurante" no início)
- Linhas seguintes: Quantidade + Nome do Produto

**Exemplos válidos:**

✅ Correto:
```
MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO 20/30
2 POTA LIMPA
```

✅ Também correto:
```
PEIXARIA CENTRAL SA
Sol Nascente
5 kg CAMARÃO 20/30
2x POTA LIMPA
```

❌ Incorreto:
```
Boa tarde, queria pedir:
5 CAMARÃO
2 POTA
Obrigado!
```

---

## 📊 Importar Fatura SAGE

### Formatos Suportados

- ✅ **Excel** (.xlsx, .xls) - Recomendado
- ✅ **CSV** (.csv)
- ✅ **PDF** (.pdf)

### Como Importar

1. Clicar em **📁 Importar Fatura**
2. Selecionar o ficheiro da fatura
3. Clicar em **Abrir**

### Dicas para Melhores Resultados

#### Excel/CSV
A aplicação deteta automaticamente as colunas. Estruturas aceites:

**Formato 1:**
| Produto | Quantidade | Preço | Total |
|---------|-----------|-------|-------|
| CAMARÃO | 5 | 12.00 | 60.00 |

**Formato 2:**
| Artigo | Qtd | PVP |
|--------|-----|-----|
| CAMARÃO 20/30 | 5 | 12.00 |

**Formato 3:**
| Descrição | Quantidade |
|-----------|-----------|
| CAMARÃO 20/30 | 5 |

#### PDF
A aplicação extrai texto do PDF automaticamente. Para melhores resultados:
- PDFs nativos (não digitalizados)
- Formatação clara
- Produtos em linhas separadas

---

## 🔍 Comparar Pedido vs Fatura

### Executar Comparação

1. Importar pedido WhatsApp
2. Importar fatura SAGE
3. Clicar em **🔍 Comparar**
4. Aguardar 2-5 segundos

### Interpretar Resultados

#### ✅ Status: OK (Verde)
**Significado**: Pedido e fatura estão 100% corretos.

**Ação**: Nenhuma. Pode prosseguir com a fatura.

#### 🟡 Status: AVISO (Amarelo)
**Significado**: Pequenas diferenças detetadas (ex: quantidade ligeiramente diferente).

**Exemplo:**
```
🟡 QUANTIDADE DIFERENTE
Produto: POTA LIMPA
Esperado: 2
Obtido: 3
Diferença: +1 unidade
```

**Ação**: Verificar se a diferença é intencional. Se for erro, corrigir a fatura.

#### 🔴 Status: ERRO (Vermelho)
**Significado**: Erros graves detetados.

**Exemplos:**

**Produto em falta:**
```
🔴 PRODUTO EM FALTA
Produto: LULA INTEIRA
Esperado: 1
Obtido: 0
```

**Produto não pedido:**
```
🔴 PRODUTO NÃO PEDIDO
Produto: POLVO
Esperado: 0
Obtido: 2
```

**Ação**: **SEMPRE corrigir** a fatura antes de enviar ao cliente.

#### 🔴 Status: ERRO CRÍTICO (Vermelho Escuro)
**Significado**: Cliente ou distribuidor errado.

**Exemplo:**
```
🔴 CLIENTE DIFERENTE
Esperado: Restaurante Sol Nascente
Obtido: Restaurante Lua Cheia
```

**Ação**: **PARAR IMEDIATAMENTE**. Fatura está completamente errada. Verificar no SAGE.

---

## 📄 Gerar Relatórios

### Relatório PDF

**Quando usar:**
- Para impressão
- Para enviar por email
- Para arquivo físico

**Como gerar:**
1. Após comparação, clicar em **📄 Relatório PDF**
2. Escolher pasta e nome do ficheiro
3. Clicar em **Guardar**
4. Abrir ficheiro (opcional)

**Conteúdo:**
- Resumo executivo
- Lista de divergências
- Dados do pedido e fatura
- Timestamp e operador

### Relatório Excel

**Quando usar:**
- Para análise de dados
- Para estatísticas
- Para integração com outros sistemas

**Como gerar:**
1. Após comparação, clicar em **📊 Relatório Excel**
2. Escolher pasta e nome do ficheiro
3. Clicar em **Guardar**
4. Abrir ficheiro (opcional)

**Conteúdo:**
- Aba 1: Resumo
- Aba 2: Divergências (tabela)
- Aba 3: Detalhes completos

---

## 🔧 Resolver Problemas Comuns

### Problema: "Nenhum produto encontrado"

**Causa**: Formato do WhatsApp incorreto.

**Solução:**
1. Verificar se cada linha de produto tem quantidade + nome
2. Verificar se não há texto extra (ex: "Boa tarde", "Obrigado")
3. Usar formato limpo (ver exemplos acima)

### Problema: "Erro ao importar Excel"

**Causa**: Ficheiro corrompido ou formato não standard.

**Solução:**
1. Abrir Excel manualmente para verificar se abre
2. Verificar se tem pelo menos 2 colunas (Produto, Quantidade)
3. Exportar novamente do SAGE
4. Tentar exportar como CSV

### Problema: "Muitos falsos positivos"

**Causa**: Nomes de produtos muito diferentes entre pedido e fatura.

**Exemplo:**
- Pedido: "CAMARAO 20/30"
- Fatura: "CAMARÃO VERMELHO 20-30"

**Solução:**
1. Padronizar nomes no SAGE
2. Usar sempre os mesmos nomes no WhatsApp
3. Evitar abreviações excessivas

### Problema: Aplicação não abre

**Solução:**
1. Verificar se tem permissões de administrador
2. Verificar antivírus (pode estar a bloquear)
3. Reinstalar aplicação
4. Contactar suporte

---

## 💡 Dicas e Boas Práticas

### ✅ Fazer

- Usar sempre o mesmo formato no WhatsApp
- Verificar pedidos antes de importar
- Guardar relatórios de todas as validações
- Corrigir erros imediatamente
- Treinar equipa no formato correto

### ❌ Evitar

- Misturar conversa com pedidos no WhatsApp
- Usar abreviações não padronizadas
- Ignorar avisos amarelos
- Enviar faturas sem validar
- Adicionar texto extra nos pedidos

---

## 📊 Interpretar Confiança

A aplicação calcula um **score de confiança** (0-100%):

- **100%**: Perfeito, sem divergências
- **95-99%**: Muito bom, só avisos leves
- **80-94%**: Aceitável, verificar avisos
- **50-79%**: Problemas médios, corrigir erros
- **< 50%**: Graves problemas, refazer fatura

**Regra geral**: Não enviar faturas com confiança < 95%.

---

## 🎓 Exemplos Práticos

### Exemplo 1: Validação Perfeita

**Pedido WhatsApp:**
```
MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO 20/30
2 POTA LIMPA
1 LULA INTEIRA
```

**Fatura SAGE:**
```
Cliente: Restaurante Sol Nascente
5x CAMARÃO 20/30
2x POTA LIMPA
1x LULA INTEIRA
```

**Resultado:**
```
✅ STATUS: OK
CONFIANÇA: 100%
Nenhuma divergência encontrada.
```

### Exemplo 2: Quantidade Diferente

**Pedido WhatsApp:**
```
MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO 20/30
```

**Fatura SAGE:**
```
Cliente: Restaurante Sol Nascente
3x CAMARÃO 20/30
```

**Resultado:**
```
🟡 STATUS: AVISO
CONFIANÇA: 90%

🟡 QUANTIDADE DIFERENTE
Produto: CAMARÃO 20/30
Esperado: 5
Obtido: 3
```

**Ação**: Ligar ao cliente para confirmar se pediu 5 ou 3.

### Exemplo 3: Produto em Falta

**Pedido WhatsApp:**
```
MAR AZUL LDA
Restaurante Sol Nascente
5 CAMARÃO 20/30
2 POTA LIMPA
1 LULA INTEIRA
```

**Fatura SAGE:**
```
Cliente: Restaurante Sol Nascente
5x CAMARÃO 20/30
2x POTA LIMPA
```

**Resultado:**
```
🔴 STATUS: ERRO
CONFIANÇA: 75%

🔴 PRODUTO EM FALTA
Produto: LULA INTEIRA
Esperado: 1
Obtido: 0
```

**Ação**: Adicionar LULA INTEIRA à fatura.

---

## 📞 Contactos

**Suporte Técnico:**
- Email: suporte@empresa.pt
- Telefone: +351 XXX XXX XXX
- Horário: 9h-18h (dias úteis)

**Formação:**
- Sessões mensais
- Inscrição: formacao@empresa.pt

---

**Última atualização**: Janeiro 2024
**Versão do guia**: 1.0
