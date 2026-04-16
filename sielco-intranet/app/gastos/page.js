'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { formatCLP, formatDate } from '../../lib/utils';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ proyecto_id: '', categoria: 'general', descripcion: '', monto: 0, fecha: new Date().toISOString().split('T')[0] });
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('gastos').select('*, proyectos(nombre)').order('fecha', { ascending: false });
    const { data: pr } = await supabase.from('proyectos').select('id, nombre').eq('estado', 'activo').order('nombre');
    setGastos(data || []);
    setProyectos(pr || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await supabase.from('gastos').insert({ ...form, monto: Number(form.monto) });
    setMsg('Gasto registrado');
    setShowForm(false);
    setForm({ proyecto_id: '', categoria: 'general', descripcion: '', monto: 0, fecha: new Date().toISOString().split('T')[0] });
    load();
    setTimeout(() => setMsg(''), 3000);
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este gasto?')) return;
    await supabase.from('gastos').delete().eq('id', id);
    load();
  }

  const totalGastos = gastos.reduce((s, g) => s + Number(g.monto), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <h1>Gastos</h1>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : '+ Registrar Gasto'}</button>
          </div>
        </div>
        <div className="page-content">
          {msg && <div className="alert alert-success">{msg}</div>}
          {showForm && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group"><label>Proyecto *</label>
                    <select required value={form.proyecto_id} onChange={(e) => setForm({ ...form, proyecto_id: e.target.value })}>
                      <option value="">Seleccionar proyecto</option>
                      {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Categoria</label>
                    <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                      <option value="hosting">Hosting</option><option value="herramientas">Herramientas</option><option value="licencias">Licencias</option>
                      <option value="horas_trabajo">Horas de trabajo</option><option value="materiales">Materiales</option><option value="subcontrato">Subcontrato</option>
                      <option value="transporte">Transporte</option><option value="general">General</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Descripcion *</label><input required value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
                  <div className="form-group"><label>Monto (CLP) *</label><input type="number" required min="1" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></div>
                  <div className="form-group"><label>Fecha</label><input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></div>
                </div>
                <div className="form-actions"><button type="submit" className="btn btn-primary">Registrar Gasto</button></div>
              </form>
            </div>
          )}
          <div className="kpi-grid" style={{ marginBottom: '1rem' }}>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'var(--flame-bg)', color: 'var(--flame)' }}>$</div>
              <div><div className="kpi-value">{formatCLP(totalGastos)}</div><div className="kpi-label">Total gastos registrados</div></div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'var(--tech-bg)', color: 'var(--tech)' }}>#</div>
              <div><div className="kpi-value">{gastos.length}</div><div className="kpi-label">Registros</div></div>
            </div>
          </div>
          <div className="card">
            {loading ? <p>Cargando...</p> : gastos.length === 0 ? (
              <div className="empty-state"><p>No hay gastos registrados.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Fecha</th><th>Proyecto</th><th>Categoria</th><th>Descripcion</th><th>Monto</th><th></th></tr></thead>
                  <tbody>
                    {gastos.map((g) => (
                      <tr key={g.id}>
                        <td>{formatDate(g.fecha)}</td>
                        <td style={{ fontWeight: 500 }}>{g.proyectos?.nombre || '-'}</td>
                        <td><span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>{g.categoria}</span></td>
                        <td>{g.descripcion}</td>
                        <td style={{ fontWeight: 600 }}>{formatCLP(g.monto)}</td>
                        <td><button className="btn-icon" onClick={() => eliminar(g.id)} title="Eliminar">x</button></td>
                      </tr>
                    ))}
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
