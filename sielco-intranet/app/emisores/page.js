'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../components/ImageUpload';

export default function Emisores() {
  const [emisores, setEmisores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('emisores').select('*').order('nombre');
    setEmisores(data || []);
    setLoading(false);
  }

  function startEdit(e) {
    setEditing({ ...e });
  }

  async function save() {
    const { error } = await supabase
      .from('emisores')
      .update({
        nombre: editing.nombre,
        razon_social: editing.razon_social,
        rut: editing.rut,
        giro: editing.giro,
        direccion: editing.direccion,
        telefono: editing.telefono,
        email: editing.email,
        web: editing.web,
        logo_url: editing.logo_url,
        color_primario: editing.color_primario,
        color_secundario: editing.color_secundario,
        pie_pagina: editing.pie_pagina,
        prefijo_cotizacion: editing.prefijo_cotizacion,
        datos_bancarios: editing.datos_bancarios,
      })
      .eq('id', editing.id);
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    setMsg('Emisor actualizado');
    setEditing(null);
    load();
    setTimeout(() => setMsg(''), 3000);
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <h1>Emisores</h1>
        </div>
        <div className="page-content">
          {msg && <div className="alert alert-success">{msg}</div>}
          <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Configura los datos de cada ente emisor que usarás en tus cotizaciones (SIELCO, ClauDev, Persona Natural).
            Cada emisor tiene su propio prefijo de numeración y estilo.
          </p>

          {loading ? <p>Cargando...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {emisores.map((e) => (
                <div key={e.id} className="card" style={{ borderTop: `4px solid ${e.color_primario}` }}>
                  <div className="card-header">
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: e.color_primario }}>{e.nombre}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{e.razon_social}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => startEdit(e)}>Editar</button>
                  </div>
                  <div style={{ fontSize: '0.82rem', lineHeight: 2 }}>
                    <div><strong>Prefijo:</strong> {e.prefijo_cotizacion}-2026-XXXX</div>
                    <div><strong>RUT:</strong> {e.rut || '(sin configurar)'}</div>
                    <div><strong>Email:</strong> {e.email}</div>
                    <div><strong>Teléfono:</strong> {e.telefono}</div>
                    {e.logo_url && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <img src={e.logo_url} alt={e.nombre} style={{ maxHeight: 40 }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {editing && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
              <div style={{ background: 'var(--white)', borderRadius: 8, padding: '2rem', maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '1rem' }}>Editar {editing.nombre}</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre comercial</label>
                    <input value={editing.nombre || ''} onChange={(ev) => setEditing({ ...editing, nombre: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Razón social</label>
                    <input value={editing.razon_social || ''} onChange={(ev) => setEditing({ ...editing, razon_social: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>RUT</label>
                    <input value={editing.rut || ''} onChange={(ev) => setEditing({ ...editing, rut: ev.target.value })} placeholder="12.345.678-9" />
                  </div>
                  <div className="form-group">
                    <label>Giro</label>
                    <input value={editing.giro || ''} onChange={(ev) => setEditing({ ...editing, giro: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input value={editing.email || ''} onChange={(ev) => setEditing({ ...editing, email: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input value={editing.telefono || ''} onChange={(ev) => setEditing({ ...editing, telefono: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Web</label>
                    <input value={editing.web || ''} onChange={(ev) => setEditing({ ...editing, web: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Prefijo cotización</label>
                    <input value={editing.prefijo_cotizacion || ''} onChange={(ev) => setEditing({ ...editing, prefijo_cotizacion: ev.target.value })} />
                  </div>
                  <div className="form-group full">
                    <label>Dirección</label>
                    <input value={editing.direccion || ''} onChange={(ev) => setEditing({ ...editing, direccion: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Color primario</label>
                    <input type="color" value={editing.color_primario || '#D84315'} onChange={(ev) => setEditing({ ...editing, color_primario: ev.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Color secundario</label>
                    <input type="color" value={editing.color_secundario || '#1A5276'} onChange={(ev) => setEditing({ ...editing, color_secundario: ev.target.value })} />
                  </div>
                  <div className="form-group full">
                    <ImageUpload value={editing.logo_url || ''} onChange={(url) => setEditing({ ...editing, logo_url: url })} label="Logo del emisor" height={50} />
                  </div>
                  <div className="form-group full">
                    <label>Datos bancarios</label>
                    <textarea value={editing.datos_bancarios || ''} onChange={(ev) => setEditing({ ...editing, datos_bancarios: ev.target.value })} placeholder="Banco: ...&#10;Cuenta corriente: ...&#10;RUT: ..." />
                  </div>
                  <div className="form-group full">
                    <label>Pie de página</label>
                    <input value={editing.pie_pagina || ''} onChange={(ev) => setEditing({ ...editing, pie_pagina: ev.target.value })} />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={save}>Guardar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
