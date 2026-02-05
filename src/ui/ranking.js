/**
 * Driver Ranking UI Module
 * Displays statistics and ranking of drivers based on deliveries
 */

class RankingUI {
    constructor(storage) {
        this.storage = storage;
        this.initializeElements();
        this.attachEventListeners();
        this.refresh();
    }

    initializeElements() {
        this.container = document.getElementById('rankingContainer');
        this.periodFilter = document.getElementById('rankingPeriodFilter');
        this.refreshBtn = document.getElementById('refreshRankingBtn');
    }

    attachEventListeners() {
        if (this.periodFilter) {
            this.periodFilter.addEventListener('change', () => this.refresh());
        }

        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.refresh());
        }
    }

    refresh() {
        const period = this.periodFilter?.value || 'all';
        const stats = this.calculateStatistics(period);
        this.displayRanking(stats);
    }

    calculateStatistics(period) {
        const orders = this.storage.loadOrders();
        const distributors = this.storage.loadDistributors();

        // Filter delivered orders by period
        let deliveredOrders = orders.filter(o => o.status === 'delivered');

        if (period !== 'all' && deliveredOrders.length > 0) {
            const now = new Date();
            const cutoffDate = new Date();

            if (period === 'today') {
                cutoffDate.setHours(0, 0, 0, 0);
            } else if (period === 'week') {
                cutoffDate.setDate(now.getDate() - 7);
            } else if (period === 'month') {
                cutoffDate.setMonth(now.getMonth() - 1);
            }

            deliveredOrders = deliveredOrders.filter(o => {
                const deliveryDate = o.deliveredAt ? new Date(o.deliveredAt) : new Date(o.timestamp);
                return deliveryDate >= cutoffDate;
            });
        }

        // Group statistics by driver
        const driverStats = {};

        deliveredOrders.forEach(order => {
            const driverKey = order.distributorName || order.distributorInitial;

            if (!driverStats[driverKey]) {
                const dist = distributors.find(d => d.name === driverKey || d.initial === driverKey);
                driverStats[driverKey] = {
                    driverName: driverKey,
                    initial: order.distributorInitial,
                    vehicle: dist?.vehicle || '',
                    totalOrders: 0,
                    totalBoxes: 0,
                    totalKg: 0,
                    uniqueCustomers: new Set(),
                    productTypes: new Set()
                };
            }

            driverStats[driverKey].totalOrders++;
            driverStats[driverKey].totalBoxes += order.totalBoxes || 0;
            driverStats[driverKey].totalKg += order.totalKg || 0;
            driverStats[driverKey].uniqueCustomers.add(order.restaurantName);

            order.items.forEach(item => {
                driverStats[driverKey].productTypes.add(item.productName || item.productCode);
            });
        });

        // Convert to array and calculate derived stats
        const statsArray = Object.values(driverStats).map(stat => ({
            driverName: stat.driverName,
            initial: stat.initial,
            vehicle: stat.vehicle,
            totalOrders: stat.totalOrders,
            totalBoxes: stat.totalBoxes,
            totalKg: stat.totalKg,
            uniqueCustomers: stat.uniqueCustomers.size,
            productTypes: stat.productTypes.size,
            avgBoxesPerOrder: stat.totalOrders > 0 ? (stat.totalBoxes / stat.totalOrders).toFixed(1) : 0,
            avgKgPerOrder: stat.totalOrders > 0 ? (stat.totalKg / stat.totalOrders).toFixed(1) : 0
        }));

        return {
            period,
            stats: statsArray,
            totalDeliveries: deliveredOrders.length,
            totalDrivers: statsArray.length
        };
    }

    displayRanking(data) {
        if (data.stats.length === 0) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <h3>Sem dados de entregas</h3>
                    <p>Marque pedidos como entregues para ver estatísticas.</p>
                </div>
            `;
            return;
        }

        // Sort by total boxes (main ranking metric)
        const rankedByBoxes = [...data.stats].sort((a, b) => b.totalBoxes - a.totalBoxes);
        const rankedByCustomers = [...data.stats].sort((a, b) => b.uniqueCustomers - a.uniqueCustomers);
        const rankedByOrders = [...data.stats].sort((a, b) => b.totalOrders - a.totalOrders);

        let html = `
            <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 10px 0;">📊 Ranking de Motoristas</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 0.9rem; color: #1e40af;">Total de Entregas</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #1e40af;">${data.totalDeliveries}</div>
                    </div>
                    <div style="background: #dcfce7; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 0.9rem; color: #15803d;">Motoristas Ativos</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #15803d;">${data.totalDrivers}</div>
                    </div>
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 0.9rem; color: #92400e;">Total Caixas</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #92400e;">${rankedByBoxes.reduce((sum, s) => sum + s.totalBoxes, 0)}</div>
                    </div>
                    <div style="background: #e0e7ff; padding: 15px; border-radius: 8px;">
                        <div style="font-size: 0.9rem; color: #4338ca;">Total Kg</div>
                        <div style="font-size: 2rem; font-weight: bold; color: #4338ca;">${rankedByBoxes.reduce((sum, s) => sum + s.totalKg, 0).toFixed(1)}</div>
                    </div>
                </div>
            </div>

            <!-- Ranking por Caixas -->
            <div style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">🏆 Ranking por Volume (Caixas)</h3>
                ${this.renderRankingTable(rankedByBoxes, 'boxes')}
            </div>

            <!-- Ranking por Clientes -->
            <div style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">👥 Ranking por Clientes Atendidos</h3>
                ${this.renderRankingTable(rankedByCustomers, 'customers')}
            </div>

            <!-- Ranking por Pedidos -->
            <div style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">📦 Ranking por Número de Pedidos</h3>
                ${this.renderRankingTable(rankedByOrders, 'orders')}
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderRankingTable(rankedStats, metric) {
        const maxValue = rankedStats[0] ?
            (metric === 'boxes' ? rankedStats[0].totalBoxes :
             metric === 'customers' ? rankedStats[0].uniqueCustomers :
             rankedStats[0].totalOrders) : 1;

        let html = `
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; width: 60px;">Pos.</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Motorista</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Viatura</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Pedidos</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Clientes</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Caixas</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Kg</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Performance</th>
                    </tr>
                </thead>
                <tbody>
        `;

        rankedStats.forEach((stat, index) => {
            const value = metric === 'boxes' ? stat.totalBoxes :
                         metric === 'customers' ? stat.uniqueCustomers :
                         stat.totalOrders;
            const percentage = (value / maxValue) * 100;

            // Medal for top 3
            let positionDisplay = `${index + 1}`;
            if (index === 0) positionDisplay = '🥇';
            else if (index === 1) positionDisplay = '🥈';
            else if (index === 2) positionDisplay = '🥉';

            html += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; text-align: center; font-size: 1.5rem;">${positionDisplay}</td>
                    <td style="padding: 12px;">
                        <div style="font-weight: bold; font-size: 1.1rem;">${stat.driverName}</div>
                        <div style="color: #64748b; font-size: 0.9rem;">${stat.initial}</div>
                    </td>
                    <td style="padding: 12px; text-align: center; color: #64748b;">${stat.vehicle || '-'}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold;">${stat.totalOrders}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold;">${stat.uniqueCustomers}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold; color: #2563eb;">${stat.totalBoxes}</td>
                    <td style="padding: 12px; text-align: center; font-weight: bold; color: #7c3aed;">${stat.totalKg.toFixed(1)}</td>
                    <td style="padding: 12px;">
                        <div style="background: #e2e8f0; height: 24px; border-radius: 12px; overflow: hidden;">
                            <div style="background: linear-gradient(90deg, #3b82f6, #8b5cf6); height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">
                            Média: ${stat.avgBoxesPerOrder} caixas/pedido
                        </div>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        return html;
    }
}
