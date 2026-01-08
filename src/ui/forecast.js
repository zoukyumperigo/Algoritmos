/**
 * Forecast UI Module
 * Displays purchase forecasting based on historical data
 */

class ForecastUI {
    constructor(storage, analytics) {
        this.storage = storage;
        this.analytics = analytics;

        this.initializeElements();
        this.refresh();
    }

    initializeElements() {
        this.container = document.getElementById('forecastContainer');
    }

    refresh() {
        const orders = this.storage.loadOrders();
        const products = this.storage.loadProducts();

        const forecast = this.analytics.generatePurchaseForecast(orders, products);

        this.displayForecast(forecast);
    }

    displayForecast(forecast) {
        if (forecast.noData) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3>Sem dados suficientes</h3>
                    <p>Importe pedidos históricos para gerar previsões de compras.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div style="margin-bottom: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
                <h3 style="margin-top: 0;">📅 Período de Análise</h3>
                <p style="font-size: 1.1rem;">
                    <strong>${forecast.period}</strong><br>
                    ${new Date(forecast.startDate).toLocaleDateString('pt-PT')} até
                    ${new Date(forecast.endDate).toLocaleDateString('pt-PT')}<br>
                    Total de pedidos analisados: <strong>${forecast.totalOrders}</strong>
                </p>
            </div>

            <h3>🛒 Recomendações de Compra</h3>
            <p style="color: #64748b; margin-bottom: 20px;">
                Baseado na média semanal de vendas das últimas ${this.analytics.WEEKS_FOR_FORECAST} semanas
            </p>
        `;

        forecast.products.forEach(product => {
            const urgencyColors = {
                'CRÍTICO': '#dc2626',
                'URGENTE': '#ea580c',
                'ATENÇÃO': '#f59e0b',
                'OK': '#16a34a'
            };

            const urgencyColor = urgencyColors[product.urgency] || '#64748b';

            html += `
                <div class="forecast-card" style="border-left-color: ${urgencyColor};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0;">${product.name}</h3>
                            <div style="color: #64748b;">SKU: ${product.sku} | Zona: ${product.zone}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: ${urgencyColor}; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 1.1rem;">
                                ${product.urgency}
                            </div>
                        </div>
                    </div>

                    <div class="forecast-stats">
                        <div class="stat-item">
                            <div class="stat-label">Stock Atual</div>
                            <div class="stat-value">${product.currentStock}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Média Semanal</div>
                            <div class="stat-value">${product.weeklyAvg.toFixed(1)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Semanas Restantes</div>
                            <div class="stat-value">${product.weeksRemaining < 999 ? product.weeksRemaining.toFixed(1) : '∞'}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Recomendado Comprar</div>
                            <div class="stat-value" style="color: ${urgencyColor};">
                                ${product.recommendedOrder}
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 4px; font-size: 0.95rem;">
                        <strong>Análise:</strong>
                        Total pedido últimas ${this.analytics.WEEKS_FOR_FORECAST} semanas: ${product.totalOrdered} caixas
                        (${product.orderCount} pedidos, média ${product.avgPerOrder.toFixed(1)} caixas/pedido)
                        ${product.kgPerBox ? ` | ${(product.totalOrdered * product.kgPerBox).toFixed(1)} kg` : ''}
                    </div>
                </div>
            `;
        });

        this.container.innerHTML = html;
    }
}
