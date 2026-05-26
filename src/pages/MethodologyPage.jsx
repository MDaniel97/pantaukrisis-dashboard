import { Database, RefreshCw, GitBranch, Globe, Clock } from 'lucide-react';

const SOURCES = [
  {
    name: 'DOSM — Fuel Prices',
    org: 'Jabatan Perangkaan Malaysia',
    url: 'https://storage.data.gov.my/commodities/fuelprice.parquet',
    urlLabel: 'storage.data.gov.my',
    fields: ['RON95', 'RON97', 'Diesel', 'Diesel East Malaysia', 'RON95-SKPS', 'RON95-BUDI95'],
    format: 'Parquet',
    cadence: 'Mingguan (setiap Rabu/Khamis)',
    note: 'Kolum subsidI SKPS & BUDI95 hanya tersedia dari 30 Sep 2025.',
  },
  {
    name: 'DOSM — Pricecatcher',
    org: 'Jabatan Perangkaan Malaysia',
    url: 'https://storage.data.gov.my/commodities/pricecatcher_YYYY-MM.parquet',
    urlLabel: 'storage.data.gov.my (bulanan)',
    fields: ['Beras', 'Minyak masak', 'Ayam', 'Bawang merah', 'Telur', 'Gula'],
    format: 'Parquet',
    cadence: 'Bulanan',
    note: 'Backend mencuba bulan semasa dahulu, kemudian undur sehingga 2 bulan jika fail 404.',
  },
  {
    name: 'DOSM — CPI, PPI & Perdagangan',
    org: 'Jabatan Perangkaan Malaysia',
    url: 'https://api.data.gov.my/data-catalogue/',
    urlLabel: 'api.data.gov.my/data-catalogue',
    fields: ['CPI Keseluruhan', 'CPI Makanan', 'PPI (YoY)', 'Eksport', 'Import', 'Imbangan Dagangan'],
    format: 'JSON (REST API)',
    cadence: 'Bulanan',
    note: 'Set data: cpi_headline, ppi, trade_headline.',
  },
  {
    name: 'Bank Negara Malaysia — Kadar Tukaran',
    org: 'BNM',
    url: 'https://api.bnm.gov.my/public/exchange-rate',
    urlLabel: 'api.bnm.gov.my',
    fields: ['MYR/USD (kadar tengah)'],
    format: 'JSON (REST API)',
    cadence: 'Harian (hari bekerja)',
    note: 'Kadar semasa; perubahan MoM dikira menggunakan data sejarah FRED.',
  },
  {
    name: 'FRED — DEXMAUS',
    org: 'Federal Reserve Bank of St. Louis',
    url: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXMAUS',
    urlLabel: 'fred.stlouisfed.org',
    fields: ['MYR/USD harian (22 hari lepas → perubahan MoM)'],
    format: 'CSV',
    cadence: 'Harian (hari bekerja)',
    note: 'Digunakan untuk mengira % perubahan MoM pada kadar BNM semasa.',
  },
  {
    name: 'EIA — Brent & WTI Spot',
    org: 'U.S. Energy Information Administration',
    url: 'https://api.eia.gov/v2/petroleum/pri/spt/data/',
    urlLabel: 'api.eia.gov',
    fields: ['Brent Crude (RBRTE)', 'WTI Crude (RWTC)', 'Tinggi/Rendah 52 minggu'],
    format: 'JSON (REST API)',
    cadence: 'Harian (hari bekerja)',
    note: 'Menggunakan DEMO_KEY secara lalai; daftar di eia.gov/opendata untuk kunci peribadi.',
  },
];

