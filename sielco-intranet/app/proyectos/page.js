'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { formatCLP, formatDate, estadoColor, daysBetween } from '../../lib/utils';

export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [emisores, setEmisores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', tipo: 'desarrollo', cliente_id: '', emisor_id: '', presupuesto: 0, fecha_inicio: '', fecha_entrega: '', facturado: false, notas: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('vista_proyectos_sin_facturar').select('*').order('created_at', { ascending: false });
    const { data: cl } = await supabase.from('clientes').select('id, nombre, empresa').order('nombre');
    const { data: em } = await supabase.from('emisores').select('id, nombre').order('nombre');
    setProyectos(data || []);
    setClientes(cl || []);
    setEmisores(em || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await supabase.from('proyectos').insert({
      ...form,
      presupuesto: Number(form.presupuesto),
      cliente_id: form.cliente_id || null,
      emisor_id: form.emisor_id || null,
      fecha_entrega: form.fecha_entrega || null,
      fecha_inicio: form.fecha_inicio || null,
    });
    setMsg('Proyecto creado');
    setShowForm(false);
    setForm({ nombre: '', tipo: 'desarrollo', cliente_id: '', emisor_id: '', presupuesto: 0, fecha_inicio: '', fecha_entrega: '', facturado: false, notas: '' });
    load();
    setTimeout(() => setMsg(''), 3000);
  }

  async function cambiarEstado(id, estado) {
    await supabase.from('proyectos').update({ estado, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  }

  async function marcarEntregado(id) {
    const fecha = new Date().toISOString().split('T')[0];
    await supabase.from('proyectos').update({ fecha_entrega: fecha, estado: 'completado' }).eq('id', id);
    load();
  }

  async function marcarFacturado(id, facturado) {
    await supabase.from('proyectos').update({ facturado }).eq('id', id);
    load();
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <h1>Proyectos</h1>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : '+ Nuevo Proyecto'}</button>
          </div>
        </div>
        <div className="page-content">
          {msg && <div className="alert alert-success">{msg}</div>}
          {showForm && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group"><label>Nombre *</label><input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
                  <div className="form-group"><label>Tipo</label>
                    <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                      <option value="desarrollo">Desarrollo</option><option value="incendio">Incendio</option><option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Cliente</label>
                    <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                      <option value="">Sin cliente</option>
                      {clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa || c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Emisor</label>
                    <select value={form.emisor_id} onChange={(e) => setForm({ ...form, emisor_id: e.target.value })}>
                      <option value="">Sin emisor</option>
                      {emisores.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Presupuesto (CLP)</label><input type="number" value={form.presupuesto} onChange={(e) => setForm({ ...form, presupuesto: e.target.value })} /></div>
                  <div className="form-group"><label>Fecha inicio</label><input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
                  <div className="form-group"><label>Fecha entrega (si ya entregado)</label><input type="date" value={form.fecha_entrega} onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })} /></div>
                  <div className="form-group full"><label>Notas</label><input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></div>
                </div>
                <div className="form-actions"><button type="submit" className="btn btn-primary">Crear Proyecto</button></div>
              </form>
            </div>
          )}

          <div className="card">
            {loading ? <p>Cargando...</p> : proyectos.length === 0 ? (
              <div className="empty-state"><p>No hay proyectos.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th><th>Tipo</th><th>Cliente</th><th>Presupuesto</th><th>Costo</th>
                      <th>Entrega</th><th>Días sin facturar</th><th>Estado</th><th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proyectos.map((p) => {
                      const ec = estadoColor(p.estado);
                      return (
                        <tr key={p.id} style={{ background: p.alerta_facturacion ? '#ffebee' : undefined }}>
                          <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                          <td>
                            <span className="badge" style={{ background: p.tipo === 'desarrollo' ? 'var(--tech-bg)' : 'var(--flame-bg)', color: p.tipo === 'desarrollo' ? 'var(--tech)' : 'var(--flame)' }}>
                              {p.tipo}
                            </span>
                          </td>
                          <td>{p.cliente_empresa || p.cliente_nombre || '-'}</td>
                          <td>{formatCLP(p.presupuesto)}</td>
                          <td>{formatCLP(p.costo_real)}</td>
                          <td>
                            {p.fecha_entrega ? formatDate(p.fecha_entrega) : (
                              <button className="btn btn-sm btn-secondary" onClick={() => marcarEntregado(p.id)} style={{ fontSize: '0.7rem' }}>
                                Marcar entregado
                              </button>
                            )}
                          </td>
                          <td>
                            {p.dias_sin_facturar !== null && (
                              <span style={{
                                fontWeight: 600,
                                color: p.alerta_facturacion ? 'var(--danger)' : p.dias_sin_facturar > 15 ? 'var(--warning)' : 'var(--gray-500)',
                              }}>
                                {p.dias_sin_facturar} días {p.alerta_facturacion && '⚠'}
                              </span>
                            )}
                            {p.facturado && <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>✓ Facturado</span>}
                          </td>
                          <td><span className="badge" style={{ background: ec.bg, color: ec.color }}>{p.estado}</span></td>
                          <td style={{ display: 'flex', gap: '0.3rem' }}>
                            <select
                              style={{ fontSize: '0.72rem', padding: '0.2rem', border: '1px solid var(--gray-200)', borderRadius: 4 }}
                              value={p.estado}
                              onChange={(e) => cambiarEstado(p.id, e.target.value)}
                            >
                              <option value="activo">Activo</option>
                              <option value="pausado">Pausado</option>
                              <option value="completado">Completado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                            {p.fecha_entrega && !p.facturado && (
                              <button className="btn btn-sm btn-success" onClick={() => marcarFacturado(p.id, true)} style={{ fontSize: '0.7rem' }}>
                                Facturar
                              </button>
                            )}
                            {p.facturado && (
                              <button className="btn btn-sm btn-secondary" onClick={() => marcarFacturado(p.id, false)} style={{ fontSize: '0.7rem' }}>
                                Des-facturar
                              </button>
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
