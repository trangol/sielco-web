'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { formatMoney, formatDate, estadoColor } from '../../lib/utils';

export default function Cotizaciones() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [filtro]);

  async function load() {
    setLoading(true);
    let query = supabase
      .from('cotizaciones')
      .select('*, clientes(nombre, empresa), emisores(nombre, color_primario)')
      .order('created_at', { ascending: false });
    if (filtro !== 'todas') query = query.eq('estado', filtro);
    const { data } = await query;
    setCotizaciones(data || []);
    setLoading(false);
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <h1>Cotizaciones</h1>
          <div className="topbar-actions">
            <Link href="/cotizaciones/nueva" className="btn btn-primary">+ Nueva Cotización</Link>
          </div>
        </div>
        <div className="page-content">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['todas', 'borrador', 'enviada', 'aprobada', 'rechazada'].map((e) => (
              <button key={e} className={`btn btn-sm ${filtro === e ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltro(e)}>
                {e === 'todas' ? 'Todas' : e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>

          <div className="card">
            {loading ? <p>Cargando...</p> : cotizaciones.length === 0 ? (
              <div className="empty-state">
                <p>No hay cotizaciones{filtro !== 'todas' ? ` con estado "${filtro}"` : ''}.</p>
                <Link href="/cotizaciones/nueva" className="btn btn-primary">Crear primera cotización</Link>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Emisor</th>
                      <th>Cliente</th>
                      <th>Título</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cotizaciones.map((c) => {
                      const ec = estadoColor(c.estado);
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600, color: c.emisores?.color_primario || 'var(--tech)' }}>{c.numero}</td>
                          <td>
                            <span className="badge" style={{ background: c.emisores?.color_primario + '22', color: c.emisores?.color_primario }}>
                              {c.emisores?.nombre || '-'}
                            </span>
                          </td>
                          <td>{c.clientes?.empresa || c.clientes?.nombre || '-'}</td>
                          <td>{c.titulo}</td>
                          <td>{formatDate(c.fecha)}</td>
                          <td style={{ fontWeight: 600 }}>{formatMoney(c.total, c.moneda)}</td>
                          <td><span className="badge" style={{ background: ec.bg, color: ec.color }}>{c.estado}</span></td>
                          <td>
                            <Link href={`/cotizaciones/${c.id}`} className="btn btn-sm btn-secondary">Ver</Link>
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
