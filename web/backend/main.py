"""
API REST para Invoice Confirmation App
Backend FastAPI que reutiliza toda a lógica existente
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
import sys
import os
from pathlib import Path
import tempfile
import shutil

# Adicionar pasta src ao path para importar módulos existentes
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))

from parsers.whatsapp_parser import WhatsAppParser
from parsers.sage_excel_parser import SageExcelParser
from parsers.sage_csv_parser import SageCsvParser
from parsers.sage_pdf_parser import SagePdfParser
from services.comparison_service import ComparisonService
from services.report_service import ReportService
from utils.logger import logger
from utils.file_handler import FileHandler

# Criar app FastAPI
app = FastAPI(
    title="Invoice Confirmation API",
    description="API para validação de faturas SAGE vs pedidos WhatsApp",
    version="1.0.0"
)

# Configurar CORS (permitir acesso de qualquer origem)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar pasta frontend (servir ficheiros estáticos)
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/app", StaticFiles(directory=str(frontend_path), html=True), name="frontend")


# Armazenamento temporário (em memória) - em produção usar BD ou cache
session_data = {}


@app.get("/")
async def root():
    """Página inicial - redirecionar para app"""
    return {"message": "Invoice Confirmation API", "docs": "/docs", "app": "/app/index.html"}


@app.get("/health")
async def health_check():
    """Health check para monitorização"""
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/api/upload/whatsapp")
async def upload_whatsapp(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    session_id: str = Form(...)
):
    """
    Upload de pedido WhatsApp.

    Aceita:
    - file: Ficheiro TXT
    - text: Texto colado diretamente
    - session_id: ID da sessão do utilizador
    """
    try:
        parser = WhatsAppParser()

        if text:
            # Parse de texto colado
            order = parser.parse_text(text)
        elif file:
            # Parse de ficheiro
            content = await file.read()
            text_content = content.decode('utf-8')
            order = parser.parse_text(text_content)
        else:
            raise HTTPException(status_code=400, detail="Forneça ficheiro ou texto")

        # Guardar na sessão
        if session_id not in session_data:
            session_data[session_id] = {}

        session_data[session_id]['order'] = {
            'distributor': order.distributor,
            'customer': order.customer,
            'items': [
                {
                    'product_name': item.product_name,
                    'quantity': item.quantity,
                    'normalized_name': item.normalized_name
                }
                for item in order.items
            ],
            'total_items': order.total_items,
            'unique_products': order.unique_products
        }

        logger.info(f"Pedido WhatsApp importado - Sessão: {session_id}")

        return {
            "success": True,
            "message": "Pedido WhatsApp importado com sucesso",
            "data": session_data[session_id]['order']
        }

    except Exception as e:
        logger.error(f"Erro ao importar WhatsApp: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/upload/invoice")
async def upload_invoice(
    file: UploadFile = File(...),
    session_id: str = Form(...)
):
    """
    Upload de fatura SAGE.

    Aceita: Excel (.xlsx, .xls), CSV, PDF
    """
    try:
        # Criar ficheiro temporário
        suffix = Path(file.filename).suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name

        # Escolher parser apropriado
        if suffix in ['.xlsx', '.xls']:
            parser = SageExcelParser()
            invoice = parser.parse_file(tmp_path)
        elif suffix == '.csv':
            parser = SageCsvParser()
            invoice = parser.parse_file(tmp_path)
        elif suffix == '.pdf':
            parser = SagePdfParser()
            invoice = parser.parse_file(tmp_path)
        else:
            os.unlink(tmp_path)
            raise HTTPException(status_code=400, detail=f"Formato não suportado: {suffix}")

        # Limpar ficheiro temporário
        os.unlink(tmp_path)

        # Guardar na sessão
        if session_id not in session_data:
            session_data[session_id] = {}

        session_data[session_id]['invoice'] = {
            'distributor': invoice.distributor,
            'customer': invoice.customer,
            'invoice_number': invoice.invoice_number,
            'items': [
                {
                    'product_name': item.product_name,
                    'quantity': item.quantity,
                    'unit_price': item.unit_price,
                    'total_price': item.total_price,
                    'normalized_name': item.normalized_name
                }
                for item in invoice.items
            ],
            'total_items': invoice.total_items,
            'unique_products': invoice.unique_products,
            'source_format': invoice.source_format
        }

        logger.info(f"Fatura importada - Sessão: {session_id}, Formato: {suffix}")

        return {
            "success": True,
            "message": f"Fatura importada com sucesso ({suffix})",
            "data": session_data[session_id]['invoice']
        }

    except Exception as e:
        logger.error(f"Erro ao importar fatura: {e}")
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/compare")
async def compare_order_invoice(session_id: str = Form(...)):
    """
    Compara pedido com fatura.

    Retorna resultado detalhado da comparação.
    """
    try:
        # Verificar se sessão existe
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Sessão não encontrada")

        session = session_data[session_id]

        if 'order' not in session:
            raise HTTPException(status_code=400, detail="Pedido WhatsApp não importado")

        if 'invoice' not in session:
            raise HTTPException(status_code=400, detail="Fatura não importada")

        # Reconstruir objetos Order e Invoice
        from models.order import Order, OrderItem
        from models.invoice import Invoice, InvoiceItem

        order = Order(
            distributor=session['order']['distributor'],
            customer=session['order']['customer'],
            items=[
                OrderItem(
                    product_name=item['product_name'],
                    quantity=item['quantity']
                )
                for item in session['order']['items']
            ]
        )

        invoice = Invoice(
            distributor=session['invoice']['distributor'],
            customer=session['invoice']['customer'],
            items=[
                InvoiceItem(
                    product_name=item['product_name'],
                    quantity=item['quantity'],
                    unit_price=item.get('unit_price', 0.0),
                    total_price=item.get('total_price', 0.0)
                )
                for item in session['invoice']['items']
            ],
            invoice_number=session['invoice'].get('invoice_number', '')
        )

        # Executar comparação
        service = ComparisonService()
        result = service.compare(order, invoice, operator_name="Web User")

        # Guardar resultado na sessão
        session['comparison'] = {
            'status': result.status,
            'confidence_score': result.confidence_score,
            'divergences': [
                {
                    'type': div.divergence_type.value,
                    'severity': div.severity.value,
                    'description': div.description,
                    'product_name': div.product_name,
                    'expected_value': div.expected_value,
                    'actual_value': div.actual_value,
                    'confidence': div.confidence,
                    'severity_color': div.severity_color,
                    'severity_icon': div.severity_icon
                }
                for div in result.divergences
            ],
            'critical_count': result.critical_count,
            'error_count': result.error_count,
            'warning_count': result.warning_count,
            'status_color': result.status_color
        }

        logger.info(f"Comparação realizada - Sessão: {session_id}, Status: {result.status}")

        return {
            "success": True,
            "message": "Comparação realizada com sucesso",
            "data": session['comparison']
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao comparar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/report/pdf/{session_id}")
async def generate_pdf_report(session_id: str):
    """
    Gera relatório PDF.

    Retorna ficheiro PDF para download.
    """
    try:
        # Verificar se comparação foi feita
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Sessão não encontrada")

        session = session_data[session_id]

        if 'comparison' not in session:
            raise HTTPException(status_code=400, detail="Execute a comparação primeiro")

        # Reconstruir objetos
        from models.order import Order, OrderItem
        from models.invoice import Invoice, InvoiceItem
        from models.comparison import ComparisonResult, Divergence, DivergenceType, Severity

        order = Order(
            distributor=session['order']['distributor'],
            customer=session['order']['customer'],
            items=[
                OrderItem(item['product_name'], item['quantity'])
                for item in session['order']['items']
            ]
        )

        invoice = Invoice(
            distributor=session['invoice']['distributor'],
            customer=session['invoice']['customer'],
            items=[
                InvoiceItem(
                    item['product_name'],
                    item['quantity'],
                    item.get('unit_price', 0.0),
                    item.get('total_price', 0.0)
                )
                for item in session['invoice']['items']
            ]
        )

        result = ComparisonResult(
            order_reference=order,
            invoice_reference=invoice
        )

        # Reconstruir divergências
        for div_data in session['comparison']['divergences']:
            div = Divergence(
                divergence_type=DivergenceType(div_data['type']),
                severity=Severity(div_data['severity']),
                description=div_data['description'],
                product_name=div_data.get('product_name', ''),
                expected_value=div_data.get('expected_value'),
                actual_value=div_data.get('actual_value'),
                confidence=div_data.get('confidence', 1.0)
            )
            result.divergences.append(div)

        result._recalculate_confidence()

        # Gerar PDF
        pdf_path = tempfile.mktemp(suffix='.pdf')
        report_service = ReportService()
        report_service.generate_pdf(result, pdf_path)

        logger.info(f"Relatório PDF gerado - Sessão: {session_id}")

        # Retornar ficheiro
        return FileResponse(
            pdf_path,
            media_type='application/pdf',
            filename=f'relatorio_{session["order"]["customer"].replace(" ", "_")}.pdf'
        )

    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/report/excel/{session_id}")
async def generate_excel_report(session_id: str):
    """
    Gera relatório Excel.

    Retorna ficheiro Excel para download.
    """
    try:
        # Código similar ao PDF, mas gera Excel
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Sessão não encontrada")

        session = session_data[session_id]

        if 'comparison' not in session:
            raise HTTPException(status_code=400, detail="Execute a comparação primeiro")

        # Reconstruir objetos (mesmo código do PDF)
        from models.order import Order, OrderItem
        from models.invoice import Invoice, InvoiceItem
        from models.comparison import ComparisonResult, Divergence, DivergenceType, Severity

        order = Order(
            distributor=session['order']['distributor'],
            customer=session['order']['customer'],
            items=[
                OrderItem(item['product_name'], item['quantity'])
                for item in session['order']['items']
            ]
        )

        invoice = Invoice(
            distributor=session['invoice']['distributor'],
            customer=session['invoice']['customer'],
            items=[
                InvoiceItem(
                    item['product_name'],
                    item['quantity'],
                    item.get('unit_price', 0.0),
                    item.get('total_price', 0.0)
                )
                for item in session['invoice']['items']
            ]
        )

        result = ComparisonResult(
            order_reference=order,
            invoice_reference=invoice
        )

        for div_data in session['comparison']['divergences']:
            div = Divergence(
                divergence_type=DivergenceType(div_data['type']),
                severity=Severity(div_data['severity']),
                description=div_data['description'],
                product_name=div_data.get('product_name', ''),
                expected_value=div_data.get('expected_value'),
                actual_value=div_data.get('actual_value'),
                confidence=div_data.get('confidence', 1.0)
            )
            result.divergences.append(div)

        result._recalculate_confidence()

        # Gerar Excel
        excel_path = tempfile.mktemp(suffix='.xlsx')
        report_service = ReportService()
        report_service.generate_excel(result, excel_path)

        logger.info(f"Relatório Excel gerado - Sessão: {session_id}")

        return FileResponse(
            excel_path,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename=f'relatorio_{session["order"]["customer"].replace(" ", "_")}.xlsx'
        )

    except Exception as e:
        logger.error(f"Erro ao gerar Excel: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/session/{session_id}")
async def clear_session(session_id: str):
    """Limpa dados da sessão"""
    if session_id in session_data:
        del session_data[session_id]
        return {"success": True, "message": "Sessão limpa"}
    return {"success": False, "message": "Sessão não encontrada"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
