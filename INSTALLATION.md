# 🚀 Guia de Instalação - Invoice Confirmation App

Instruções completas para instalar e configurar a aplicação.

---

## 📋 Requisitos do Sistema

### Windows
- **Sistema Operativo**: Windows 10/11 (64-bit)
- **RAM**: Mínimo 4GB (Recomendado 8GB)
- **Espaço em Disco**: 500MB livres
- **Resolução**: Mínimo 1280x720

### Software (apenas para desenvolvimento)
- **Python**: 3.10 ou superior
- **Git**: Para controlo de versão

---

## 🎯 Instalação para Utilizadores Finais

### Opção 1: Executável Standalone (RECOMENDADO)

1. **Download do Executável**
   - Ir para a pasta `dist/`
   - Copiar `InvoiceConfirmationApp.exe`

2. **Instalação**
   - Copiar o ficheiro `.exe` para pasta desejada
   - Ex: `C:\Programas\InvoiceApp\`

3. **Criar Atalho (Opcional)**
   - Clicar com botão direito no `.exe`
   - "Criar atalho"
   - Mover atalho para Ambiente de Trabalho

4. **Primeira Execução**
   - Duplo clique no executável
   - Pode demorar 5-10 segundos a abrir na primeira vez
   - Se antivírus bloquear, adicionar exceção

---

## 👨‍💻 Instalação para Desenvolvimento

### 1. Clonar Repositório

```bash
git clone https://github.com/empresa/invoice-confirmation-app.git
cd invoice-confirmation-app
```

### 2. Criar Ambiente Virtual

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar Dependências

```bash
# Dependências de produção
pip install -r requirements.txt

# Dependências de desenvolvimento (opcional)
pip install -r requirements-dev.txt
```

### 4. Verificar Instalação

```bash
python src/main.py
```

Se a janela da aplicação abrir, instalação foi bem sucedida! ✅

---

## 🔧 Configuração Inicial

### Criar Diretórios

Os diretórios são criados automaticamente na primeira execução:
- `config/` - Configurações
- `logs/` - Ficheiros de log

### Configuração Personalizada (Opcional)

Criar ficheiro `config/user_config.json`:

```json
{
  "operator_name": "João Silva",
  "similarity_threshold": 0.85,
  "default_export_folder": "C:/Relatorios",
  "auto_open_reports": true
}
```

**Opções disponíveis:**
- `operator_name`: Nome que aparece nos relatórios
- `similarity_threshold`: Limiar para fuzzy matching (0.0-1.0)
- `default_export_folder`: Pasta padrão para relatórios
- `auto_open_reports`: Abrir relatórios automaticamente (true/false)

---

## 🏗️ Build do Executável

### Preparação

1. **Instalar PyInstaller**
```bash
pip install pyinstaller
```

2. **Verificar build.spec**
   - Ficheiro já configurado no repositório
   - Modificar se necessário (ícone, nome, etc.)

### Build Windows

**Método 1: Script Automático**
```bash
build.bat
```

**Método 2: Manual**
```bash
# Limpar builds anteriores
rmdir /s /q build dist

# Criar executável
pyinstaller build.spec

# Resultado em: dist/InvoiceConfirmationApp.exe
```

### Testar Executável

```bash
cd dist
InvoiceConfirmationApp.exe
```

### Distribuição

1. **Ficheiro Único**
   - O executável é standalone (não precisa instalação)
   - Copiar `InvoiceConfirmationApp.exe` é suficiente

2. **Instalador (Opcional)**
   - Usar Inno Setup ou NSIS
   - Criar instalador `.msi` ou `.exe`

---

## 🧪 Testes

### Executar Testes Unitários

```bash
pytest tests/ -v
```

### Testes com Cobertura

```bash
pytest tests/ --cov=src --cov-report=html
```

Ver relatório em: `htmlcov/index.html`

### Testes Específicos

```bash
# Testes de parsers
pytest tests/test_parsers.py -v

