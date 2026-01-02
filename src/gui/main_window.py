"""
Janela principal da aplicação
"""
import os
from pathlib import Path
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QTextEdit, QLabel, QFileDialog,
    QMessageBox, QGroupBox, QStatusBar, QMenuBar,
    QMenu, QSplitter
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QAction, QFont

from ..models.order import Order
from ..models.invoice import Invoice
from ..models.comparison import ComparisonResult
from ..parsers.whatsapp_parser import WhatsAppParser
from ..parsers.sage_excel_parser import SageExcelParser
from ..parsers.sage_csv_parser import SageCsvParser
from ..parsers.sage_pdf_parser import SagePdfParser
from ..services.comparison_service import ComparisonService
from ..services.report_service import ReportService
from ..utils.config import Config
from ..utils.logger import logger
from ..utils.file_handler import FileHandler


class MainWindow(QMainWindow):
    """Janela principal da aplicação"""

    def __init__(self):
        super().__init__()

        self.order = None
        self.invoice = None
        self.comparison_result = None

        self.setup_ui()
        self.load_styles()

        logger.info("Aplicação iniciada")

    def setup_ui(self):
        """Configura a interface"""
        self.setWindowTitle(f"{Config.APP_NAME} v{Config.VERSION}")
        self.setGeometry(100, 100, 1400, 800)

        # Menu bar
        self.create_menu_bar()

        # Widget central
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Layout principal
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(10, 10, 10, 10)

        # Barra de ferramentas
        toolbar_layout = QHBoxLayout()

        self.btn_import_whatsapp = QPushButton("📁 Importar WhatsApp")
        self.btn_import_whatsapp.clicked.connect(self.import_whatsapp)

        self.btn_import_invoice = QPushButton("📁 Importar Fatura")
        self.btn_import_invoice.clicked.connect(self.import_invoice)

        self.btn_compare = QPushButton("🔍 Comparar")
        self.btn_compare.clicked.connect(self.compare)
        self.btn_compare.setEnabled(False)

        self.btn_export_pdf = QPushButton("📄 Relatório PDF")
        self.btn_export_pdf.clicked.connect(self.export_pdf)
        self.btn_export_pdf.setEnabled(False)

        self.btn_export_excel = QPushButton("📊 Relatório Excel")
        self.btn_export_excel.clicked.connect(self.export_excel)
        self.btn_export_excel.setEnabled(False)

        toolbar_layout.addWidget(self.btn_import_whatsapp)
        toolbar_layout.addWidget(self.btn_import_invoice)
        toolbar_layout.addWidget(self.btn_compare)
        toolbar_layout.addStretch()
        toolbar_layout.addWidget(self.btn_export_pdf)
        toolbar_layout.addWidget(self.btn_export_excel)

        main_layout.addLayout(toolbar_layout)

        # Splitter para os 3 painéis
        splitter = QSplitter(Qt.Horizontal)

        # Painel Esquerdo: Pedido WhatsApp
        self.order_panel = self.create_order_panel()
        splitter.addWidget(self.order_panel)

        # Painel Central: Comparação
        self.comparison_panel = self.create_comparison_panel()
        splitter.addWidget(self.comparison_panel)

        # Painel Direito: Fatura
        self.invoice_panel = self.create_invoice_panel()
        splitter.addWidget(self.invoice_panel)

        # Proporções
        splitter.setStretchFactor(0, 1)
        splitter.setStretchFactor(1, 1)
        splitter.setStretchFactor(2, 1)

        main_layout.addWidget(splitter)

        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.update_status("Pronto")

    def create_menu_bar(self):
        """Cria barra de menu"""
        menubar = self.menuBar()

        # Menu Arquivo
        file_menu = menubar.addMenu("&Arquivo")

        import_whatsapp_action = QAction("Importar WhatsApp", self)
        import_whatsapp_action.triggered.connect(self.import_whatsapp)
        file_menu.addAction(import_whatsapp_action)

        import_invoice_action = QAction("Importar Fatura", self)
        import_invoice_action.triggered.connect(self.import_invoice)
        file_menu.addAction(import_invoice_action)

        file_menu.addSeparator()

        exit_action = QAction("Sair", self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # Menu Ferramentas
        tools_menu = menubar.addMenu("&Ferramentas")

        compare_action = QAction("Comparar", self)
        compare_action.triggered.connect(self.compare)
        tools_menu.addAction(compare_action)

        # Menu Ajuda
        help_menu = menubar.addMenu("&Ajuda")

        about_action = QAction("Sobre", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def create_order_panel(self) -> QGroupBox:
        """Cria painel do pedido"""
        group = QGroupBox("PEDIDO WHATSAPP")
        layout = QVBoxLayout()

        self.order_text = QTextEdit()
        self.order_text.setReadOnly(True)
        self.order_text.setPlaceholderText("Importe um pedido do WhatsApp...")

        layout.addWidget(self.order_text)
        group.setLayout(layout)

        return group

    def create_comparison_panel(self) -> QGroupBox:
        """Cria painel de comparação"""
        group = QGroupBox("COMPARAÇÃO")
        layout = QVBoxLayout()

        # Status
        self.status_label = QLabel("Status: Aguardando dados")
        self.status_label.setObjectName("subtitle")
        layout.addWidget(self.status_label)

        # Resultados
        self.comparison_text = QTextEdit()
        self.comparison_text.setReadOnly(True)
        self.comparison_text.setPlaceholderText("Importe pedido e fatura para comparar...")

        layout.addWidget(self.comparison_text)
        group.setLayout(layout)

        return group

    def create_invoice_panel(self) -> QGroupBox:
        """Cria painel da fatura"""
        group = QGroupBox("FATURA SAGE")
        layout = QVBoxLayout()

        self.invoice_text = QTextEdit()
        self.invoice_text.setReadOnly(True)
        self.invoice_text.setPlaceholderText("Importe uma fatura do SAGE...")

        layout.addWidget(self.invoice_text)
        group.setLayout(layout)

        return group

    def load_styles(self):
        """Carrega estilos CSS"""
        style_file = Path(__file__).parent / "styles" / "app_style.qss"
        if style_file.exists():
            with open(style_file, 'r', encoding='utf-8') as f:
                self.setStyleSheet(f.read())

    def import_whatsapp(self):
        """Importa pedido do WhatsApp"""
        # Opções: Ficheiro ou Colar Texto
        msg = QMessageBox()
        msg.setWindowTitle("Importar WhatsApp")
        msg.setText("Como deseja importar o pedido?")

        btn_file = msg.addButton("Ficheiro TXT", QMessageBox.ActionRole)
        btn_paste = msg.addButton("Copiar/Colar", QMessageBox.ActionRole)
        msg.addButton("Cancelar", QMessageBox.RejectRole)

        msg.exec()

        if msg.clickedButton() == btn_file:
            self.import_whatsapp_file()
        elif msg.clickedButton() == btn_paste:
            self.import_whatsapp_paste()

    def import_whatsapp_file(self):
        """Importa de ficheiro"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Selecionar ficheiro WhatsApp",
            "",
            "Ficheiros de texto (*.txt)"
        )

        if not file_path:
            return

        try:
            parser = WhatsAppParser()
            self.order = parser.parse_file(file_path)

            self.order_text.setPlainText(str(self.order))
            self.update_status(f"✅ Pedido importado: {self.order.customer}")
            self.check_can_compare()

            logger.info(f"Pedido WhatsApp importado de {file_path}")

        except Exception as e:
            QMessageBox.critical(self, "Erro", f"Erro ao importar WhatsApp:\n{str(e)}")
            logger.error(f"Erro ao importar WhatsApp: {e}")

    def import_whatsapp_paste(self):
        """Importa de texto colado"""
        from PySide6.QtWidgets import QInputDialog, QTextEdit

        dialog = QInputDialog(self)
        dialog.setWindowTitle("Colar texto do WhatsApp")
        dialog.setLabelText("Cole aqui o texto da mensagem:")
        dialog.setOption(QInputDialog.UsePlainTextEditForTextInput, True)

        if dialog.exec():
            text = dialog.textValue()

            try:
                parser = WhatsAppParser()
                self.order = parser.parse_text(text)

                self.order_text.setPlainText(str(self.order))
                self.update_status(f"✅ Pedido importado: {self.order.customer}")
                self.check_can_compare()

                logger.info("Pedido WhatsApp importado via copiar/colar")

            except Exception as e:
                QMessageBox.critical(self, "Erro", f"Erro ao processar texto:\n{str(e)}")
                logger.error(f"Erro ao processar texto WhatsApp: {e}")

    def import_invoice(self):
        """Importa fatura do SAGE"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Selecionar fatura SAGE",
            "",
            "Todos os formatos (*.xlsx *.xls *.csv *.pdf);;Excel (*.xlsx *.xls);;CSV (*.csv);;PDF (*.pdf)"
        )

        if not file_path:
            return

        try:
            ext = FileHandler.get_file_extension(file_path)

            # Escolher parser apropriado
            if ext in ['.xlsx', '.xls']:
                parser = SageExcelParser()
                self.invoice = parser.parse_file(file_path)
            elif ext == '.csv':
                parser = SageCsvParser()
                self.invoice = parser.parse_file(file_path)
            elif ext == '.pdf':
                parser = SagePdfParser()
                self.invoice = parser.parse_file(file_path)
            else:
                raise ValueError(f"Formato não suportado: {ext}")

            self.invoice_text.setPlainText(str(self.invoice))
            self.update_status(f"✅ Fatura importada: {self.invoice.customer}")
            self.check_can_compare()

            logger.info(f"Fatura importada de {file_path}")

        except Exception as e:
            QMessageBox.critical(self, "Erro", f"Erro ao importar fatura:\n{str(e)}")
            logger.error(f"Erro ao importar fatura: {e}")

    def check_can_compare(self):
        """Verifica se pode ativar botão de comparar"""
        can_compare = self.order is not None and self.invoice is not None
        self.btn_compare.setEnabled(can_compare)

    def compare(self):
        """Executa comparação"""
        if not self.order or not self.invoice:
            QMessageBox.warning(self, "Aviso", "Importe pedido e fatura primeiro")
            return

        try:
            service = ComparisonService()
            self.comparison_result = service.compare(
                self.order,
                self.invoice,
                operator_name=os.getenv('USERNAME', 'Utilizador')
            )

            # Mostrar resultado
            self.display_comparison_result()

            # Ativar botões de exportação
            self.btn_export_pdf.setEnabled(True)
            self.btn_export_excel.setEnabled(True)

            logger.info(f"Comparação realizada: {self.comparison_result.status}")

        except Exception as e:
            QMessageBox.critical(self, "Erro", f"Erro ao comparar:\n{str(e)}")
            logger.error(f"Erro ao comparar: {e}")

    def display_comparison_result(self):
        """Exibe resultado da comparação"""
        if not self.comparison_result:
            return

        result = self.comparison_result

        # Atualizar status
        status_icons = {
            "OK": "✅",
            "AVISO": "⚠️",
            "ERRO": "❌",
            "ERRO_CRITICO": "🔴"
        }

        icon = status_icons.get(result.status, "")
        self.status_label.setText(f"Status: {icon} {result.status}")

        # Mudar cor do status
        color = result.status_color
        self.status_label.setStyleSheet(f"color: {color}; font-weight: bold; font-size: 16px;")

        # Montar texto detalhado
        lines = []
        lines.append(f"═══════════════════════════════════════")
        lines.append(f"STATUS: {result.status}")
        lines.append(f"CONFIANÇA: {result.confidence_score:.0f}%")
        lines.append(f"═══════════════════════════════════════\n")

        if not result.divergences:
            lines.append("✅ TUDO CORRETO!")
            lines.append("\nPedido e fatura estão 100% compatíveis.")
        else:
            lines.append(f"📊 RESUMO DAS DIVERGÊNCIAS")
            lines.append(f"  Total: {len(result.divergences)}")
            if result.critical_count:
                lines.append(f"  🔴 Críticos: {result.critical_count}")
            if result.error_count:
                lines.append(f"  🔴 Erros: {result.error_count}")
            if result.warning_count:
                lines.append(f"  🟡 Avisos: {result.warning_count}")

            lines.append("\n" + "─" * 50 + "\n")

            for i, div in enumerate(result.divergences, 1):
                lines.append(f"\n{div.severity_icon} DIVERGÊNCIA #{i}")
                lines.append(f"Tipo: {div.divergence_type.value}")
                lines.append(f"Severidade: {div.severity.value}")
                lines.append(f"Descrição: {div.description}")

                if div.product_name:
                    lines.append(f"Produto: {div.product_name}")
                    lines.append(f"Esperado: {div.expected_value}")
                    lines.append(f"Obtido: {div.actual_value}")

                lines.append("─" * 50)

        self.comparison_text.setPlainText("\n".join(lines))

        # Scroll para o topo
        self.comparison_text.verticalScrollBar().setValue(0)

    def export_pdf(self):
        """Exporta relatório PDF"""
        if not self.comparison_result:
            QMessageBox.warning(self, "Aviso", "Realize a comparação primeiro")
            return

        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Guardar relatório PDF",
            f"relatorio_{self.order.customer.replace(' ', '_')}.pdf",
            "PDF (*.pdf)"
        )

        if not file_path:
            return

        try:
            service = ReportService()
            success = service.generate_pdf(self.comparison_result, file_path)

            if success:
                QMessageBox.information(self, "Sucesso", f"Relatório PDF gerado:\n{file_path}")
                logger.info(f"Relatório PDF gerado: {file_path}")

                # Perguntar se quer abrir
                reply = QMessageBox.question(
                    self,
                    "Abrir ficheiro?",
                    "Deseja abrir o relatório?",
                    QMessageBox.Yes | QMessageBox.No
                )

                if reply == QMessageBox.Yes:
                    os.startfile(file_path)  # Windows
            else:
                QMessageBox.critical(self, "Erro", "Erro ao gerar PDF")

        except Exception as e:
            QMessageBox.critical(self, "Erro", f"Erro ao gerar PDF:\n{str(e)}")
            logger.error(f"Erro ao gerar PDF: {e}")

    def export_excel(self):
        """Exporta relatório Excel"""
        if not self.comparison_result:
            QMessageBox.warning(self, "Aviso", "Realize a comparação primeiro")
            return

        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Guardar relatório Excel",
            f"relatorio_{self.order.customer.replace(' ', '_')}.xlsx",
            "Excel (*.xlsx)"
        )

        if not file_path:
            return

        try:
            service = ReportService()
            success = service.generate_excel(self.comparison_result, file_path)

            if success:
                QMessageBox.information(self, "Sucesso", f"Relatório Excel gerado:\n{file_path}")
                logger.info(f"Relatório Excel gerado: {file_path}")

                # Perguntar se quer abrir
                reply = QMessageBox.question(
                    self,
                    "Abrir ficheiro?",
                    "Deseja abrir o relatório?",
                    QMessageBox.Yes | QMessageBox.No
                )

                if reply == QMessageBox.Yes:
                    os.startfile(file_path)  # Windows
            else:
                QMessageBox.critical(self, "Erro", "Erro ao gerar Excel")

        except Exception as e:
            QMessageBox.critical(self, "Erro", f"Erro ao gerar Excel:\n{str(e)}")
            logger.error(f"Erro ao gerar Excel: {e}")

    def update_status(self, message: str):
        """Atualiza barra de status"""
        self.status_bar.showMessage(message)

    def show_about(self):
        """Mostra diálogo sobre"""
        QMessageBox.about(
            self,
            "Sobre",
            f"{Config.APP_NAME}\n\n"
            f"Versão: {Config.VERSION}\n\n"
            f"Sistema de validação automática de faturas SAGE\n"
            f"contra pedidos de WhatsApp.\n\n"
            f"© 2024 Todos os direitos reservados"
        )
