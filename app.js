/**
 * Main Application Controller
 * Initializes and orchestrates all warehouse management modules
 */

// Global application state
const App = {
    storage: null,
    parser: null,
    normalizer: null,
    validator: null,
    picker: null,
    analytics: null,

    // UI instances
    importUI: null,
    routeUI: null,
    pickingUI: null,
    historyUI: null,
    forecastUI: null,
    stockUI: null,
    settingsUI: null,

    // Current state
    currentView: 'import',
    currentSalesRep: null
};

/**
 * Initialize application
 */
function initializeApp() {
    console.log('🚀 Initializing Warehouse Management System...');

    try {
        // Initialize sample data if needed
        initializeSampleData();

        // Initialize core services
        App.storage = new StorageService();
        App.parser = new WhatsAppParser();
        App.validator = new OrderValidator({
            maxQuantityThreshold: 300
        });

        // Load data
        const products = App.storage.loadProducts();
        const distributors = App.storage.loadDistributors();
        const zones = App.storage.loadZones();

        // Initialize normalizer with products
        App.normalizer = new ProductNormalizer(products);

        // Initialize optimizer
        App.picker = new PickingListOptimizer(zones, distributors);

        // Initialize analytics
        App.analytics = new AnalyticsService();

        // Initialize UI modules
        console.log('Initializing UI modules...');

        App.importUI = new ImportUI(
            App.storage,
            App.parser,
            App.normalizer,
            App.validator
        );

        App.routeUI = new RouteUI(
            App.storage
        );

        App.pickingUI = new PickingUI(
            App.storage,
            App.picker
        );

        App.historyUI = new HistoryUI(
            App.storage,
            App.analytics
        );

        App.forecastUI = new ForecastUI(
            App.storage,
            App.analytics
        );

        App.stockUI = new StockUI(
            App.storage
        );

        App.settingsUI = new SettingsUI(
            App.storage
        );

        // Make UI instances globally accessible for cross-module communication
        window.routeUI = App.routeUI;
        window.pickingUI = App.pickingUI;
        window.forecastUI = App.forecastUI;
        window.stockUI = App.stockUI;
        window.settingsUI = App.settingsUI;

        // Initialize navigation
        initializeNavigation();

        // Initialize sales rep selector
        initializeSalesRepSelector();

        console.log('✅ Application initialized successfully!');
        console.log(`   - ${products.length} products loaded`);
        console.log(`   - ${distributors.length} distributors loaded`);
        console.log(`   - ${App.storage.loadOrders().length} orders in history`);

    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        alert('Erro ao inicializar aplicação. Verifique a consola para detalhes.');
    }
}

/**
 * Initialize navigation
 */
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;
            switchView(viewName);

            // Update active button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/**
 * Switch between views
 */
function switchView(viewName) {
    const views = document.querySelectorAll('.view');

    views.forEach(view => {
        if (view.id === `${viewName}View`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    App.currentView = viewName;

    // Refresh view data
    switch (viewName) {
        case 'route':
            App.routeUI.refresh();
            break;
        case 'picking':
            App.pickingUI.refresh();
            break;
        case 'history':
            App.historyUI.refresh();
            break;
        case 'forecast':
            App.forecastUI.refresh();
            break;
        case 'stock':
            App.stockUI.refresh();
            break;
    }
}

/**
 * Initialize sales rep selector
 */
function initializeSalesRepSelector() {
    const selector = document.getElementById('salesRepSelector');

    if (!selector) return;

    const salesReps = App.storage.loadSalesReps();

    // Populate selector
    selector.innerHTML = '<option value="">Todos os Vendedores</option>';
    salesReps.forEach(rep => {
        selector.innerHTML += `<option value="${rep.id}">${rep.name}</option>`;
    });

    // Handle selection change
    selector.addEventListener('change', (e) => {
        App.currentSalesRep = e.target.value || null;

        // Filter data based on sales rep
        if (App.currentSalesRep) {
            filterBySalesRep(App.currentSalesRep);
        } else {
            // Show all data
            clearSalesRepFilter();
        }
    });
}

/**
 * Filter data by sales rep
 */
function filterBySalesRep(salesRepId) {
    console.log(`Filtering by sales rep: ${salesRepId}`);

    // Get sales rep details
    const salesReps = App.storage.loadSalesReps();
    const salesRep = salesReps.find(s => s.id === salesRepId);

    if (!salesRep) return;

    // This would filter orders and display only those for this sales rep's customers
    // For now, just refresh views
    if (App.currentView === 'picking') {
        App.pickingUI.refresh();
    } else if (App.currentView === 'history') {
        App.historyUI.refresh();
    }
}

/**
 * Clear sales rep filter
 */
function clearSalesRepFilter() {
    console.log('Clearing sales rep filter');

    if (App.currentView === 'picking') {
        App.pickingUI.refresh();
    } else if (App.currentView === 'history') {
        App.historyUI.refresh();
    }
}

/**
 * Utility: Format date to Portuguese format
 */
function formatDatePT(dateString) {
    return new Date(dateString).toLocaleDateString('pt-PT');
}

/**
 * Utility: Format number with thousands separator
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Export application data
 */
function exportAllData() {
    const data = App.storage.exportData();
    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `warehouse-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    console.log('✅ Data exported successfully');
}

/**
 * Import application data
 */
function importAllData(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            App.storage.importData(data);

            alert('Dados importados com sucesso! A página será recarregada.');
            location.reload();
        } catch (error) {
            alert('Erro ao importar dados: ' + error.message);
        }
    };

    reader.readAsText(file);
}

/**
 * Reset all data (DANGEROUS!)
 */
function resetAllData() {
    const confirmed = confirm(
        'ATENÇÃO: Isto irá eliminar TODOS os dados!\n\n' +
        'Pedidos, configurações e histórico serão perdidos.\n\n' +
        'Deseja continuar?'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm('Tem a certeza? Esta ação não pode ser desfeita!');

    if (!doubleConfirm) return;

    App.storage.clearAll();

    alert('Dados eliminados. A página será recarregada.');
    location.reload();
}

/**
 * Show application info
 */
function showAppInfo() {
    const info = `
🏢 SISTEMA DE GESTÃO DE ARMAZÉM
Versão: 1.0.0

Desenvolvido para operações de armazém de produtos congelados
- Importação de pedidos WhatsApp
- Otimização de picking por zonas e rotas
- Validação de stock
- Previsão de compras
- Histórico e análise

Storage utilizado: ${App.storage.getStorageSize()}

Dados:
- Produtos: ${App.storage.loadProducts().length}
- Distribuidores: ${App.storage.loadDistributors().length}
- Vendedores: ${App.storage.loadSalesReps().length}
- Pedidos: ${App.storage.loadOrders().length}
    `;

    alert(info);
}

// Add to window for console access
window.App = App;
window.exportAllData = exportAllData;
window.importAllData = importAllData;
window.resetAllData = resetAllData;
window.showAppInfo = showAppInfo;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Console utilities
console.log('');
console.log('='.repeat(60));
console.log('🏢 WAREHOUSE MANAGEMENT SYSTEM');
console.log('='.repeat(60));
console.log('Console Commands:');
console.log('  - showAppInfo()      : Show application information');
console.log('  - exportAllData()    : Export all data to JSON');
console.log('  - resetAllData()     : Reset all data (DANGEROUS!)');
console.log('  - App.storage        : Access storage service');
console.log('  - App.pickingUI      : Access picking UI');
console.log('='.repeat(60));
console.log('');
