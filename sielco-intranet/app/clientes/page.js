'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../components/ImageUpload';
import { formatCLP } from '../../lib/utils';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', empresa: '', rut: '', email: '', telefono: '', direccion: '', logo_url: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('vista_resumen_clientes').select('*').order('nombre');
    setClientes(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editId) {
      await supabase.from('clientes').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editId);
      setMsg('Cliente actualizado');
    } else {
      await supabase.from('clientes').insert(form);
      setMsg('Cliente creado');
    }
    resetForm();
    load();
    setTimeout(() => setMsg(''), 3000);
  }

  function editClient(c) {
    setForm({ nombre: c.nombre || '', empresa: c.empresa || '', rut: c.rut || '', email: '', telefono: '', direccion: '', logo_url: '' });
    setEditId(c.id);
    setShowForm(true);
  }

  function resetForm() {
    setForm({ nombre: '', empresa: '', rut: '', email: '', telefono: '', direccion: '', logo_url: '' });
    setEditId(null);
    setShowForm(false);
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <h1>Clientes</h1>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
              {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
            </button>
          </div>
        </div>
        <div className="page-content">
          {msg && <div className="alert alert-success">{msg}</div>}

          {showForm && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-title" style={{ marginBottom: '1rem' }}>{editId ? 'Editar' : 'Nuevo'} Cliente</div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Empresa</label>
                    <input value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>RUT</label>
                    <input value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Telefono</label>
                    <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Direccion</label>
                    <input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
                  </div>
                  <div className="form-group full">
                    <ImageUpload value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} label="Logo del cliente" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editId ? 'Guardar Cambios' : 'Crear Cliente'}</button>
                </div>
              </form>
            </div>
          )}

          <div className="card">
            {loading ? <p>Cargando...</p> : clientes.length === 0 ? (
              <div className="empty-state"><p>No hay clientes registrados.</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Empresa</th>
                      <th>RUT</th>
                      <th>Cotizado</th>
                      <th>Pagado</th>
                      <th>Pendiente</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientes.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                        <td>{c.empresa || '-'}</td>
                        <td>{c.rut || '-'}</td>
                        <td>{formatCLP(c.total_cotizado)}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCLP(c.total_pagado)}</td>
                        <td style={{ color: c.total_pendiente > 0 ? 'var(--warning)' : 'inherit', fontWeight: c.total_pendiente > 0 ? 600 : 400 }}>
                          {formatCLP(c.total_pendiente)}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-secondary" onClick={() => editClient(c)}>Editar</button>
                        </td>
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
