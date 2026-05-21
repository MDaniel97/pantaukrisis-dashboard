export const LAST_UPDATED = '2026-05-20T08:14:00';

export const FUEL = {
  budi95Retail:            1.99,
  skpsRetail:              2.05,
  marketRON95:             4.07,
  marketRON97:             4.85,
  diesel:                  4.97,
  dieselEastMsia:          2.15,
  brentUSD:                82.4,
  wtiUSD:                  78.1,
  brentWeeklyChange:       '+1.2%',
  subsidyPerLitre:         2.08,
  totalSubsidyBillionMYR:  8.3,
};

export const COMMODITIES = [
  {
    id: 'rice',
    name: 'Beras Super 5%',
    emoji: '🌾',
    status: 'stable',
    retailPrice: 'RM 2.60/kg',
    change: '+0.2%',
    trend: 'up',
    note: 'Stok nasional mencukupi untuk 4 bulan. Musim menuai kedua bermula Jun 2026.',
    affectedArea: null,
  },
  {
    id: 'cookingoil',
    name: 'Minyak Masak Sawit',
    emoji: '🫙',
    status: 'warning',
    retailPrice: 'RM 8.70/kg',
    change: '+4.1%',
    trend: 'up',
    note: 'Kelewatan penghantaran di Pelabuhan Bintulu. Dijangka pulih dalam 2 minggu.',
    affectedArea: 'Sabah & Sarawak',
  },
  {
    id: 'chicken',
    name: 'Ayam Standard Segar',
    emoji: '🍗',
    status: 'stable',
    retailPrice: 'RM 9.40/kg',
    change: '-1.2%',
    trend: 'down',
    note: 'Bekalan pulih sepenuhnya selepas Hari Raya. Ternakan beroperasi pada kapasiti penuh.',
    affectedArea: null,
  },
  {
    id: 'onion',
    name: 'Bawang Merah Besar',
    emoji: '🧅',
    status: 'critical',
    retailPrice: 'RM 6.80/kg',
    change: '+18.5%',
    trend: 'up',
    note: 'India mengenakan cukai eksport 40% mulai 1 Mei. Import alternatif dari China dalam proses.',
    affectedArea: 'KL, Selangor, Pulau Pinang',
  },
  {
    id: 'egg',
    name: 'Telur Ayam Gred A',
    emoji: '🥚',
    status: 'stable',
    retailPrice: 'RM 0.45/biji',
    change: '0.0%',
    trend: 'flat',
    note: 'Pengeluaran domestik mencukupi. Harga kawalan RM 0.45 dikekalkan oleh KPDNHEP.',
    affectedArea: null,
  },
  {
    id: 'sugar',
    name: 'Gula Putih Berkilang',
    emoji: '🍬',
    status: 'warning',
    retailPrice: 'RM 2.95/kg',
    change: '+2.8%',
    trend: 'up',
    note: 'Kajian semula harga kawalan oleh KPDNHEP dijangka selesai Jun 2026.',
    affectedArea: 'Pantai Timur',
  },
];

