'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { supabase } from '../../../lib/supabase';
import { formatCLP, formatUF, calcularAPU, fetchValorUF } from '../../../lib/utils';

export default function NuevaCotizacion() {
  const router = useRouter();
  const [clientes, setClientes] = useState([]);
  const [emisores, setEmisores] = useState([]);
  const [saving, setSaving] = useState(false);
  const [expandedAPU, setExpandedAPU] = useState(null);
  const [form, setForm] = useState({
    emisor_id: '', cliente_id: '', titulo: '',
    fecha: new Date().toISOString().split('T')[0],
    validez: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    moneda: 'CLP', valor_uf: 0, mostrar_conversion: false,
    modo_presentacion: 'global', tipo_impuesto: 'iva', retencion_porcentaje: 0,
    notas: '', condiciones: 'Precios en pesos chilenos (CLP). IVA incluido. Validez 30 días.',
  });
  const [items, setItems] = useState([nuevoItem()]);

  function nuevoItem() {
    return {
      descripcion: '', unidad: 'gl', cantidad: 1, precio_unitario: 0,
      tiene_apu: false, apu_hh_cantidad: 0, apu_hh_tarifa: 0,
      apu_materiales: 0, apu_equipos: 0, apu_subcontratos: 0, apu_otros: 0,
      apu_gg_porcentaje: 15, apu_utilidad_porcentaje: 10, apu_notas: '',
    };
  }

  useEffect(() => {
    supabase.from('clientes').select('id, nombre, empresa').order('nombre').then(({ data }) => setClientes(data || []));
    supabase.from('emisores').select('*').eq('activo', true).order('nombre').then(({ data }) => {
      setEmisores(data || []);
      if (data && data.length > 0 && !form.emisor_id) {
        const first = data[0];
        setForm((f) => ({
          ...f, emisor_id: first.id,
          tipo_impuesto: first.tipo_impuesto || 'iva',
          retencion_porcentaje: first.retencion_porcentaje || 0,
          condiciones: getCondicionesDefault(first.tipo_impuesto),
        }));
      }
    });
  }, []);

  useEffect(() => {
    if (form.moneda === 'UF' && form.fecha) {
      fetchValorUF(form.fecha).then((valor) => { if (valor) setForm((f) => ({ ...f, valor_uf: valor })); });
    }
  }, [form.moneda, form.fecha]);

  function getCondicionesDefault(tipo) {
    if (tipo === 'iva') return 'Precios en pesos chilenos (CLP). IVA incluido. Validez 30 días.';
    if (tipo === 'honorarios') return 'Precios en pesos chilenos (CLP). Se emite Boleta de Honorarios con retención del 15,25%. Validez 30 días.';
    return 'Precios en pesos chilenos (CLP). Sin impuestos. Validez 30 días.';
  }

  function onEmisorChange(emisorId) {
    const emisor = emisores.find((e) => e.id === emisorId);
    if (!emisor) return;
    setForm({
      ...form, emisor_id: emisorId,
      tipo_impuesto: emisor.tipo_impuesto || 'iva',
      retencion_porcentaje: emisor.retencion_porcentaje || 0,
      condiciones: getCondicionesDefault(emisor.tipo_impuesto),
    });
  }

  function updateItem(idx, field, value) {
    const updated = [...items];
    const numericFields = ['cantidad', 'precio_unitario', 'apu_hh_cantidad', 'apu_hh_tarifa', 'apu_materiales', 'apu_equipos', 'apu_subcontratos', 'apu_otros', 'apu_gg_porcentaje', 'apu_utilidad_porcentaje'];
    updated[idx][field] = numericFields.includes(field) ? Number(value) : value;
    if (updated[idx].tiene_apu) updated[idx].precio_unitario = calcularAPU(updated[idx]).total;
    setItems(updated);
  }

  function toggleAPU(idx) {
    const updated = [...items];
    updated[idx].tiene_apu = !updated[idx].tiene_apu;
    if (updated[idx].tiene_apu) updated[idx].precio_unitario = calcularAPU(updated[idx]).total;
    setItems(updated);
    setExpandedAPU(expandedAPU === idx ? null : idx);
  }

  function addItem() { setItems([...items, nuevoItem()]); }
  function removeItem(idx) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
    if (expandedAPU === idx) setExpandedAPU(null);
  }

  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  let iva = 0, retencion = 0, total = subtotal;
  if (form.tipo_impuesto === 'iva') {
    iva = Math.round(subtotal * 0.19);
    total = subtotal + iva;
  } else if (form.tipo_impuesto === 'honorarios') {
    retencion = Math.round(subtotal * form.retencion_porcentaje / 100);
    total = subtotal + retencion;
  }
  const unidad = form.moneda === 'UF' ? formatUF : formatCLP;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    if (!form.emisor_id) { alert('Selecciona un emisor'); setSaving(false); return; }

    const { data: cot, error } = await supabase.from('cotizaciones').insert({
      emisor_id: form.emisor_id, cliente_id: form.cliente_id || null, titulo: form.titulo,
      fecha: form.fecha, validez: form.validez, moneda: form.moneda,
      valor_uf: form.moneda === 'UF' ? form.valor_uf : null,
      mostrar_conversion: form.mostrar_conversion, modo_presentacion: form.modo_presentacion,
      tipo_impuesto: form.tipo_impuesto, retencion_porcentaje: form.retencion_porcentaje,
      notas: form.notas, condiciones: form.condiciones, numero: '',
      version: 1,
    }).select().single();

    if (error) { alert('Error: ' + error.message); setSaving(false); return; }

    // Set cotizacion_origen_id = id (autoreferencia para v1)
    await supabase.from('cotizaciones').update({ cotizacion_origen_id: cot.id }).eq('id', cot.id);

    const itemsToInsert = items.filter((i) => i.descripcion.trim()).map((i, idx) => ({
      cotizacion_id: cot.id, descripcion: i.descripcion, unidad: i.unidad,
      cantidad: i.cantidad, precio_unitario: i.precio_unitario,
      total_linea: i.cantidad * i.precio_unitario, tiene_apu: i.tiene_apu,
      apu_hh_cantidad: i.apu_hh_cantidad, apu_hh_tarifa: i.apu_hh_tarifa,
      apu_materiales: i.apu_materiales, apu_equipos: i.apu_equipos,
      apu_subcontratos: i.apu_subcontratos, apu_otros: i.apu_otros,
      apu_gg_porcentaje: i.apu_gg_porcentaje, apu_utilidad_porcentaje: i.apu_utilidad_porcentaje,
      apu_notas: i.apu_notas, orden: idx,
    }));
    if (itemsToInsert.length > 0) await supabase.from('cotizacion_items').insert(itemsToInsert);
    router.push(`/cotizaciones/${cot.id}`);
  }

  const emisorActual = emisores.find((e) => e.id === form.emisor_id);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar"><h1>Nueva Cotización</h1></div>
        <div className="page-content">
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: '1rem' }}>Datos generales</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Emisor *</label>
                  <select required value={form.emisor_id} onChange={(e) => onEmisorChange(e.target.value)}>
                    <option value="">Seleccionar</option>
                    {emisores.map((e) => <option key={e.id} value={e.id}>{e.nombre} ({e.tipo_impuesto === 'iva' ? 'IVA' : e.tipo_impuesto === 'honorarios' ? 'Honorarios' : 'Sin impuesto'})</option>)}
                  </select>
                  {emisorActual && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: '0.3rem' }}>
                      {emisorActual.tipo_impuesto === 'iva' && '📄 Emite Factura con IVA 19%'}
                      {emisorActual.tipo_impuesto === 'honorarios' && `📄 Emite Boleta de Honorarios con retención del ${emisorActual.retencion_porcentaje}%`}
                      {emisorActual.tipo_impuesto === 'ninguno' && '📄 Sin impuestos'}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Cliente</label>
                  <select value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                    <option value="">Sin cliente asignado</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.empresa ? `${c.empresa} (${c.nombre})` : c.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label>Título *</label>
                  <input required placeholder="Ej: Desarrollo plataforma e-commerce" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Validez hasta</label>
                  <input type="date" value={form.validez} onChange={(e) => setForm({ ...form, validez: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: '1rem' }}>Moneda, impuestos y presentación</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Moneda</label>
                  <select value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}>
                    <option value="CLP">Pesos Chilenos (CLP)</option>
                    <option value="UF">Unidad de Fomento (UF)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de impuesto</label>
                  <select value={form.tipo_impuesto} onChange={(e) => setForm({ ...form, tipo_impuesto: e.target.value, condiciones: getCondicionesDefault(e.target.value) })}>
                    <option value="iva">IVA 19% (Factura)</option>
                    <option value="honorarios">Boleta de honorarios (con retención)</option>
                    <option value="ninguno">Sin impuestos</option>
                  </select>
                </div>
                {form.tipo_impuesto === 'honorarios' && (
                  <div className="form-group">
                    <label>Retención (%)</label>
                    <input type="number" step="0.01" value={form.retencion_porcentaje} onChange={(e) => setForm({ ...form, retencion_porcentaje: Number(e.target.value) })} />
                    <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>2026: 15,25% · 2027: 16% · 2028: 17%</p>
                  </div>
                )}
                {form.moneda === 'UF' && (
                  <>
                    <div className="form-group">
                      <label>Valor UF al {form.fecha}</label>
                      <input type="number" step="0.01" value={form.valor_uf} onChange={(e) => setForm({ ...form, valor_uf: Number(e.target.value) })} />
                    </div>
                    <div className="form-group full">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.mostrar_conversion} onChange={(e) => setForm({ ...form, mostrar_conversion: e.target.checked })} />
                        <span>Mostrar conversión a CLP en el PDF</span>
                      </label>
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label>Modo de presentación en PDF</label>
                  <select value={form.modo_presentacion} onChange={(e) => setForm({ ...form, modo_presentacion: e.target.value })}>
                    <option value="global">Global (entregables + total)</option>
                    <option value="detallado">Detallado (con APU)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Partidas</div>
                <button type="button" className="btn btn-sm btn-secondary" onClick={addItem}>+ Agregar partida</button>
              </div>
              {items.map((item, idx) => {
                const apu = item.tiene_apu ? calcularAPU(item) : null;
                return (
                  <div key={idx} style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: '1rem', marginBottom: '0.8rem', background: item.tiene_apu ? '#F8FCFF' : 'transparent' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 1fr 1fr 40px 40px', gap: '0.5rem', alignItems: 'center' }}>
                      <input placeholder={`Partida ${idx + 1}`} value={item.descripcion} onChange={(e) => updateItem(idx, 'descripcion', e.target.value)} style={{ border: '1px solid var(--gray-200)', borderRadius: 4, padding: '0.5rem' }} />
                      <input placeholder="un" value={item.unidad} onChange={(e) => updateItem(idx, 'unidad', e.target.value)} style={{ border: '1px solid var(--gray-200)', borderRadius: 4, padding: '0.5rem', textAlign: 'center' }} />
                      <input type="number" min="0" step="0.01" value={item.cantidad} onChange={(e) => updateItem(idx, 'cantidad', e.target.value)} style={{ border: '1px solid var(--gray-200)', borderRadius: 4, padding: '0.5rem', textAlign: 'center' }} />
                      <input type="number" min="0" value={item.precio_unitario} onChange={(e) => updateItem(idx, 'precio_unitario', e.target.value)} disabled={item.tiene_apu} style={{ border: '1px solid var(--gray-200)', borderRadius: 4, padding: '0.5rem', textAlign: 'right', background: item.tiene_apu ? 'var(--gray-100)' : 'var(--white)' }} />
                      <div style={{ textAlign: 'right', fontWeight: 600, padding: '0.5rem' }}>{unidad(item.cantidad * item.precio_unitario)}</div>
                      <button type="button" className="btn-icon" onClick={() => toggleAPU(idx)} style={{ color: item.tiene_apu ? 'var(--flame)' : 'var(--gray-500)' }}>{item.tiene_apu ? '▼' : '▶'}</button>
                      <button type="button" className="btn-icon" onClick={() => removeItem(idx)}>×</button>
                    </div>

                    {(item.tiene_apu || expandedAPU === idx) && (
                      <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--white)', border: '1px dashed var(--tech)', borderRadius: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                          <strong style={{ color: 'var(--tech)', fontSize: '0.85rem' }}>Análisis de Precio Unitario (APU)</strong>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                            <input type="checkbox" checked={item.tiene_apu} onChange={() => toggleAPU(idx)} />
                            <span>Activar APU</span>
                          </label>
                        </div>
                        {item.tiene_apu && (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>HH - Cantidad</label><input type="number" step="0.5" min="0" value={item.apu_hh_cantidad} onChange={(e) => updateItem(idx, 'apu_hh_cantidad', e.target.value)} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>HH - Tarifa</label><input type="number" min="0" value={item.apu_hh_tarifa} onChange={(e) => updateItem(idx, 'apu_hh_tarifa', e.target.value)} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>Costo HH total</label><input disabled value={unidad(item.apu_hh_cantidad * item.apu_hh_tarifa)} style={{ background: 'var(--gray-100)' }} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>Materiales</label><input type="number" min="0" value={item.apu_materiales} onChange={(e) => updateItem(idx, 'apu_materiales', e.target.value)} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>Equipos</label><input type="number" min="0" value={item.apu_equipos} onChange={(e) => updateItem(idx, 'apu_equipos', e.target.value)} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>Subcontratos</label><input type="number" min="0" value={item.apu_subcontratos} onChange={(e) => updateItem(idx, 'apu_subcontratos', e.target.value)} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>Otros</label><input type="number" min="0" value={item.apu_otros} onChange={(e) => updateItem(idx, 'apu_otros', e.target.value)} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>GG (%)</label><input type="number" min="0" step="0.1" value={item.apu_gg_porcentaje} onChange={(e) => updateItem(idx, 'apu_gg_porcentaje', e.target.value)} /></div>
                              <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: '0.72rem' }}>Utilidad (%)</label><input type="number" min="0" step="0.1" value={item.apu_utilidad_porcentaje} onChange={(e) => updateItem(idx, 'apu_utilidad_porcentaje', e.target.value)} /></div>
                            </div>
                            {apu && (
                              <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: 'var(--tech-bg)', borderRadius: 4, fontSize: '0.8rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                  <div><strong>Directo:</strong><br />{unidad(apu.directo)}</div>
                                  <div><strong>+ GG:</strong><br />{unidad(apu.gg)}</div>
                                  <div><strong>+ Utilidad:</strong><br />{unidad(apu.utilidad)}</div>
                                  <div style={{ color: 'var(--flame)', fontWeight: 700 }}><strong>Precio:</strong><br />{unidad(apu.total)}</div>
                                </div>
                              </div>
                            )}
                            <div className="form-group" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
                              <label style={{ fontSize: '0.72rem' }}>Notas</label>
                              <textarea value={item.apu_notas} onChange={(e) => updateItem(idx, 'apu_notas', e.target.value)} style={{ minHeight: 50 }} />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>Subtotal: <strong>{unidad(subtotal)}</strong></div>
                  {form.tipo_impuesto === 'iva' && <div style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>IVA (19%): <strong>{unidad(iva)}</strong></div>}
                  {form.tipo_impuesto === 'honorarios' && retencion > 0 && (
                    <div style={{ color: 'var(--tech)', fontSize: '0.85rem', marginTop: 4 }}>+ Retención ({form.retencion_porcentaje}%): +{unidad(retencion)}</div>
                  )}
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: 4 }}>{form.tipo_impuesto === 'honorarios' ? 'Total bruto' : 'Total'}: {unidad(total)}</div>

                </div>
              </div>
            </div>

            <div className="card">
              <div className="form-group full">
                <label>Notas internas</label>
                <textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
              </div>
              <div className="form-group full">
                <label>Condiciones y términos</label>
                <textarea value={form.condiciones} onChange={(e) => setForm({ ...form, condiciones: e.target.value })} />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear Cotización'}</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
