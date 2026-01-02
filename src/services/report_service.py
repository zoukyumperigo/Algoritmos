"""
Serviço de geração de relatórios (PDF e Excel)
"""
import os
from datetime import datetime
from typing import Optional
from ..models.comparison import ComparisonResult, Severity


class ReportService:
    """Serviço para geração de relatórios em PDF e Excel"""

    @staticmethod
    def generate_pdf(result: ComparisonResult, output_path: str) -> bool:
        """
        Gera relatório PDF da comparação.

        Args:
            result: Resultado da comparação
            output_path: Caminho do ficheiro PDF

        Returns:
            True se gerou com sucesso
        """
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import cm
            from reportlab.platypus import (
                SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            )
            from reportlab.lib.enums import TA_CENTER, TA_LEFT

            # Criar documento
            doc = SimpleDocTemplate(output_path, pagesize=A4)
            story = []
            styles = getSampleStyleSheet()

            # Estilo personalizado para título
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor=colors.HexColor('#1976D2'),
                spaceAfter=30,
                alignment=TA_CENTER
            )

            # TÍTULO
            story.append(Paragraph("RELATÓRIO DE VALIDAÇÃO DE FATURA", title_style))
            story.append(Spacer(1, 0.5*cm))

            # INFORMAÇÕES GERAIS
            info_data = [
                ['Data:', datetime.now().strftime('%d/%m/%Y %H:%M')],
                ['Operador:', result.operator_name or 'N/A'],
                ['Status:', result.status],
                ['Confiança:', f'{result.confidence_score:.0f}%']
            ]

            info_table = Table(info_data, colWidths=[4*cm, 12*cm])
            info_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#E3F2FD')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            story.append(info_table)
            story.append(Spacer(1, 0.8*cm))

            # DADOS DO PEDIDO E FATURA
            if result.order_reference and result.invoice_reference:
                order = result.order_reference
                invoice = result.invoice_reference

                data_header = Paragraph("<b>DADOS DA COMPARAÇÃO</b>", styles['Heading2'])
                story.append(data_header)
                story.append(Spacer(1, 0.3*cm))

                comparison_data = [
                    ['', 'PEDIDO', 'FATURA'],
                    ['Cliente:', order.customer, invoice.customer],
                    ['Distribuidor:', order.distributor, invoice.distributor],
                    ['Total Itens:', str(order.total_items), str(invoice.total_items)],
                ]

                comp_table = Table(comparison_data, colWidths=[4*cm, 6*cm, 6*cm])
                comp_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1976D2')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey)
                ]))
                story.append(comp_table)
                story.append(Spacer(1, 0.8*cm))

            # RESUMO DE DIVERGÊNCIAS
            summary_header = Paragraph("<b>RESUMO DE DIVERGÊNCIAS</b>", styles['Heading2'])
            story.append(summary_header)
            story.append(Spacer(1, 0.3*cm))

            if not result.divergences:
                story.append(Paragraph("✅ Nenhuma divergência encontrada. Pedido e fatura estão corretos.", styles['Normal']))
            else:
                summary_data = [
                    ['Total:', str(len(result.divergences))],
                    ['Críticos:', str(result.critical_count)],
                    ['Erros:', str(result.error_count)],
                    ['Avisos:', str(result.warning_count)]
                ]

                summary_table = Table(summary_data, colWidths=[4*cm, 12*cm])
                summary_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#FFF3E0')),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey)
                ]))
                story.append(summary_table)

            story.append(Spacer(1, 0.8*cm))

            # LISTA DE DIVERGÊNCIAS
            if result.divergences:
                div_header = Paragraph("<b>DETALHES DAS DIVERGÊNCIAS</b>", styles['Heading2'])
                story.append(div_header)
                story.append(Spacer(1, 0.3*cm))

                for i, div in enumerate(result.divergences, 1):
                    # Cor baseada na severidade
                    if div.severity == Severity.CRITICAL or div.severity == Severity.ERROR:
                        bg_color = colors.HexColor('#FFEBEE')
                    elif div.severity == Severity.WARNING:
                        bg_color = colors.HexColor('#FFF9C4')
                    else:
                        bg_color = colors.HexColor('#E3F2FD')

                    div_data = [
                        [f'Divergência #{i}', div.severity.value],
                        ['Tipo:', div.divergence_type.value],
                        ['Descrição:', div.description],
                    ]

                    if div.product_name:
                        div_data.append(['Produto:', div.product_name])
                        div_data.append(['Esperado:', str(div.expected_value)])
                        div_data.append(['Obtido:', str(div.actual_value)])

                    div_table = Table(div_data, colWidths=[4*cm, 12*cm])
                    div_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), bg_color),
                        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
                    ]))
                    story.append(div_table)
                    story.append(Spacer(1, 0.4*cm))

            # RODAPÉ
            story.append(Spacer(1, 1*cm))
            footer_text = f"Relatório gerado automaticamente em {datetime.now().strftime('%d/%m/%Y às %H:%M')}"
            story.append(Paragraph(footer_text, styles['Italic']))

            # Construir PDF
            doc.build(story)
            return True

        except Exception as e:
            print(f"Erro ao gerar PDF: {e}")
            return False

    @staticmethod
    def generate_excel(result: ComparisonResult, output_path: str) -> bool:
        """
        Gera relatório Excel da comparação.

        Args:
            result: Resultado da comparação
            output_path: Caminho do ficheiro Excel

        Returns:
            True se gerou com sucesso
        """
        try:
            import xlsxwriter

            # Criar workbook
            workbook = xlsxwriter.Workbook(output_path)

            # Formatos
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#1976D2',
                'font_color': 'white',
                'border': 1
            })

            subheader_format = workbook.add_format({
                'bold': True,
                'bg_color': '#E3F2FD',
                'border': 1
            })

            error_format = workbook.add_format({
                'bg_color': '#FFEBEE',
                'border': 1
            })

            warning_format = workbook.add_format({
                'bg_color': '#FFF9C4',
                'border': 1
            })

            success_format = workbook.add_format({
                'bg_color': '#E8F5E9',
                'border': 1
            })

            normal_format = workbook.add_format({'border': 1})

            # ABA 1: RESUMO
            sheet1 = workbook.add_worksheet('Resumo')
            sheet1.set_column('A:A', 20)
            sheet1.set_column('B:B', 40)

            row = 0
            sheet1.write(row, 0, 'RELATÓRIO DE VALIDAÇÃO', header_format)
            sheet1.write(row, 1, '', header_format)
            row += 2

            sheet1.write(row, 0, 'Data', subheader_format)
            sheet1.write(row, 1, datetime.now().strftime('%d/%m/%Y %H:%M'), normal_format)
            row += 1

            sheet1.write(row, 0, 'Operador', subheader_format)
            sheet1.write(row, 1, result.operator_name or 'N/A', normal_format)
            row += 1

            sheet1.write(row, 0, 'Status', subheader_format)
            status_fmt = success_format if result.status == 'OK' else error_format
            sheet1.write(row, 1, result.status, status_fmt)
            row += 1

            sheet1.write(row, 0, 'Confiança', subheader_format)
            sheet1.write(row, 1, f'{result.confidence_score:.0f}%', normal_format)
            row += 2

            # Dados de pedido e fatura
            if result.order_reference and result.invoice_reference:
                order = result.order_reference
                invoice = result.invoice_reference

                sheet1.write(row, 0, 'COMPARAÇÃO', header_format)
                sheet1.write(row, 1, 'PEDIDO', header_format)
                sheet1.write(row, 2, 'FATURA', header_format)
                row += 1

                sheet1.write(row, 0, 'Cliente', subheader_format)
                sheet1.write(row, 1, order.customer, normal_format)
                sheet1.write(row, 2, invoice.customer, normal_format)
                row += 1

                sheet1.write(row, 0, 'Distribuidor', subheader_format)
                sheet1.write(row, 1, order.distributor, normal_format)
                sheet1.write(row, 2, invoice.distributor, normal_format)
                row += 1

                sheet1.write(row, 0, 'Total Itens', subheader_format)
                sheet1.write(row, 1, order.total_items, normal_format)
                sheet1.write(row, 2, invoice.total_items, normal_format)
                row += 2

            # Resumo de divergências
            sheet1.write(row, 0, 'Total Divergências', subheader_format)
            sheet1.write(row, 1, len(result.divergences), normal_format)
            row += 1

            sheet1.write(row, 0, 'Críticos', subheader_format)
            sheet1.write(row, 1, result.critical_count, error_format)
            row += 1

            sheet1.write(row, 0, 'Erros', subheader_format)
            sheet1.write(row, 1, result.error_count, error_format)
            row += 1

            sheet1.write(row, 0, 'Avisos', subheader_format)
            sheet1.write(row, 1, result.warning_count, warning_format)

            # ABA 2: DIVERGÊNCIAS
            sheet2 = workbook.add_worksheet('Divergências')
            sheet2.set_column('A:A', 5)
            sheet2.set_column('B:B', 20)
            sheet2.set_column('C:C', 30)
            sheet2.set_column('D:D', 25)
            sheet2.set_column('E:E', 12)
            sheet2.set_column('F:F', 12)
            sheet2.set_column('G:G', 15)

            headers = ['#', 'Tipo', 'Descrição', 'Produto', 'Esperado', 'Obtido', 'Severidade']
            for col, header in enumerate(headers):
                sheet2.write(0, col, header, header_format)

            for i, div in enumerate(result.divergences, 1):
                fmt = error_format if div.severity in [Severity.CRITICAL, Severity.ERROR] else warning_format

                sheet2.write(i, 0, i, fmt)
                sheet2.write(i, 1, div.divergence_type.value, fmt)
                sheet2.write(i, 2, div.description, fmt)
                sheet2.write(i, 3, div.product_name or 'N/A', fmt)
                sheet2.write(i, 4, str(div.expected_value) if div.expected_value is not None else '', fmt)
                sheet2.write(i, 5, str(div.actual_value) if div.actual_value is not None else '', fmt)
                sheet2.write(i, 6, div.severity.value, fmt)

            workbook.close()
            return True

        except Exception as e:
            print(f"Erro ao gerar Excel: {e}")
            return False
