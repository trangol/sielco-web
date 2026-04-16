'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '../../../../lib/supabase';
import { formatCLP, formatMoney, formatDate } from '../../../../lib/utils';

export default function CotizacionPDF({ params }) {
  const { id } = use(params);
  const [cot, setCot] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const { data } = await supabase.from('cotizaciones').select('*, clientes(*), emisores(*)').eq('id', id).single();
    const { data: itemsData } = await supabase.from('cotizacion_items').select('*').eq('cotizacion_id', id).order('orden');
    setCot(data);
    setItems(itemsData || []);
    setLoading(false);
  }

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>;
  if (!cot) return <div style={{ padding: '2rem' }}>No encontrada</div>;

  const e = cot.emisores || {};
  const c = cot.clientes || {};
  const esDetallado = cot.modo_presentacion === 'detallado';
  const fmt = (v) => formatMoney(v, cot.moneda);
  const tipo = cot.tipo_impuesto || 'iva';
  const totalEntregables = items.reduce((s, i) => s + Number(i.cantidad || 0), 0);
  const numeroConVersion = (cot.version || 1) > 1 ? cot.numero + ' v' + cot.version : cot.numero;

  return (
    <>
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { margin: 0; } @page { size: A4; margin: 15mm 12mm; } }
        body { font-family: 'DM Sans', sans-serif; margin: 0; background: #f0f0f0; }
        .pdf-container { max-width: 210mm; margin: 2rem auto; background: white; padding: 20mm 15mm; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        @media print { .pdf-container { margin: 0; box-shadow: none; padding: 0; max-width: none; } }
      `}</style>

      <div className="no-print" style={{ position: 'sticky', top: 0, background: '#fff', padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', gap: '1rem', justifyContent: 'center', zIndex: 10 }}>
        <button onClick={() => window.print()} style={{ background: e.color_primario, color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Imprimir / Guardar PDF</button>
        <button onClick={() => window.close()} style={{ background: '#eee', color: '#333', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Cerrar</button>
      </div>

      <div className="pdf-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '3px solid ' + e.color_primario, marginBottom: '1.5rem' }}>
          <div>
            {e.logo_url ? <img src={e.logo_url} alt={e.nombre} style={{ maxHeight: 70, marginBottom: '0.5rem' }} /> : <div style={{ fontSize: '1.8rem', fontWeight: 700, color: e.color_primario, marginBottom: '0.3rem' }}>{e.nombre}</div>}
            <div style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.5 }}>
              {e.razon_social && <div>{e.razon_social}</div>}
              {e.rut && <div>RUT: {e.rut}</div>}
              {e.giro && <div style={{ fontStyle: 'italic' }}>{e.giro}</div>}
              {e.direccion && <div>{e.direccion}</div>}
              <div>{e.telefono} &middot; {e.email}</div>
              {e.web && <div>{e.web}</div>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cotización</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: e.color_primario, marginTop: '0.2rem' }}>{numeroConVersion}</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.3rem' }}>
              {'Fecha emisión: '}<strong>{formatDate(cot.fecha)}</strong><br />
              {'Válida hasta: '}<strong>{formatDate(cot.validez)}</strong><br />
              {'Moneda: '}<strong>{cot.moneda}</strong>
              {cot.moneda === 'UF' && <><br />{'Valor UF: '}<strong>{formatCLP(cot.valor_uf)}</strong></>}
            </div>
            <div style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', background: tipo === 'iva' ? '#FFF3E0' : tipo === 'honorarios' ? '#E3F2FD' : '#F5F5F5', color: tipo === 'iva' ? '#E65100' : tipo === 'honorarios' ? '#1565C0' : '#555', fontSize: '0.7rem', borderRadius: 4, fontWeight: 600 }}>
              {tipo === 'iva' ? 'Se emite factura' : tipo === 'honorarios' ? 'Boleta de honorarios' : 'Documento interno'}
            </div>
          </div>
        </div>

        {c && c.nombre && (
          <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: 6, marginBottom: '1.5rem', borderLeft: '4px solid ' + e.color_secundario }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cliente</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#222', marginTop: '0.2rem' }}>{c.empresa || c.nombre}</div>
                <div style={{ fontSize: '0.78rem', color: '#555', marginTop: '0.3rem', lineHeight: 1.6 }}>
                  {c.empresa && c.nombre && <div>Atn: {c.nombre}</div>}
                  {c.rut && <div>RUT: {c.rut}</div>}
                  {c.direccion && <div>{c.direccion}</div>}
                  {c.email && <div>{c.email}</div>}
                  {c.telefono && <div>{c.telefono}</div>}
                </div>
              </div>
              {c.logo_url && <img src={c.logo_url} alt={c.empresa || c.nombre} style={{ maxHeight: 50 }} />}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Proyecto</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#222', marginTop: '0.2rem' }}>{cot.titulo}</div>
        </div>

        {esDetallado ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1rem' }}>
            <thead>
              <tr style={{ background: e.color_primario, color: '#fff' }}>
                <th style={{ textAlign: 'left', padding: '0.6rem 0.5rem', width: '5%' }}>#</th>
                <th style={{ textAlign: 'left', padding: '0.6rem 0.5rem' }}>Descripción</th>
                <th style={{ textAlign: 'center', padding: '0.6rem 0.5rem', width: '8%' }}>Un.</th>
                <th style={{ textAlign: 'center', padding: '0.6rem 0.5rem', width: '8%' }}>Cant.</th>
                <th style={{ textAlign: 'right', padding: '0.6rem 0.5rem', width: '18%' }}>P. Unitario</th>
                <th style={{ textAlign: 'right', padding: '0.6rem 0.5rem', width: '18%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.6rem 0.5rem', color: '#888' }}>{idx + 1}</td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>{item.descripcion}</td>
                  <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{item.unidad}</td>
                  <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>{item.cantidad}</td>
                  <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{fmt(item.precio_unitario)}</td>
                  <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{fmt(item.total_linea)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #333' }}>
            <thead>
              <tr style={{ background: '#D9D9D9', color: '#222' }}>
                <th colSpan="4" style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 700, fontSize: '0.9rem', border: '1px solid #333' }}>PRESUPUESTO</th>
              </tr>
              <tr style={{ background: '#F2F2F2' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0.8rem', fontWeight: 600, border: '1px solid #333' }}>Concepto</th>
                <th style={{ textAlign: 'center', padding: '0.5rem 0.8rem', fontWeight: 600, border: '1px solid #333', width: '18%' }}>Condición</th>
                <th style={{ textAlign: 'center', padding: '0.5rem 0.8rem', fontWeight: 600, border: '1px solid #333', width: '12%' }}>Cantidad</th>
                <th style={{ textAlign: 'center', padding: '0.5rem 0.8rem', fontWeight: 600, border: '1px solid #333', width: '18%' }}>{'Total (' + cot.moneda + ')'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '0.5rem 0.8rem', border: '1px solid #333' }}>{item.descripcion}</td>
                  <td style={{ padding: '0.5rem 0.8rem', border: '1px solid #333', textAlign: 'center' }}>{(cot.version || 1) === 1 ? 'Original' : 'Revisión ' + ((cot.version || 1) - 1)}</td>
                  <td style={{ padding: '0.5rem 0.8rem', border: '1px solid #333', textAlign: 'center' }}>{item.cantidad}</td>
                  <td style={{ padding: '0.5rem 0.8rem', border: '1px solid #333', textAlign: 'center' }}></td>
                </tr>
              ))}
              <tr style={{ background: '#F9F9F9' }}>
                <td style={{ padding: '0.6rem 0.8rem', border: '1px solid #333', textAlign: 'center', fontWeight: 700 }}>TOTAL</td>
                <td style={{ padding: '0.6rem 0.8rem', border: '1px solid #333', textAlign: 'center' }}>(Entregables)</td>
                <td style={{ padding: '0.6rem 0.8rem', border: '1px solid #333', textAlign: 'center', fontWeight: 700 }}>{totalEntregables}</td>
                <td style={{ padding: '0.6rem 0.8rem', border: '1px solid #333', textAlign: 'center', fontWeight: 700 }}>{cot.moneda === 'UF' ? new Intl.NumberFormat('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(cot.subtotal) : new Intl.NumberFormat('es-CL').format(cot.subtotal)}</td>
              </tr>
            </tbody>
          </table>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <table style={{ minWidth: 300, fontSize: '0.85rem' }}>
            <tbody>
              {!esDetallado && tipo !== 'ninguno' && (
                <tr><td style={{ padding: '0.3rem 0.8rem', textAlign: 'right', fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }} colSpan="2">+ Impuestos</td></tr>
              )}
              <tr>
                <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', color: '#555' }}>{tipo === 'honorarios' ? 'Neto declarado:' : 'Subtotal:'}</td>
                <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', fontWeight: 600 }}>{fmt(cot.subtotal)}</td>
              </tr>
              {tipo === 'iva' && (
                <tr>
                  <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', color: '#555' }}>IVA (19%):</td>
                  <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', fontWeight: 600 }}>+{fmt(cot.iva)}</td>
                </tr>
              )}
              {tipo === 'honorarios' && cot.retencion_monto > 0 && (
                <tr>
                  <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', color: '#1565C0', fontSize: '0.82rem' }}>{'+ Retención (' + cot.retencion_porcentaje + '%):'}</td>
                  <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', color: '#1565C0', fontWeight: 600, fontSize: '0.82rem' }}>+{fmt(cot.retencion_monto)}</td>
                </tr>
              )}
              <tr style={{ background: e.color_primario, color: '#fff' }}>
                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>{tipo === 'honorarios' ? 'TOTAL BRUTO:' : 'TOTAL:'}</td>
                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>{fmt(cot.total)}</td>
              </tr>

              {cot.moneda === 'UF' && cot.mostrar_conversion && cot.valor_uf > 0 && (
                <tr>
                  <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', fontSize: '0.75rem', color: '#888' }}>Equivalente en CLP:</td>
                  <td style={{ padding: '0.4rem 0.8rem', textAlign: 'right', fontSize: '0.78rem', color: '#555', fontWeight: 600 }}>{formatCLP(Math.round(cot.total * cot.valor_uf))}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {cot.condiciones && (
          <div style={{ background: '#fafafa', padding: '1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.78rem', color: '#555', lineHeight: 1.6 }}>
            <strong style={{ color: e.color_secundario }}>Condiciones y términos:</strong>
            <div style={{ marginTop: '0.3rem', whiteSpace: 'pre-wrap' }}>{cot.condiciones}</div>
          </div>
        )}
        {e.datos_bancarios && (
          <div style={{ background: '#fafafa', padding: '1rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.78rem', color: '#555' }}>
            <strong style={{ color: e.color_secundario }}>Datos de pago:</strong>
            <div style={{ marginTop: '0.3rem', whiteSpace: 'pre-wrap' }}>{e.datos_bancarios}</div>
          </div>
        )}
        <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '2px solid ' + e.color_primario, textAlign: 'center', fontSize: '0.72rem', color: '#888' }}>
          {e.pie_pagina || (e.nombre + ' · ' + e.email + ' · ' + e.telefono)}
        </div>
      </div>
    </>
  );
}
