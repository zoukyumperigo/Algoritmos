/**
 * Sample Data for Warehouse Management System
 * Realistic data for Portuguese frozen food distributor
 */

// ===== PRODUCTS =====
const SAMPLE_PRODUCTS = [
    // FROZEN SEAFOOD
    {
        sku: 'SHRMP-26-30',
        name: 'Camarão 26/30',
        aliases: ['26/30', 'Camarão 26-30', 'Shrimp 26/30', '2630'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 450,
        kgPerBox: 15,
        boxesPerPallet: 40,
        reorderPoint: 100,
        supplier: 'Atlantic Seafood Ltd',
        notes: 'Popular size for restaurants'
    },
    {
        sku: 'SHRMP-41-50',
        name: 'Camarão 41/50',
        aliases: ['41/50', 'Camarão 41-50', 'Shrimp 41/50', '4150'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 380,
        kgPerBox: 15,
        boxesPerPallet: 40,
        reorderPoint: 100,
        supplier: 'Atlantic Seafood Ltd',
        notes: 'Medium size shrimp'
    },
    {
        sku: 'SHRMP-51-60',
        name: 'Camarão 51/60',
        aliases: ['51/60', 'Camarão 51-60', 'Shrimp 51/60', '5160'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 280,
        kgPerBox: 15,
        boxesPerPallet: 40,
        reorderPoint: 80,
        supplier: 'Atlantic Seafood Ltd',
        notes: 'Small shrimp'
    },
    {
        sku: 'SQUID-TUBE',
        name: 'Lulas em Tubo',
        aliases: ['Lulas', 'Squid Tubes', 'Lula', 'Tubo Lula'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 220,
        kgPerBox: 10,
        boxesPerPallet: 50,
        reorderPoint: 60,
        supplier: 'Iberian Fish Co',
        notes: 'Cleaned squid tubes'
    },
    {
        sku: 'OCTOPUS-WHOLE',
        name: 'Polvo Inteiro',
        aliases: ['Polvo', 'Octopus', 'Polvo Inteiro'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 150,
        kgPerBox: 12,
        boxesPerPallet: 45,
        reorderPoint: 50,
        supplier: 'Iberian Fish Co',
        notes: 'Whole octopus'
    },
    {
        sku: 'SALMON-FILLET',
        name: 'Salmão Filete',
        aliases: ['Salmão', 'Salmon', 'Filete Salmão', 'Salmon Fillet'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 320,
        kgPerBox: 8,
        boxesPerPallet: 60,
        reorderPoint: 80,
        supplier: 'Nordic Fish AS',
        notes: 'Fresh frozen salmon fillets'
    },
    {
        sku: 'COD-FILLET',
        name: 'Bacalhau Filete',
        aliases: ['Bacalhau', 'Cod', 'Filete Bacalhau', 'Cod Fillet'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 180,
        kgPerBox: 10,
        boxesPerPallet: 50,
        reorderPoint: 60,
        supplier: 'Nordic Fish AS',
        notes: 'Atlantic cod fillets'
    },

    // FROZEN MEAT
    {
        sku: 'PORK-BELLY',
        name: 'Barriga de Porco',
        aliases: ['Barriga Porco', 'Pork Belly', 'Panceta'],
        zone: 'FROZEN_MEAT',
        currentStock: 400,
        kgPerBox: 20,
        boxesPerPallet: 35,
        reorderPoint: 100,
        supplier: 'Iberian Meats SA',
        notes: 'Skin on pork belly'
    },
    {
        sku: 'DUCK-WHOLE',
        name: 'Pato Inteiro',
        aliases: ['Pato', 'Duck', 'Pato Whole'],
        zone: 'FROZEN_MEAT',
        currentStock: 180,
        kgPerBox: 16,
        boxesPerPallet: 40,
        reorderPoint: 60,
        supplier: 'French Poultry SA',
        notes: 'Whole duck, cleaned'
    },
    {
        sku: 'CHICKEN-THIGH',
        name: 'Coxa de Frango',
        aliases: ['Coxa Frango', 'Chicken Thigh', 'Frango Coxa'],
        zone: 'FROZEN_MEAT',
        currentStock: 520,
        kgPerBox: 15,
        boxesPerPallet: 45,
        reorderPoint: 120,
        supplier: 'Avicola PT',
        notes: 'Boneless chicken thighs'
    },
    {
        sku: 'BEEF-TENDERLOIN',
        name: 'Lombo de Vaca',
        aliases: ['Lombo Vaca', 'Beef Tenderloin', 'Vaca Lombo'],
        zone: 'FROZEN_MEAT',
        currentStock: 90,
        kgPerBox: 12,
        boxesPerPallet: 40,
        reorderPoint: 40,
        supplier: 'Premium Beef Ltd',
        notes: 'Prime beef tenderloin'
    },

    // FROZEN PRE-COOKED
    {
        sku: 'SPRING-ROLL',
        name: 'Rolinhos Primavera',
        aliases: ['Rolinhos', 'Spring Roll', 'Rolinho Primavera'],
        zone: 'FROZEN_PRECOOKED',
        currentStock: 600,
        kgPerBox: 10,
        boxesPerPallet: 80,
        reorderPoint: 150,
        supplier: 'Asia Foods BV',
        notes: 'Vegetable spring rolls'
    },
    {
        sku: 'DUMPLING-PORK',
        name: 'Dumplings de Porco',
        aliases: ['Dumplings', 'Dumpling Porco', 'Gyoza'],
        zone: 'FROZEN_PRECOOKED',
        currentStock: 420,
        kgPerBox: 8,
        boxesPerPallet: 90,
        reorderPoint: 100,
        supplier: 'Asia Foods BV',
        notes: 'Pork dumplings'
    },
    {
        sku: 'DUMPLING-SHRIMP',
        name: 'Dumplings de Camarão',
        aliases: ['Dumpling Camarão', 'Shrimp Dumpling', 'Har Gow'],
        zone: 'FROZEN_PRECOOKED',
        currentStock: 350,
        kgPerBox: 8,
        boxesPerPallet: 90,
        reorderPoint: 80,
        supplier: 'Asia Foods BV',
        notes: 'Shrimp dumplings'
    },
    {
        sku: 'WONTON',
        name: 'Wonton',
        aliases: ['Wonton', 'Won Ton', 'Wantan'],
        zone: 'FROZEN_PRECOOKED',
        currentStock: 280,
        kgPerBox: 6,
        boxesPerPallet: 100,
        reorderPoint: 70,
        supplier: 'Asia Foods BV',
        notes: 'Mixed wontons'
    },
    {
        sku: 'BAO-PORK',
        name: 'Bao de Porco',
        aliases: ['Bao', 'Bao Porco', 'Pork Bao'],
        zone: 'FROZEN_PRECOOKED',
        currentStock: 200,
        kgPerBox: 5,
        boxesPerPallet: 120,
        reorderPoint: 60,
        supplier: 'Asia Foods BV',
        notes: 'Steamed bao buns with pork'
    },

    // DRY GOODS
    {
        sku: 'RICE-SUSHI',
        name: 'Arroz Sushi',
        aliases: ['Arroz', 'Sushi Rice', 'Rice Sushi', 'Arroz para Sushi'],
        zone: 'DRY_GOODS',
        currentStock: 800,
        kgPerBox: 25,
        boxesPerPallet: 30,
        reorderPoint: 200,
        supplier: 'Asian Grain Import',
        notes: 'Premium sushi rice'
    },
    {
        sku: 'RICE-JASMINE',
        name: 'Arroz Jasmin',
        aliases: ['Jasmine', 'Arroz Jasmine', 'Jasmine Rice'],
        zone: 'DRY_GOODS',
        currentStock: 650,
        kgPerBox: 25,
        boxesPerPallet: 30,
        reorderPoint: 150,
        supplier: 'Asian Grain Import',
        notes: 'Thai jasmine rice'
    },
    {
        sku: 'NOODLE-UDON',
        name: 'Noodles Udon',
        aliases: ['Udon', 'Noodle Udon', 'Massa Udon'],
        zone: 'DRY_GOODS',
        currentStock: 380,
        kgPerBox: 10,
        boxesPerPallet: 60,
        reorderPoint: 100,
        supplier: 'Asia Foods BV',
        notes: 'Fresh udon noodles'
    },
    {
        sku: 'NOODLE-RAMEN',
        name: 'Noodles Ramen',
        aliases: ['Ramen', 'Noodle Ramen', 'Massa Ramen'],
        zone: 'DRY_GOODS',
        currentStock: 420,
        kgPerBox: 10,
        boxesPerPallet: 60,
        reorderPoint: 110,
        supplier: 'Asia Foods BV',
        notes: 'Ramen noodles'
    },
    {
        sku: 'SOY-SAUCE-5L',
        name: 'Molho Soja 5L',
        aliases: ['Molho Soja', 'Soy Sauce', 'Shoyu'],
        zone: 'DRY_GOODS',
        currentStock: 240,
        kgPerBox: 20,
        boxesPerPallet: 40,
        reorderPoint: 60,
        supplier: 'Asia Foods BV',
        notes: 'Premium soy sauce 5L bottles'
    }
];

// ===== DISTRIBUTORS =====
const SAMPLE_DISTRIBUTORS = [
    {
        initial: 'J',
        name: 'João',
        routeNumber: 1,
        routePriority: 1,
        customers: ['Restaurante Marazul', 'Restaurant Golden Dragon', 'Chen\'s Garden'],
        deliveryDays: ['Mon', 'Wed', 'Fri'],
        phone: '+351 912 345 678',
        notes: 'Rota Lisboa Centro'
    },
    {
        initial: 'M',
        name: 'Maria',
        routeNumber: 2,
        routePriority: 2,
        customers: ['Restaurant Panda', 'New China', 'Restaurant Oriental'],
        deliveryDays: ['Tue', 'Thu', 'Sat'],
        phone: '+351 913 456 789',
        notes: 'Rota Lisboa Norte'
    },
    {
        initial: 'P',
        name: 'Paulo',
        routeNumber: 3,
        routePriority: 3,
        customers: ['Hong Kong Restaurant', 'Restaurant Shanghai', 'Dragon Palace'],
        deliveryDays: ['Mon', 'Wed', 'Fri'],
        phone: '+351 914 567 890',
        notes: 'Rota Margem Sul'
    },
    {
        initial: 'A',
        name: 'Ana',
        routeNumber: 4,
        routePriority: 4,
        customers: ['Restaurant Beijing', 'Wok Express', 'Lotus Garden'],
        deliveryDays: ['Tue', 'Thu'],
        phone: '+351 915 678 901',
        notes: 'Rota Sintra/Cascais'
    }
];

// ===== SALES REPRESENTATIVES =====
const SAMPLE_SALESREPS = [
    {
        id: 'carlos-silva',
        name: 'Carlos Silva',
        customers: ['Restaurante Marazul', 'Restaurant Golden Dragon', 'Restaurant Panda', 'New China'],
        email: 'carlos@frozenfoods.pt',
        phone: '+351 916 789 012'
    },
    {
        id: 'isabel-santos',
        name: 'Isabel Santos',
        customers: ['Chen\'s Garden', 'Restaurant Oriental', 'Hong Kong Restaurant', 'Restaurant Shanghai'],
        email: 'isabel@frozenfoods.pt',
        phone: '+351 917 890 123'
    },
    {
        id: 'external',
        name: 'Vendas Externas',
        customers: ['Dragon Palace', 'Restaurant Beijing', 'Wok Express', 'Lotus Garden'],
        email: 'vendas@frozenfoods.pt',
        phone: '+351 918 901 234'
    }
];

// ===== SAMPLE WHATSAPP TEXT FOR DEMO =====
const SAMPLE_WHATSAPP_TEXT = `J
Restaurante Marazul
10(41/50)

J
Restaurant Golden Dragon
5(26/30)
15(Arroz Sushi)
3(Spring Roll)

M
Restaurant Panda
20(Rolinhos Primavera)
8(Dumpling Porco)

M
New China
12(Pork Belly)
6(Duck)
10(Arroz Jasmin)

P
Hong Kong Restaurant
25(26/30)
8(Lulas)

A
Restaurant Beijing
15(Salmão)
10(Coxa Frango)
20(Arroz Sushi)`;

// ===== INITIALIZATION =====
function initializeSampleData() {
    const storage = new StorageService();

    // Check if data already exists
    const existingProducts = storage.loadProducts();

    if (existingProducts.length === 0) {
        console.log('Initializing sample data...');

        // Initialize products
        const products = SAMPLE_PRODUCTS.map(p => new Product(p));
        storage.saveProducts(products);

        // Initialize distributors
        const distributors = SAMPLE_DISTRIBUTORS.map(d => new Distributor(d));
        storage.saveDistributors(distributors);

        // Initialize sales reps
        const salesReps = SAMPLE_SALESREPS.map(s => new SalesRep(s));
        storage.saveSalesReps(salesReps);

        // Initialize zones
        storage.saveZones(DEFAULT_ZONES);

        console.log('Sample data initialized successfully!');
        console.log(`- ${products.length} products`);
        console.log(`- ${distributors.length} distributors`);
        console.log(`- ${salesReps.length} sales reps`);
    } else {
        console.log('Using existing warehouse data');
    }
}