# Testes de comparação
pytest tests/test_comparison.py -v
```

---

## 📊 Verificação de Qualidade de Código

### Formatação (Black)

```bash
black src/ --check
```

Aplicar formatação:
```bash
black src/
```

### Linting (Flake8)

```bash
flake8 src/ --max-line-length=120
```

### Type Checking (MyPy)

```bash
mypy src/
```

---

## 🐛 Troubleshooting

### Problema: ModuleNotFoundError

**Erro:**
```
ModuleNotFoundError: No module named 'PySide6'
```

**Solução:**
```bash
pip install -r requirements.txt
```

### Problema: PyInstaller não encontrado

**Erro:**
```
'pyinstaller' is not recognized...
```

**Solução:**
```bash
pip install pyinstaller
```

### Problema: Executável não abre

**Possíveis causas:**
1. Antivírus bloqueando
   - Adicionar exceção
2. Falta DLLs do sistema
   - Instalar Visual C++ Redistributable
3. Permissões insuficientes
   - Executar como administrador

### Problema: Erro ao importar Excel

**Erro:**
```
ModuleNotFoundError: No module named 'openpyxl'
```

**Solução:**
```bash
pip install openpyxl
```

### Problema: Erro ao gerar PDF

**Erro:**
```
ModuleNotFoundError: No module named 'reportlab'
```

**Solução:**
```bash
pip install reportlab
```

---

## 🔄 Atualizações

### Atualizar Código

```bash
git pull origin main
pip install -r requirements.txt --upgrade
```

### Atualizar Executável

1. Fazer pull do código
2. Executar `build.bat`
3. Substituir executável antigo

---

## 📦 Deployment em Produção

### Preparação

1. **Testar exaustivamente**
   ```bash
   pytest tests/ -v
   ```

2. **Build limpo**
   ```bash
   rmdir /s /q build dist
   pyinstaller build.spec
   ```

3. **Testar executável**
   - Testar em máquina limpa (sem Python)
   - Testar todas as funcionalidades

### Distribuição

**Opção 1: Partilha de Rede**
```bash
copy dist\InvoiceConfirmationApp.exe \\servidor\apps\
```

**Opção 2: Instalador**
- Criar instalador com Inno Setup
- Incluir ícone, desinstalador, atalhos

**Opção 3: Deploy Automático**
- CI/CD com GitHub Actions
- Build automático em cada release

---

## 🔐 Segurança

### Dados Sensíveis

- Aplicação **não armazena** dados permanentemente
- Logs anonimizados (sem dados de clientes)
- Relatórios guardados apenas onde utilizador escolher

### Backup

**Fazer backup de:**
- `config/user_config.json` (configurações)
- `logs/` (opcional, para auditoria)

**Não é necessário backup de:**
- Código fonte (está no Git)
- Executável (pode ser recriado)

---

## 📞 Suporte

### Documentação

- **README.md**: Visão geral
- **USER_GUIDE.md**: Guia do utilizador
- **ARCHITECTURE.md**: Documentação técnica

### Contactos

- **Email**: suporte@empresa.pt
- **Issues**: GitHub Issues
- **FAQ**: docs/FAQ.md

---

## 📝 Checklist de Instalação

### Para Utilizador Final
- [ ] Download do executável
- [ ] Copiar para pasta desejada
- [ ] Criar atalho (opcional)
- [ ] Primeira execução bem sucedida
- [ ] Testar importação WhatsApp
- [ ] Testar importação Fatura
- [ ] Testar comparação
- [ ] Testar geração de relatório

### Para Desenvolvedor
- [ ] Git instalado
- [ ] Python 3.10+ instalado
- [ ] Repositório clonado
- [ ] Ambiente virtual criado
- [ ] Dependências instaladas
- [ ] Aplicação executa sem erros
- [ ] Testes passam
- [ ] Build executável funciona

---

**Versão**: 1.0.0
**Última atualização**: Janeiro 2024