const FALLBACK_STEPS = [
  {
    step: 1,
    label: '/api/fuel/latest',
    desc: 'Backend FastAPI (port 8000) — data terkini dari cache DOSM, termasuk cap masa fetched_at.',
    badge: 'Utama',
    color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  },
  {
    step: 2,
    label: 'api.data.gov.my (langsung)',
    desc: 'API awam DOSM dipanggil terus dari pelayar jika backend tidak dapat dicapai.',
    badge: 'Sandaran 1',
    color: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  },
  {
    step: 3,
    label: '/fuel-snapshot.json',
    desc: 'Fail statik yang ditulis oleh backend setiap hari 08:00 — disajikan dari /public.',
    badge: 'Sandaran 2',
    color: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
  },
  {
    step: 4,
    label: 'Pemalar dalaman (constants.js)',
    desc: 'Nilai tetap yang dikodkan dalam frontend — hanya digunakan jika semua tiga sumber di atas gagal.',
    badge: 'Terakhir',
    color: 'bg-red-500/15 border-red-500/30 text-red-400',
  },
];


function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-blue-400" />
      <h2 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h2>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div className="space-y-8 pb-4">

      {/* Intro */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
        <p className="text-slate-300 text-sm leading-relaxed">
          PantauKrisis menggabungkan data langsung dari beberapa sumber awam Malaysia dan antarabangsa.
          Semua data diambil oleh backend FastAPI, dicache dalam memori selama <strong className="text-white">1 jam</strong>,
          dan disegarkan semula secara automatik setiap hari pada <strong className="text-white">08:00</strong>.
          Frontend menggunakan rantaian sandaran 4 peringkat untuk memastikan data sentiasa dipaparkan
          walaupun backend atau API luar tidak dapat dicapai.
        </p>
      </div>

      {/* Data Sources */}
      <div>
        <SectionHeader icon={Database} title="Sumber Data" />
        <div className="grid gap-3">
          {SOURCES.map(src => (
            <div key={src.name} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div>
                  <div className="text-white font-medium text-sm">{src.name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{src.org}</div>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">{src.format}</span>
                  <span className="bg-blue-600/20 text-blue-300 border border-blue-600/30 text-xs px-2 py-0.5 rounded-full">{src.cadence}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {src.fields.map(f => (
                  <span key={f} className="bg-slate-700/60 text-slate-300 text-xs px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <Globe size={11} />
                <span className="font-mono">{src.urlLabel}</span>
              </div>

              {src.note && (
                <div className="text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2 mt-1">
                  {src.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fetch Fallback Chain */}
      <div>
        <SectionHeader icon={GitBranch} title="Rantaian Sandaran Harga Bahan Api" />
        <div className="space-y-2">
          {FALLBACK_STEPS.map((s, i) => (
            <div key={s.step} className="flex gap-3 items-start">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                  {s.step}
                </div>
                {i < FALLBACK_STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-slate-700 my-1" style={{ minHeight: 12 }} />
                )}
              </div>
              <div className={`flex-1 border rounded-xl px-4 py-3 mb-1 ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold">{s.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${s.color}`}>{s.badge}</span>
                </div>
                <p className="text-xs text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caching & Refresh */}
      <div>
        <SectionHeader icon={Clock} title="Cache & Jadual Kemaskini" />
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">1 jam</div>
            <div className="text-xs text-slate-400">TTL cache dalam memori — setiap respons API disimpan selama 1 jam sebelum diambil semula dari sumber asal.</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">08:00</div>
            <div className="text-xs text-slate-400">Masa muat semula harian — backend mengosongkan cache dan mengambil semula semua data DOSM setiap pagi.</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">Startup</div>
            <div className="text-xs text-slate-400">Pre-warm cache — semasa pelancaran server, data fuel dan snapshot awam ditulis secara serta-merta.</div>
          </div>
        </div>
      </div>

      {/* Refresh note */}
      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3">
        <RefreshCw size={12} className="mt-0.5 shrink-0 text-slate-500" />
        <span>
          Data komoditi (CPI, PPI, perdagangan) dikemaskini oleh DOSM secara bulanan.
          Harga bahan api dikemaskini mingguan. Kadar tukaran dan harga minyak mentah dikemaskini harian (hari bekerja sahaja).
        </span>
      </div>

    </div>
  );
}