export const GOVT_ACTIONS = [
  {
    id: 1,
    date: '15 Mei 2026',
    ministry: 'KPDN',
    ministryFull: 'Kementerian Perdagangan Dalam Negeri',
    ministryUrl: 'https://www.kpdn.gov.my',
    emoji: '🧅',
    trigger: 'Harga bawang melonjak 18.5%',
    triggerLevel: 'critical',
    action:
      'Pengecualian duti import bawang besar sehingga 31 Ogos 2026 diluluskan Kabinet. Jangkaan penurunan harga 25–30% dalam tempoh 3–4 minggu.',
    actionStatus: 'Aktif',
  },
  {
    id: 2,
    date: '10 Mei 2026',
    ministry: 'KPDN',
    ministryFull: 'Kementerian Perdagangan Dalam Negeri, Hal Ehwal Pengguna & Koperasi',
    ministryUrl: 'https://www.kpdn.gov.my',
    emoji: '🚛',
    trigger: 'Kos logistik meningkat 12.4% (MoM)',
    triggerLevel: 'warning',
    action:
      'Subsidi diesel untuk pengangkutan barangan penting dilanjutkan hingga Q4 2026. Meliputi 4,200 lori berdaftar di seluruh Malaysia.',
    actionStatus: 'Aktif',
  },
  {
    id: 3,
    date: '1 Mei 2026',
    ministry: 'MOF',
    ministryFull: 'Kementerian Kewangan Malaysia',
    ministryUrl: 'https://www.mof.gov.my',
    emoji: '⚡',
    trigger: 'Harga spot LNG naik 22% (Apr)',
    triggerLevel: 'warning',
    action:
      'Perjanjian bekalan LNG 15-tahun dengan QatarEnergy ditandatangani. Harga elektrik domestik dijamin stabil sehingga 2030.',
    actionStatus: 'Selesai',
  },
  {
    id: 4,
    date: '22 Apr 2026',
    ministry: 'KPKM',
    ministryFull: 'Kementerian Pertanian & Keterjaminan Makanan',
    ministryUrl: 'https://www.kpkm.gov.my',
    emoji: '🌿',
    trigger: 'Harga baja global naik 15%',
    triggerLevel: 'medium',
    action:
      'Geran ladang tempatan RM 120 juta dilanjutkan hingga Q3 2026. Manfaat kepada 8,400 pekebun kecil padi dan sayur-sayuran.',
    actionStatus: 'Aktif',
  },
];

export const SME = {
  freightWCI:       { value: 2847,  change: '+12.4%', trend: 'up' },
  exportApr:        { value: 119.2, change: '+3.1%',  trend: 'up' },
  importApr:        { value: 104.8, change: '-1.4%',  trend: 'down' },
  tradeBalance:     { value: 14.4,  change: '+5.2%',  trend: 'up' },
  dieselIndustrial: { value: 2.68,  change: '+4.7%',  trend: 'up' },
  cpo:              { value: 4312,  change: '+2.3%',  trend: 'up' },
  supplyRiskScore:  { value: 72, rating: 'Sederhana' },
  riskFactors: [
    { factor: 'Fret Antarabangsa', score: 82, color: 'text-rose-400' },
    { factor: 'Inventori Tempatan', score: 64, color: 'text-amber-400' },
    { factor: 'Kebergantungan Import', score: 71, color: 'text-amber-400' },
  ],
};

export const ANALYST = {
  brent:             { value: 82.4,  change: '+1.2%',  trend: 'up',   wkHigh: 94.8, wkLow: 68.3 },
  wti:               { value: 78.1,  change: '+0.9%',  trend: 'up' },
  lngImport:         { value: 3.21,  change: '-4.2%',  trend: 'down' },
  lngExport:         { value: 8.74,  change: '+1.8%',  trend: 'up' },
  myrUsd:            { value: 4.42,  change: '-0.3%',  trend: 'down' },
  cpiAll:            { value: 2.8,   change: '+0.2pp', trend: 'up' },
  cpiCore:           { value: 2.1,   change: '+0.1pp', trend: 'up' },
  cpiFood:           { value: 3.6,   change: '+0.4pp', trend: 'up' },
  ppiManufacturing:  { value: 4.1,   change: '+0.6pp', trend: 'up' },
  exportYTD:         { value: 476.8, change: '+4.2%',  trend: 'up' },
  importYTD:         { value: 414.7, change: '+1.8%',  trend: 'up' },
  tradeBalanceYTD:   { value: 62.1,  change: '+18.3%', trend: 'up' },
};

export const VEHICLES = [
  { id: 'moto',   label: 'Motosikal',                      emoji: '🏍️', tankL: 5,  fillMonth: 6, fuelType: 'ron95'  },
  { id: 'myvi',   label: 'Kereta Kecil (Myvi / Axia)',      emoji: '🚗', tankL: 35, fillMonth: 4, fuelType: 'ron95'  },
  { id: 'sedan',  label: 'Kereta Sederhana (Civic / Vios)', emoji: '🚗', tankL: 47, fillMonth: 4, fuelType: 'ron95'  },
  { id: 'suv',    label: 'SUV / MPV (Fortuner / Innova)',   emoji: '🚙', tankL: 65, fillMonth: 4, fuelType: 'both'   },
  { id: 'pickup', label: 'Pikap (Hilux / Triton)',          emoji: '🛻', tankL: 80, fillMonth: 5, fuelType: 'diesel' },
  { id: 'van',    label: 'Van / Lori Ringan',               emoji: '🚐', tankL: 70, fillMonth: 5, fuelType: 'diesel' },
];

