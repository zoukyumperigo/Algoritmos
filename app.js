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
    settingsUI: null,

    // Current state
    currentView: 'import',
    currentSalesRep: null
};

/**
 * Initialize application
 */
async function initializeApp() {
    console.log('🚀 Initializing Warehouse Management System...');

    try {
        // Initialize sample data if needed
        initializeSampleData();

        // Initialize core services
        App.storage = new StorageService();

        // Initialize IndexedDB and load data into cache
        console.log('📦 Initializing database...');
        await App.storage.init();
        console.log('✅ Database initialized successfully!');

        App.parser = new WhatsAppParser();
        App.validator = new OrderValidator({
            maxQuantityThreshold: 300
        });

        // Load data from cache (now synchronous)
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

        App.settingsUI = new SettingsUI(
            App.storage
        );

        // Make UI instances globally accessible for cross-module communication
        window.routeUI = App.routeUI;
        window.pickingUI = App.pickingUI;
        window.settingsUI = App.settingsUI;

        // Initialize navigation
        initializeNavigation();

        // Initialize sales rep selector
        initializeSalesRepSelector();

        // Initialize motivational phrases
        initializeMotivationalPhrases();

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
    }
}

/**
 * Clear sales rep filter
 */
function clearSalesRepFilter() {
    console.log('Clearing sales rep filter');

    if (App.currentView === 'picking') {
        App.pickingUI.refresh();
    }
}

/**
 * Initialize motivational phrases
 */
function initializeMotivationalPhrases() {
    const phrases = [
        "Cada pedido é uma oportunidade de excelência! 🌟",
        "Precisão e rapidez: a nossa força! 💪",
        "Juntos construímos o sucesso do amanhã! 🚀",
        "A qualidade começa aqui, no armazém! ✨",
        "Excelência em cada produto, eficiência em cada entrega! 📦",
        "O trabalho em equipa faz a diferença! 🤝",
        "Crescemos quando crescemos juntos! 🌱",
        "Cada dia é uma nova oportunidade de superação! 🎯",
        "A sua dedicação é o nosso maior ativo! 💎",
        "Inovação e tradição em perfeita harmonia! 🔄",
        "Século Verde: Frescura que transforma negócios! 🦐",
        "Do mar para a mesa, com qualidade garantida! 🌊"
    ];

    const phraseElement = document.getElementById('motivationalPhrase');

    if (!phraseElement) return;

    // Function to update phrase
    function updatePhrase() {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        const phrase = phrases[randomIndex];

        // Fade out
        phraseElement.style.opacity = '0';

        setTimeout(() => {
            phraseElement.textContent = phrase;
            // Fade in
            phraseElement.style.opacity = '1';
        }, 300);
    }

    // Set initial phrase
    updatePhrase();

    // Rotate phrases every 10 seconds
    setInterval(updatePhrase, 10000);
}

// Add transition to motivational phrase
if (document.getElementById('motivationalPhrase')) {
    document.getElementById('motivationalPhrase').style.transition = 'opacity 0.3s ease-in-out';
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

/**
 * RULE 4: Update picking progress when checkboxes are clicked
 * Shows visual feedback for completed items
 */
function updatePickingProgress() {
    // Count checked items
    const allCheckboxes = document.querySelectorAll('.pick-checkbox');
    const checkedCount = document.querySelectorAll('.pick-checkbox:checked').length;
    const totalCount = allCheckboxes.length;

    // Update any progress indicators if they exist
    const progressElements = document.querySelectorAll('.picking-progress');
    progressElements.forEach(el => {
        el.textContent = `${checkedCount}/${totalCount} items picked`;
    });

    // Mark completed rows with strikethrough
    allCheckboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row && !row.classList.contains('total-row')) {
            if (checkbox.checked) {
                row.style.opacity = '0.5';
                row.style.textDecoration = 'line-through';
            } else {
                row.style.opacity = '1';
                row.style.textDecoration = 'none';
            }
        }
    });
}

// Add to window for console access
window.App = App;
window.exportAllData = exportAllData;
window.importAllData = importAllData;
window.resetAllData = resetAllData;
window.showAppInfo = showAppInfo;
window.updatePickingProgress = updatePickingProgress;

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
