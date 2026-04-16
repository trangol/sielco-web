'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import { supabase } from '../../lib/supabase';
import { formatCLP } from '../../lib/utils';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [proyectosAlerta, setProyectosAlerta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('vista_dashboard').select('*').single();
    const { data: alertas } = await supabase.from('vista_proyectos_sin_facturar').select('*').eq('facturado', false).not('fecha_entrega', 'is', null).order('dias_sin_facturar', { ascending: false }).limit(5);
    setKpis(data);
    setProyectosAlerta(alertas || []);
    setLoading(false);
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar"><h1>Dashboard</h1></div>
        <div className="page-content">
          {loading ? <p>Cargando...</p> : kpis ? (
            <>
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: 'var(--flame-bg)', color: 'var(--flame)' }}>$</div>
                  <div>
                    <div className="kpi-value">{formatCLP(kpis.total_aprobado)}</div>
                    <div className="kpi-label">Total aprobado</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: '#FFF3E0', color: '#E65100' }}>!</div>
                  <div>
                    <div className="kpi-value">{formatCLP(kpis.cobros_pendientes)}</div>
                    <div className="kpi-label">Cobros pendientes</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: '#FFEBEE', color: '#C62828' }}>!</div>
                  <div>
                    <div className="kpi-value">{formatCLP(kpis.cobros_vencidos)}</div>
                    <div className="kpi-label">Cobros vencidos</div>
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}>$</div>
                  <div>
                    <div className="kpi-value">{formatCLP(kpis.cobrado_mes_actual)}</div>
                    <div className="kpi-label">Cobrado este mes</div>
                  </div>
                </div>
              </div>

              {kpis.alertas_facturacion > 0 && (
                <div className="card" style={{ background: '#FFEBEE', border: '1px solid #E74C3C', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>⚠</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1rem' }}>
                        {kpis.alertas_facturacion} proyecto{kpis.alertas_facturacion > 1 ? 's' : ''} entregado{kpis.alertas_facturacion > 1 ? 's' : ''} hace más de 30 días sin facturar
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)', marginTop: '0.3rem' }}>
                        Revisa tus proyectos pendientes de facturación
                      </div>
                    </div>
                    <Link href="/proyectos" className="btn btn-sm btn-danger">Ver proyectos</Link>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="card">
                  <div className="card-title">Cotizaciones</div>
                  <table>
                    <tbody>
                      <tr><td>Borradores</td><td style={{ fontWeight: 600 }}>{kpis.cotizaciones_borrador}</td></tr>
                      <tr><td>Enviadas</td><td style={{ fontWeight: 600 }}>{kpis.cotizaciones_enviadas}</td></tr>
                      <tr><td>Aprobadas</td><td style={{ fontWeight: 600 }}>{kpis.cotizaciones_aprobadas}</td></tr>
                      <tr><td>Pendiente aprobación</td><td style={{ fontWeight: 600 }}>{formatCLP(kpis.total_pendiente_aprobacion)}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card">
                  <div className="card-title">Proyectos</div>
                  <table>
                    <tbody>
                      <tr><td>Activos</td><td style={{ fontWeight: 600 }}>{kpis.proyectos_activos}</td></tr>
                      <tr><td>Presupuesto total</td><td style={{ fontWeight: 600 }}>{formatCLP(kpis.presupuesto_activos)}</td></tr>
                      <tr><td>Costo real acumulado</td><td style={{ fontWeight: 600 }}>{formatCLP(kpis.costo_real_activos)}</td></tr>
                      <tr><td>Entregados sin facturar</td>
                        <td style={{ fontWeight: 600, color: kpis.proyectos_entregados_sin_facturar > 0 ? 'var(--warning)' : 'inherit' }}>
                          {kpis.proyectos_entregados_sin_facturar}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {proyectosAlerta.length > 0 && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: '1rem' }}>Proyectos entregados pendientes de facturación</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Proyecto</th><th>Cliente</th><th>Entregado</th><th>Días transcurridos</th><th>Presupuesto</th></tr>
                      </thead>
                      <tbody>
                        {proyectosAlerta.map((p) => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                            <td>{p.cliente_empresa || p.cliente_nombre || '-'}</td>
                            <td>{new Date(p.fecha_entrega + 'T12:00:00').toLocaleDateString('es-CL')}</td>
                            <td>
                              <span style={{ fontWeight: 700, color: p.alerta_facturacion ? 'var(--danger)' : 'var(--warning)' }}>
                                {p.dias_sin_facturar} días
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{formatCLP(p.presupuesto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state"><p>No se pudo cargar el dashboard.</p></div>
          )}
        </div>
      </main>
    </div>
  );
}