export const CALC_CATEGORIES = [
  {
    id: 'budi95',
    label: 'BUDI95',
    desc: 'Warganegara 16+, MyKad & lesen aktif',
    fuelType:       'ron95',
    defaultVehicle: 'myvi',
    getSubsidised:  fuel => fuel.budi95Retail,
    getMarket:      fuel => fuel.marketRON95,
    marketLabel:    'RON95 Pasaran',
    subsidyLabel:   'RON95 BUDI95',
  },
  {
    id: 'skps',
    label: 'SKPS',
    desc: 'Kenderaan berdaftar layak SKPS',
    fuelType:       'ron95',
    defaultVehicle: 'myvi',
    getSubsidised:  fuel => fuel.skpsRetail,
    getMarket:      fuel => fuel.marketRON95,
    marketLabel:    'RON95 Pasaran',
    subsidyLabel:   'RON95 SKPS',
  },
  {
    id: 'diesel_east',
    label: 'Diesel Sabah & Sarawak',
    desc: 'Berbanding diesel Semenanjung',
    fuelType:       'diesel',
    defaultVehicle: 'pickup',
    getSubsidised:  fuel => fuel.dieselEastMsia,
    getMarket:      fuel => fuel.diesel,
    marketLabel:    'Diesel Semenanjung',
    subsidyLabel:   'Diesel Sabah & Sarawak',
  },
];

const COMMODITY_META = {
  rice:       { note: 'Stok nasional mencukupi. Pantau harga di pasar raya berdekatan.', affectedArea: null },
  cookingoil: { note: 'Semak status bekalan terkini di portal KPDNHEP.', affectedArea: null },
  chicken:    { note: 'Bekalan beroperasi pada kapasiti penuh.', affectedArea: null },
  onion:      { note: 'Harga dipengaruhi oleh bekalan import. Semak harga terkini.', affectedArea: null },
  egg:        { note: 'Harga kawalan KPDNHEP dikekalkan.', affectedArea: null },
  sugar:      { note: 'Kajian semula harga kawalan oleh KPDNHEP.', affectedArea: null },
};

export function mapFuelResponse(data) {
  return {
    ...FUEL,
    budi95Retail:    data.ron95_budi95    ?? FUEL.budi95Retail,
    skpsRetail:      data.ron95_skps      ?? FUEL.skpsRetail,
    marketRON95:     data.ron95           ?? FUEL.marketRON95,
    marketRON97:     data.ron97           ?? FUEL.marketRON97,
    diesel:          data.diesel          ?? FUEL.diesel,
    dieselEastMsia:  data.diesel_eastmsia ?? FUEL.dieselEastMsia,
    subsidyPerLitre: data.ron95 && data.ron95_budi95
      ? +((data.ron95 - data.ron95_budi95).toFixed(2))
      : FUEL.subsidyPerLitre,
  };
}

export function mapCommoditiesResponse(items) {
  return items.map(item => {
    const pct = item.change_pct ?? 0;
    const status = pct > 10 ? 'critical' : pct > 3 ? 'warning' : 'stable';
    const meta = COMMODITY_META[item.id] ?? { note: '', affectedArea: null };
    return {
      id:          item.id,
      name:        item.name,
      emoji:       item.emoji,
      status,
      retailPrice: item.price != null ? `RM ${item.price.toFixed(2)}/${item.unit}` : '—',
      change:      pct != null ? `${pct > 0 ? '+' : ''}${pct}%` : '—',
      trend:       item.trend ?? 'flat',
      note:        meta.note,
      affectedArea: meta.affectedArea,
    };
  });
}
