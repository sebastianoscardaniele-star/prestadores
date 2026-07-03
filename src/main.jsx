import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, TrendingUp, Plus, Trash2, Hospital, Medal, Download } from 'lucide-react';
import { seedPrestaciones } from './data.js';
import './style.css';

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });
const clean = (v) => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function App() {
  const [manuales, setManuales] = useState(() => JSON.parse(localStorage.getItem('prestaciones_extra') || '[]'));
  const [query, setQuery] = useState('consulta');
  const [clinica, setClinica] = useState('Todas');
  const [incremento, setIncremento] = useState(5);
  const [form, setForm] = useState({ prestadora: '', codigo: '', practica: '', precio: '' });

  const data = useMemo(() => [...seedPrestaciones, ...manuales], [manuales]);
  const clinicas = useMemo(() => ['Todas', ...Array.from(new Set(data.map(x => x.prestadora))).sort()], [data]);
  const filtradas = useMemo(() => {
    const q = clean(query);
    return data
      .filter(x => clinica === 'Todas' || x.prestadora === clinica)
      .filter(x => !q || clean(`${x.codigo} ${x.practica} ${x.prestadora}`).includes(q))
      .sort((a, b) => a.precio - b.precio);
  }, [data, query, clinica]);
  const top3 = filtradas.slice(0, 3);
  const totalActual = filtradas.reduce((s, x) => s + Number(x.precio || 0), 0);
  const totalNuevo = totalActual * (1 + Number(incremento || 0) / 100);

  const addPrestacion = (e) => {
    e.preventDefault();
    if (!form.prestadora || !form.practica || !form.precio) return;
    const next = [...manuales, { ...form, id: Date.now(), precio: Number(form.precio), manual: true }];
    setManuales(next);
    localStorage.setItem('prestaciones_extra', JSON.stringify(next));
    setForm({ prestadora: '', codigo: '', practica: '', precio: '' });
  };

  const removeManual = (id) => {
    const next = manuales.filter(x => x.id !== id);
    setManuales(next);
    localStorage.setItem('prestaciones_extra', JSON.stringify(next));
  };

  const exportCSV = () => {
    const rows = [['Prestadora','Codigo','Practica','Precio','Precio con incremento']].concat(
      filtradas.map(x => [x.prestadora, x.codigo, x.practica, x.precio, (x.precio * (1 + incremento / 100)).toFixed(2)])
    );
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'prestaciones_filtradas.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return <main>
    <section className="hero">
      <div>
        <span className="pill"><Hospital size={16}/> Red médica 2026</span>
        <h1>Matriz lógica de prestaciones</h1>
        <p>Buscá una práctica, compará prestadoras y elegí las 3 alternativas de menor costo. También podés simular incrementos mensuales y sumar prestaciones propias.</p>
      </div>
      <div className="stats">
        <b>{data.length.toLocaleString('es-AR')}</b><span>prestaciones</span>
        <b>{clinicas.length - 1}</b><span>prestadoras</span>
      </div>
    </section>

    <section className="panel searchbar">
      <label><Search size={18}/> Práctica / código / clínica
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ej: resonancia, consulta, laboratorio..." />
      </label>
      <label>Prestadora
        <select value={clinica} onChange={e => setClinica(e.target.value)}>{clinicas.map(c => <option key={c}>{c}</option>)}</select>
      </label>
      <label><TrendingUp size={18}/> Incremento mensual %
        <input type="number" value={incremento} onChange={e => setIncremento(Number(e.target.value))} />
      </label>
      <button onClick={exportCSV}><Download size={18}/> Exportar CSV</button>
    </section>

    <section className="cards">
      <div className="kpi"><span>Resultados encontrados</span><b>{filtradas.length.toLocaleString('es-AR')}</b></div>
      <div className="kpi"><span>Total actual filtrado</span><b>{money.format(totalActual)}</b></div>
      <div className="kpi"><span>Total con incremento</span><b>{money.format(totalNuevo)}</b></div>
    </section>

    <section className="panel">
      <h2><Medal size={20}/> Top 3 menor costo</h2>
      <div className="topgrid">{top3.map((x, i) => <article className="top" key={x.id}>
        <small>#{i + 1} opción</small><h3>{x.prestadora}</h3><p>{x.practica}</p><b>{money.format(x.precio)}</b><em>Con incremento: {money.format(x.precio * (1 + incremento / 100))}</em>
      </article>)}</div>
      {top3.length === 0 && <p className="empty">No hay resultados para esa búsqueda.</p>}
    </section>

    <section className="panel tablepanel">
      <h2>Detalle de resultados</h2>
      <div className="tablewrap"><table><thead><tr><th>Prestadora</th><th>Código</th><th>Práctica</th><th>Precio</th><th>Precio + inc.</th><th></th></tr></thead><tbody>
        {filtradas.slice(0, 250).map(x => <tr key={x.id}><td>{x.prestadora}</td><td>{x.codigo}</td><td>{x.practica}</td><td>{money.format(x.precio)}</td><td>{money.format(x.precio * (1 + incremento / 100))}</td><td>{x.manual && <button className="ghost" onClick={() => removeManual(x.id)}><Trash2 size={16}/></button>}</td></tr>)}
      </tbody></table></div>
      <p className="note">Se muestran hasta 250 filas para mantener la búsqueda ágil. Usá el exportador para descargar el resultado completo.</p>
    </section>

    <section className="panel">
      <h2><Plus size={20}/> Agregar prestación manual</h2>
      <form className="add" onSubmit={addPrestacion}>
        <input placeholder="Prestadora" value={form.prestadora} onChange={e => setForm({...form, prestadora:e.target.value})}/>
        <input placeholder="Código" value={form.codigo} onChange={e => setForm({...form, codigo:e.target.value})}/>
        <input placeholder="Práctica" value={form.practica} onChange={e => setForm({...form, practica:e.target.value})}/>
        <input placeholder="Precio" type="number" value={form.precio} onChange={e => setForm({...form, precio:e.target.value})}/>
        <button>Agregar</button>
      </form>
      <p className="note">Las altas manuales se guardan en el navegador mediante localStorage. Para edición masiva, reemplazá el archivo <code>src/data.js</code>.</p>
    </section>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
