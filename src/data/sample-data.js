/**
 * Sample Data for Warehouse Management System
 * Realistic data for Século Verde Frozen Foods distributor
 */

// ===== PRODUCTS =====
const SAMPLE_PRODUCTS = [
    {
        sku: 'CAMARAO 20/30 Vannamei P',
        name: 'CAMARAO 20/30 Vannamei P',
        aliases: ['CAM 20/30', 'Vannamei P', 'Camarão 20/30', 'camarao 20/30'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 12,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarão S/Cabeça 41/50',
        name: 'Camarão S/Cabeça 41/50',
        aliases: ['CAM S/C 41/50', 'HLSO 41/50', 'Camarão s/ cabeça', 'camarao 41/50'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'TAMBORIL S/P 1000/1500 ENV NAMIBIA',
        name: 'TAMBORIL S/P 1000/1500 ENV NAMIBIA',
        aliases: ['MONK 1000/1500', 'Tamboril Namíbia', 'tamboril s/p'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarao S/C 26/30',
        name: 'Camarao S/C 26/30',
        aliases: ['CAM S/C 26/30', 'HLSO 26/30', 'Camarão sem cabeça', 'camarao 26/30'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'TENTACULOS POTA 3/4 COVETE',
        name: 'TENTACULOS POTA 3/4 COVETE',
        aliases: ['TENT POTA 3/4', 'Pota Covete', 'Tentáculos 3/4', 'pota covete'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'PORCO LOMBO CONG',
        name: 'PORCO LOMBO CONG',
        aliases: ['LOMBO PORCO', 'Porco Congelado', 'Pork Loin', 'porco lombo'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'TENTACULO POTA',
        name: 'TENTACULO POTA',
        aliases: ['TENT POTA', 'Tentáculos Pota', 'Squid Tentacles', 'pota tentaculo'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarão Cozido 40/60 Van',
        name: 'Camarão Cozido 40/60 Van',
        aliases: ['CAM COZ 40/60', 'Cozido 40/60', 'Cooked Shrimp 40/60'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 5,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'MEXILHAO 1/2 CONCHA N.Z',
        name: 'MEXILHAO 1/2 CONCHA N.Z',
        aliases: ['MEXILHAO NZ', 'Half Shell Mussel', 'Mexilhão Meia Concha', 'mexilhao nz'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 12,
        boxesPerPallet: 80,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'LULA LIMPA 20/40',
        name: 'LULA LIMPA 20/40',
        aliases: ['LULA 20/40', 'Clean Squid 20/40', 'Lula Limpa', 'lula 20/40'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 50,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Caprichos / Muslitos',
        name: 'Caprichos / Muslitos',
        aliases: ['MUSLITOS', 'Caprichos Mar', 'Patas Caranguejo', 'muslitos'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarao 30/40 inteiro',
        name: 'Camarao 30/40 inteiro',
        aliases: ['CAM INT 30/40', 'Whole Shrimp 30/40', 'Camarão 30/40', 'camarao inteiro'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'LINGUEIRAO',
        name: 'LINGUEIRAO',
        aliases: ['RAZOR CLAM', 'Lingueirão', 'Canivetes', 'lingueirao'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 5,
        boxesPerPallet: 80,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Pescada 2C',
        name: 'Pescada 2C',
        aliases: ['PESCADA 2C', 'Hake 2C', 'Pescada', 'pescada 2c'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Pescada 2L',
        name: 'Pescada 2L',
        aliases: ['PESCADA 2L', 'Hake 2L', 'Pescada', 'pescada 2l'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CARANGUEIJO',
        name: 'CARANGUEIJO',
        aliases: ['CRAB', 'Caranguejo', 'Sapateira', 'carangueijo'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 15,
        boxesPerPallet: 40,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarao 40/50 int.vannamei',
        name: 'Camarao 40/50 int.vannamei',
        aliases: ['CAM 40/50 INT', 'Vannamei 40/50', 'Camarão Inteiro', 'camarao 40/50'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'LAGOSTA 300/400 MARROCOS',
        name: 'LAGOSTA 300/400 MARROCOS',
        aliases: ['LOBSTER 300/400', 'Lagosta Marrocos', 'lagosta 300/400'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 12,
        boxesPerPallet: 40,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'ARROZ ITALIA 20 KG',
        name: 'ARROZ ITALIA 20 KG',
        aliases: ['ARROZ 20KG', 'Arroz Sushi', 'Italy Rice', 'arroz italia'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO S/CABEÇA 21/25',
        name: 'CAMARAO S/CABEÇA 21/25',
        aliases: ['CAM S/C 21/25', 'HLSO 21/25', 'Camarão 21/25', 'camarao s/cabeça'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarão Cozido 20/30 Van',
        name: 'Camarão Cozido 20/30 Van',
        aliases: ['CAM COZ 20/30', 'Cozido 20/30', 'Cooked Shrimp 20/30'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO BT INTEIRO 6/8',
        name: 'CAMARAO BT INTEIRO 6/8',
        aliases: ['CAM BT 6/8', 'Tiger Shrimp 6/8', 'Camarão Tigre 6/8', 'camarao bt'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'AMEIJOA C/CASCA BRANCA 10*1',
        name: 'AMEIJOA C/CASCA BRANCA 10*1',
        aliases: ['AMEIJOA BRANCA', 'White Shell Clam', 'Ameijoa 10*1', 'ameijoa branca'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 80,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'PATO CONG. Qta.MARINHA S/MIUDOS 2.5',
        name: 'PATO CONG. Qta.MARINHA S/MIUDOS 2.5',
        aliases: ['PATO 2.5', 'Duck No Giblets', 'Pato Marinha', 'pato cong'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 15,
        boxesPerPallet: 40,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Perna/Traseiro de Frango',
        name: 'Perna/Traseiro de Frango',
        aliases: ['PERNA FRANGO', 'Chicken Leg', 'Traseiro Frango', 'perna frango'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 50,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'PATO CONG. Qta.MARINHA S/MIUDOS',
        name: 'PATO CONG. Qta.MARINHA S/MIUDOS',
        aliases: ['PATO MARINHA', 'Duck', 'Pato s/ Miúdos', 'pato marinha'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 14.40,
        boxesPerPallet: 30,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'MASAGO LARANJA',
        name: 'MASAGO LARANJA',
        aliases: ['MASAGO ORANGE', 'Ovas Laranja', 'Capelin Roe', 'masago laranja'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 100,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'PEIXE MANTEIGA',
        name: 'PEIXE MANTEIGA',
        aliases: ['BUTTERFISH', 'Manteiga', 'Peixe Manteiga', 'peixe manteiga'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'MASAGO PRETO',
        name: 'MASAGO PRETO',
        aliases: ['MASAGO BLACK', 'Ovas Pretas', 'Capelin Roe Black', 'masago preto'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 100,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'ANEIS PANADOS 4*1- CX 4 KG',
        name: 'ANEIS PANADOS 4*1- CX 4 KG',
        aliases: ['ANEIS PANADOS', 'Squid Rings', 'Anéis de Lula', 'aneis panados'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 4,
        boxesPerPallet: 60,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'FILETE DE PANGA',
        name: 'FILETE DE PANGA',
        aliases: ['PANGA', 'Pangasius', 'Filete Panga', 'filete panga'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 50,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'AMEIJOA C/CASCA CASTANHA',
        name: 'AMEIJOA C/CASCA CASTANHA',
        aliases: ['AMEIJOA CASTANHA', 'Brown Shell Clam', 'Ameijoa', 'ameijoa castanha'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 80,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'ATUM LOMBOS VACUO',
        name: 'ATUM LOMBOS VACUO',
        aliases: ['ATUM VACUO', 'Tuna Loins', 'Lombos Atum', 'atum vacuo'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CHOCO C/TINTA SOLTO 350/500',
        name: 'CHOCO C/TINTA SOLTO 350/500',
        aliases: ['CHOCO 350/500', 'Cuttlefish w/ ink', 'Choco Solto', 'choco c/tinta'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'POTA TIRAS Granel',
        name: 'POTA TIRAS Granel',
        aliases: ['POTA TIRAS', 'Squid Strips', 'Tiras de Pota', 'pota tiras'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CARANGUEIJO BOCAS',
        name: 'CARANGUEIJO BOCAS',
        aliases: ['BOCAS CARANGUEIJO', 'Crab Claws', 'Bocas', 'carangueijo bocas'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarao S/Cab 31/35',
        name: 'Camarao S/Cab 31/35',
        aliases: ['CAM S/C 31/35', 'HLSO 31/35', 'Camarão 31/35', 'camarao s/cab'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CHOCO LIMPO 20/40',
        name: 'CHOCO LIMPO 20/40',
        aliases: ['CHOCO 20/40', 'Clean Cuttlefish', 'Choco Limpo', 'choco limpo'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 40,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CARANGUEIJO PATAS',
        name: 'CARANGUEIJO PATAS',
        aliases: ['PATAS CARANGUEIJO', 'Crab Legs', 'Patas', 'carangueijo patas'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'POTA SUJA',
        name: 'POTA SUJA',
        aliases: ['POTA INTEIRA', 'Dirty Squid', 'Pota Suja', 'pota suja'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 8,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO BT INTEIRO  4/6',
        name: 'CAMARAO BT INTEIRO  4/6',
        aliases: ['CAM BT 4/6', 'Tiger Shrimp 4/6', 'Black Tiger', 'camarao bt 4/6'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Ovas de Bacalhau 200/400',
        name: 'Ovas de Bacalhau 200/400',
        aliases: ['OVAS BACALHAU', 'Cod Roe', 'Ovas 200/400', 'ovas bacalhau'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 5,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'MASAGO GOLD',
        name: 'MASAGO GOLD',
        aliases: ['MASAGO OURO', 'Ovas Gold', 'Masago Gold', 'masago gold'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 100,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Camarao BT 13/15',
        name: 'Camarao BT 13/15',
        aliases: ['CAM BT 13/15', 'Tiger 13/15', 'Camarão BT', 'camarao bt 13/15'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 50,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'LAGOSTIM',
        name: 'LAGOSTIM',
        aliases: ['SCAMPI', 'Lagostim', 'Langoustine', 'lagostim'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO TIGRE 4/6 SN',
        name: 'CAMARAO TIGRE 4/6 SN',
        aliases: ['TIGRE 4/6', 'Tiger 4/6 SN', 'Camarão Tigre', 'camarao tigre'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 18,
        boxesPerPallet: 50,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO 20/30 Vanamei',
        name: 'CAMARAO 20/30 Vanamei',
        aliases: ['CAM 20/30 VAN', 'Vannamei 20/30', 'Camarão 20/30', 'camarao 20/30'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO S/CAB VAN 16/20',
        name: 'CAMARAO S/CAB VAN 16/20',
        aliases: ['CAM S/C 16/20', 'HLSO 16/20', 'Vannamei 16/20', 'camarao s/cab'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CREPE PRIMAVERA MINI',
        name: 'CREPE PRIMAVERA MINI',
        aliases: ['CREPE MINI', 'Spring Roll', 'Crepes Primavera', 'crepe mini'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 80,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO BORDO SN 40/60',
        name: 'CAMARAO BORDO SN 40/60',
        aliases: ['CAM BORDO 40/60', 'Bordo SN', 'Pink Shrimp', 'camarao bordo'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Peito Frango C/S',
        name: 'Peito Frango C/S',
        aliases: ['PEITO C/S', 'Chicken Breast', 'Peito Frango', 'peito frango c/s'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 12,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Peito Frango S/Sal',
        name: 'Peito Frango S/Sal',
        aliases: ['PEITO S/S', 'Chicken Breast No Salt', 'Peito sem sal', 'peito frango s/sal'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 50,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CARANGUEIJO CASCA MOLE',
        name: 'CARANGUEIJO CASCA MOLE',
        aliases: ['SOFT SHELL CRAB', 'Caranguejo Casca Mole', 'Soft Shell', 'carangueijo casca mole'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 80,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CHURROS 4 Kg',
        name: 'CHURROS 4 Kg',
        aliases: ['CHURROS', 'Churros 4KG', 'Churros congelados', 'churros 4kg'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 4,
        boxesPerPallet: 60,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CHOCO C/TINTA SOLTO 200/300',
        name: 'CHOCO C/TINTA SOLTO 200/300',
        aliases: ['CHOCO 200/300', 'Cuttlefish w/ ink', 'Choco Solto', 'choco 200/300'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 40,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Zagaia-castanheta (Galera)',
        name: 'Zagaia-castanheta (Galera)',
        aliases: ['GALERA', 'Zagaia', 'Castanheta', 'zagaia'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 4,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'MASAGO WASABI',
        name: 'MASAGO WASABI',
        aliases: ['MASAGO VERDE', 'Wasabi Roe', 'Masago Wasabi', 'masago wasabi'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 100,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CHOCO LIMPO 1/UP',
        name: 'CHOCO LIMPO 1/UP',
        aliases: ['CHOCO 1/UP', 'Clean Cuttlefish 1/UP', 'Choco Limpo', 'choco 1/up'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 40,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'GAMBAO L1 10/20',
        name: 'GAMBAO L1 10/20',
        aliases: ['GAMBAO L1', 'L1 Shrimp', 'Gambão 10/20', 'gambao l1'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 12,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'TUBO POTA U5',
        name: 'TUBO POTA U5',
        aliases: ['TUBO POTA', 'Squid Tube U5', 'Pota U5', 'tubo pota'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 10,
        boxesPerPallet: 40,
        reorderPoint: 8,
        supplier: '',
        notes: ''
    },
    {
        sku: 'MIOLO CAMARAO 41/50 VANNAMEI',
        name: 'MIOLO CAMARAO 41/50 VANNAMEI',
        aliases: ['MIOLO 41/50', 'PUD 41/50', 'Miolo Vannamei', 'miolo camarao'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Lombo Manteiga/Escolar',
        name: 'Lombo Manteiga/Escolar',
        aliases: ['ESCOLAR', 'Lombo Manteiga', 'Oilfish', 'lombo manteiga'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 1,
        boxesPerPallet: 50,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Douradinhos de Pescada',
        name: 'Douradinhos de Pescada',
        aliases: ['DOURADINHOS', 'Fish Fingers', 'Douradinhos Pescada', 'douradinhos'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 60,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CREPE PRIMAVERA MINI 4,5 Kg',
        name: 'CREPE PRIMAVERA MINI 4,5 Kg',
        aliases: ['CREPE 4.5KG', 'Spring Roll Mini', 'Crepe Primavera', 'crepe 4.5'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 4.5,
        boxesPerPallet: 50,
        reorderPoint: 20,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CAMARAO S/CAB 36/40',
        name: 'CAMARAO S/CAB 36/40',
        aliases: ['CAM S/C 36/40', 'HLSO 36/40', 'Camarão 36/40', 'camarao s/cab 36/40'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'MIOLO CAMARAO 36/40 VANNAMEI',
        name: 'MIOLO CAMARAO 36/40 VANNAMEI',
        aliases: ['MIOLO 36/40', 'PUD 36/40', 'Miolo Vannamei', 'miolo camarao'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 20,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    },
    {
        sku: 'DELICIAS DE LAGOSTA',
        name: 'DELICIAS DE LAGOSTA',
        aliases: ['DELICIAS LAGOSTA', 'Lobster Delights', 'Surimi', 'delicias lagosta'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 80,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'Tiras Panadas',
        name: 'Tiras Panadas',
        aliases: ['TIRAS PANADAS', 'Breaded Strips', 'Tiras Peixe', 'tiras panadas'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 6,
        boxesPerPallet: 60,
        reorderPoint: 5,
        supplier: '',
        notes: ''
    },
    {
        sku: 'CARABINEIRO BORDO (0) 6/7',
        name: 'CARABINEIRO BORDO (0) 6/7',
        aliases: ['CARABINEIRO 6/7', 'Scarlet Shrimp', 'Carabineiro 0', 'carabineiro bordo'],
        zone: 'FROZEN_SEAFOOD',
        currentStock: 0,
        kgPerBox: 12,
        boxesPerPallet: 50,
        reorderPoint: 10,
        supplier: '',
        notes: ''
    }
];

// ===== DISTRIBUTORS =====
const SAMPLE_DISTRIBUTORS = [
    {
        initial: 'J',
        name: 'João',
        routeNumber: 3,
        routePriority: 3,
        customers: [],
        deliveryDays: ['Mon', 'Wed', 'Fri'],
        phone: '+351 912 000 001',
        notes: 'Rota 3'
    },
    {
        initial: 'P',
        name: 'Paulo',
        routeNumber: 2,
        routePriority: 2,
        customers: [],
        deliveryDays: ['Tue', 'Thu'],
        phone: '+351 912 000 002',
        notes: 'Rota 2'
    },
    {
        initial: 'T',
        name: 'Tiago Filipe',
        routeNumber: 1,
        routePriority: 1,
        customers: [],
        deliveryDays: ['Mon', 'Wed', 'Fri'],
        phone: '+351 912 000 003',
        notes: 'Rota 1'
    },
    {
        initial: 'A',
        name: 'André',
        routeNumber: 4,
        routePriority: 4,
        customers: [],
        deliveryDays: ['Tue', 'Thu', 'Sat'],
        phone: '+351 912 000 004',
        notes: 'Rota 4'
    },
    {
        initial: 'N',
        name: 'Tiago Nunes',
        routeNumber: 4,
        routePriority: 4,
        customers: [],
        deliveryDays: ['Tue', 'Thu', 'Sat'],
        phone: '+351 912 000 005',
        notes: 'Rota 4'
    }
];

// ===== SALES REPRESENTATIVES =====
const SAMPLE_SALESREPS = [
    {
        id: 'paulo-filipe',
        name: 'Paulo Filipe',
        customers: [],
        email: 'paulo.filipe@seculoverde.pt',
        phone: '+351 916 000 001'
    },
    {
        id: 'antonio-casaca',
        name: 'António Casaca',
        customers: [],
        email: 'antonio.casaca@seculoverde.pt',
        phone: '+351 916 000 002'
    },
    {
        id: 'tiago-nunes',
        name: 'Tiago Nunes',
        customers: [],
        email: 'tiago.nunes@seculoverde.pt',
        phone: '+351 916 000 003'
    }
];

// ===== SAMPLE WHATSAPP TEXT FOR DEMO =====
const SAMPLE_WHATSAPP_TEXT = `J
Restaurante Marazul
10 Camarão 41/50
5 Polvo

P
Restaurant Golden Dragon
5 Camarão 26/30
15 Arroz Sushi
3 Spring Roll

T
Restaurant Panda
20 Rolinhos Primavera
8 Dumpling Porco`;

// ===== INITIALIZATION =====
function initializeSampleData() {
    const storage = new StorageService();

    // Check if data already exists
    const existingProducts = storage.loadProducts();

    if (existingProducts.length === 0) {
        console.log('Initializing Século Verde sample data...');

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

        console.log('Século Verde data initialized successfully!');
        console.log(`- ${products.length} products`);
        console.log(`- ${distributors.length} distributors`);
        console.log(`- ${salesReps.length} sales reps`);
    } else {
        console.log('Using existing warehouse data');
    }
}
