'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../../lib/supabase';
import { formatCLP, formatMoney, formatDate, estadoColor, calcularAPU } from '../../../lib/utils';

export default function CotizacionDetalle({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [cot, setCot] = useState(null);
  const [items, setItems] = useState([]);
  const [versiones, setVersiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [motivoVersion, setMotivoVersion] = useState('');

  useEffect(() => { load(); }, [id]);

  async function load() {
    const { data } = await supabase
      .from('cotizaciones')
      .select('*, clientes(nombre, empresa, email, telefono, rut, logo_url, direccion), emisores(*)')
      .eq('id', id)
      .single();

    const { data: itemsData } = await supabase
      .from('cotizacion_items')
      .select('*')
      .eq('cotizacion_id', id)
      .order('orden');

    setCot(data);
    setItems(itemsData || []);

    // Cargar versiones
    if (data?.cotizacion_origen_id) {
      const { data: vers } = await supabase
        .from('vista_versiones')
        .select('*')
        .eq('cotizacion_origen_id', data.cotizacion_origen_id)
        .order('version', { ascending: false });
      setVersiones(vers || []);
    }

    setLoading(false);
  }

  async function cambiarEstado(nuevoEstado) {
    await supabase.from('cotizaciones').update({ estado: nuevoEstado, updated_at: new Date().toISOString() }).eq('id', id);
    setMsg(`Estado cambiado a "${nuevoEstado}"`);
    load();
    setTimeout(() => setMsg(''), 3000);
  }

  async function editarDirecto() {
    router.push(`/cotizaciones/${id}/editar`);
  }

  async function crearVersion() {
    // Si es borrador, simplemente edita
    if (cot.estado === 'borrador') {
      router.push(`/cotizaciones/${id}/editar`);
      return;
    }
    // Si no, abre modal para motivo
    setShowVersionModal(true);
  }

  async function confirmarVersion() {
    const { data, error } = await supabase.rpc('crear_version_cotizacion', {
      p_cotizacion_id: id,
      p_motivo: motivoVersion || null,
    });
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    setShowVersionModal(false);
    router.push(`/cotizaciones/${data}/editar`);
  }

  async function eliminar() {
    if (!confirm('¿Eliminar esta cotización?')) return;
    await supabase.from('cotizaciones').delete().eq('id', id);
    router.push('/cotizaciones');
  }

  if (loading) return <div className="app-layout"><Sidebar /><main className="main-content"><div className="topbar"><h1>Cargando...</h1></div></main></div>;
  if (!cot) return <div className="app-layout"><Sidebar /><main className="main-content"><div className="topbar"><h1>No encontrada</h1></div></main></div>;

  const ec = estadoColor(cot.estado);
  const fmt = (v) => formatMoney(v, cot.moneda);
  const numeroConVersion = cot.version > 1 ? `${cot.numero} v${cot.version}` : cot.numero;
  const puedeEditar = cot.estado === 'borrador';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <h1>
            <span style={{ color: cot.emisores?.color_primario }}>{numeroConVersion}</span>
            {cot.version > 1 && <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem', padding: '0.2rem 0.5rem', background: 'var(--flame-bg)', color: 'var(--flame)', borderRadius: 4, fontWeight: 600 }}>v{cot.version}</span>}
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--gray-500)', marginLeft: '0.8rem' }}>
              {cot.emisores?.nombre} · {cot.moneda} · {cot.modo_presentacion === 'detallado' ? 'Detallado' : 'Global'}
            </span>
          </h1>
          <div className="topbar-actions">
            <Link href={`/cotizaciones/${id}/pdf`} target="_blank" className="btn btn-sm btn-secondary">📄 Ver PDF</Link>
            {puedeEditar ? (
              <button className="btn btn-sm btn-secondary" onClick={editarDirecto}>✏ Editar</button>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={crearVersion}>
                + Nueva versión (v{(versiones[0]?.version || cot.version) + 1})
              </button>
            )}
            {cot.estado === 'borrador' && <button className="btn btn-sm btn-primary" onClick={() => cambiarEstado('enviada')}>Marcar como enviada</button>}
            {cot.estado === 'enviada' && (
              <>
                <button className="btn btn-sm btn-success" onClick={() => cambiarEstado('aprobada')}>Aprobar</button>
                <button className="btn btn-sm btn-danger" onClick={() => cambiarEstado('rechazada')}>Rechazar</button>
              </>
            )}
            <button className="btn btn-sm btn-secondary" onClick={eliminar}>Eliminar</button>
          </div>
        </div>
        <div className="page-content">
          {msg && <div className="alert alert-success">{msg}</div>}

          {cot.estado === 'reemplazada' && (
            <div className="alert alert-error" style={{ background: '#FFF3E0', color: '#E65100' }}>
              ⓘ Esta cotización fue reemplazada por una versión más reciente.
              {versiones[0] && versiones[0].id !== id && (
                <Link href={`/cotizaciones/${versiones[0].id}`} style={{ marginLeft: '0.5rem', textDecoration: 'underline', fontWeight: 600 }}>
                  Ver versión actual (v{versiones[0].version})
                </Link>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="card-title">{cot.titulo}</div>
                    {cot.motivo_version && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                        Motivo de versión: {cot.motivo_version}
                      </div>
                    )}
                  </div>
                  <span className="badge" style={{ background: ec.bg, color: ec.color }}>{cot.estado}</span>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th style={{ textAlign: 'center', width: 60 }}>Un.</th>
                        <th style={{ textAlign: 'center', width: 60 }}>Cant.</th>
                        <th style={{ textAlign: 'right', width: 120 }}>P. Unit.</th>
                        <th style={{ textAlign: 'right', width: 120 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {item.descripcion}
                            {item.tiene_apu && <span style={{ fontSize: '0.68rem', color: 'var(--tech)', marginLeft: '0.5rem' }}>(APU)</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>{item.unidad}</td>
                          <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                          <td style={{ textAlign: 'right' }}>{fmt(item.precio_unitario)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(item.total_linea)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Subtotal: <strong>{fmt(cot.subtotal)}</strong></div>
                    {cot.tipo_impuesto === 'iva' && <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>IVA (19%): <strong>{fmt(cot.iva)}</strong></div>}
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 4 }}>Total: {fmt(cot.total)}</div>
                    {cot.tipo_impuesto === 'honorarios' && cot.retencion_monto > 0 && (
                      <>
                        <div style={{ fontSize: '0.85rem', color: 'var(--tech)' }}>+ Retención ({cot.retencion_porcentaje}%): +{fmt(cot.retencion_monto)}</div>

                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: '0.8rem' }}>Datos</div>
                <div style={{ fontSize: '0.85rem', lineHeight: 2 }}>
                  <div><strong>Fecha:</strong> {formatDate(cot.fecha)}</div>
                  <div><strong>Validez:</strong> {formatDate(cot.validez)}</div>
                  <div><strong>Emisor:</strong> {cot.emisores?.nombre}</div>
                </div>
              </div>

              {cot.clientes && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: '0.8rem' }}>Cliente</div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 2 }}>
                    <div><strong>{cot.clientes.empresa || cot.clientes.nombre}</strong></div>
                    {cot.clientes.rut && <div>RUT: {cot.clientes.rut}</div>}
                    {cot.clientes.email && <div>{cot.clientes.email}</div>}
                    {cot.clientes.telefono && <div>{cot.clientes.telefono}</div>}
                  </div>
                </div>
              )}

              {/* ═══ HISTORIAL DE VERSIONES ═══ */}
              {versiones.length > 1 && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: '0.8rem' }}>Historial de versiones</div>
                  <div style={{ fontSize: '0.82rem' }}>
                    {versiones.map((v) => (
                      <Link
                        key={v.id}
                        href={`/cotizaciones/${v.id}`}
                        style={{
                          display: 'block',
                          padding: '0.6rem',
                          marginBottom: '0.4rem',
                          borderRadius: 6,
                          background: v.id === id ? 'var(--flame-bg)' : 'var(--gray-50)',
                          border: v.id === id ? '1px solid var(--flame)' : '1px solid transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                          <strong style={{ color: v.id === id ? 'var(--flame)' : 'var(--dark)' }}>
                            v{v.version} {v.es_ultima && <span style={{ fontSize: '0.65rem', color: 'var(--success)', marginLeft: '0.3rem' }}>● actual</span>}
                          </strong>
                          <span className="badge" style={{ background: estadoColor(v.estado).bg, color: estadoColor(v.estado).color, fontSize: '0.7rem' }}>{v.estado}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>
                          {formatDate(v.fecha)} · {formatMoney(v.total, v.moneda)}
                        </div>
                        {v.motivo_version && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                            {v.motivo_version}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {cot.notas && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: '0.5rem' }}>Notas internas</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{cot.notas}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal crear versión */}
        {showVersionModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
            <div style={{ background: 'var(--white)', borderRadius: 8, padding: '2rem', maxWidth: 500, width: '100%' }}>
              <h2 style={{ marginBottom: '0.5rem' }}>Crear nueva versión</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                Se creará la versión <strong>v{cot.version + 1}</strong> con los datos actuales. La versión actual pasará a estado "reemplazada".
              </p>
              <div className="form-group">
                <label>Motivo de la nueva versión (opcional)</label>
                <textarea
                  value={motivoVersion}
                  onChange={(e) => setMotivoVersion(e.target.value)}
                  placeholder="Ej: Ajustes solicitados por el cliente el 15-04-2026"
                  style={{ minHeight: 80 }}
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={() => { setShowVersionModal(false); setMotivoVersion(''); }}>Cancelar</button>
                <button className="btn btn-primary" onClick={confirmarVersion}>Crear v{cot.version + 1}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
