'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { formatCLP, formatDate, estadoColor } from '../../lib/utils';

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [form, setForm] = useState({ proyecto_id: '', cliente_id: '', monto: 0, fecha_emision: new Date().toISOString().split('T')[0], fecha_vencimiento: '', tipo_doc: 'factura', numero_doc: '', notas: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, [filtro]);

  async function load() {
    let query = supabase.from('pagos').select('*, proyectos(nombre), clientes(nombre, empresa)').order('fecha_emision', { ascending: false });
    if (filtro !== 'todos') query = query.eq('estado', filtro);
    const { data } = await query;
    const { data: pr } = await supabase.from('proyectos').select('id, nombre').order('nombre');
    const { data: cl } = await supabase.from('clientes').select('id, nombre, empresa').order('nombre');
    setPagos(data || []);
    setProyectos(pr || []);
    setClientes(cl || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await supabase.from('pagos').insert({ ...form, monto: Number(form.monto), proyecto_id: form.proyecto_id || null, cliente_id: form.cliente_id || null });
    setMsg('Pago registrado');
    setShowForm(false);
    load();
    setTimeout(() => setMsg(''), 3000);
  }

  async function marcarPagado(id) {
    await supabase.from('pagos').update({ estado: 'pagado', fecha_pago: new Date().toISOString().split('T')[0] }).eq('id', id);
    load();
  }

  const totalPendiente = pagos.filter((p) => p.estado === 'pendiente').reduce((s, p) => s + Number(p.monto), 0);
  const totalPagado = pagos.filter((p) => p.estado === 'pagado').reduce((s, p) => s + Number(p.monto), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <h1>Cobros y Pagos</h1>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : '+ Nuevo Cobro'}</button>
          </div>
        </div>
        <div className="page-content">
          {msg && <div className="alert alert-success">{msg}</div>}
          {showForm && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group"><label>Cliente</label>
                    <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa || c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Proyecto</label>
                    <select value={form.proyecto_id} onChange={(e) => setForm({ ...form, proyecto_id: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Monto (CLP) *</label><input type="number" required min="1" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></div>
                  <div className="form-group"><label>Tipo documento</label>
                    <select value={form.tipo_doc} onChange={(e) => setForm({ ...form, tipo_doc: e.target.value })}>
                      <option value="factura">Factura</option><option value="boleta">Boleta</option><option value="nota_credito">Nota de credito</option><option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="form-group"><label>N documento</label><input value={form.numero_doc} onChange={(e) => setForm({ ...form, numero_doc: e.target.value })} /></div>
                  <div className="form-group"><label>Fecha emision</label><input type="date" value={form.fecha_emision} onChange={(e) => setForm({ ...form, fecha_emision: e.target.value })} /></div>
                  <div className="form-group"><label>Fecha vencimiento</label><input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} /></div>
                  <div className="form-group"><label>Notas</label><input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></div>
                </div>
                <div className="form-actions"><button type="submit" className="btn btn-primary">Registrar Cobro</button></div>
              </form>
            </div>
          )}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>$</div>
              <div><div className="kpi-value">{formatCLP(totalPendiente)}</div><div className="kpi-label">Pendiente de cobro</div></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>$</div>
              <div><div className="kpi-value">{formatCLP(totalPagado)}</div><div className="kpi-label">Total cobrado</div></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['todos', 'pendiente', 'pagado', 'vencido'].map((e) => (
              <button key={e} className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro(e)}>
                {e === 'todos' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
          <div className="card">
            {loading ? <p>Cargando...</p> : pagos.length === 0 ? (
              <div className="empty-state"><p>No hay registros.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Fecha</th><th>Cliente</th><th>Proyecto</th><th>Tipo</th><th>N Doc</th><th>Monto</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
                  <tbody>
                    {pagos.map((p) => {
                      const ec = estadoColor(p.estado);
                      return (
                        <tr key={p.id}>
                          <td>{formatDate(p.fecha_emision)}</td>
                          <td>{p.clientes?.empresa || p.clientes?.nombre || '-'}</td>
                          <td>{p.proyectos?.nombre || '-'}</td>
                          <td>{p.tipo_doc}</td>
                          <td>{p.numero_doc || '-'}</td>
                          <td style={{ fontWeight: 600 }}>{formatCLP(p.monto)}</td>
                          <td>{formatDate(p.fecha_vencimiento)}</td>
                          <td><span className="badge" style={{ background: ec.bg, color: ec.color }}>{p.estado}</span></td>
                          <td>
                            {p.estado === 'pendiente' && (
                              <button className="btn btn-sm btn-success" onClick={() => marcarPagado(p.id)}>Cobrado</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
