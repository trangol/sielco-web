export function formatCLP(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatUF(amount) {
  return `UF ${new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0)}`;
}

export function formatMoney(amount, moneda) {
  if (moneda === 'UF') return formatUF(amount);
  return formatCLP(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function daysBetween(from, to = null) {
  if (!from) return 0;
  const d1 = new Date(from + 'T12:00:00');
  const d2 = to ? new Date(to + 'T12:00:00') : new Date();
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function estadoColor(estado) {
  const colors = {
    borrador: { bg: '#f0f0f0', color: '#555' },
    enviada: { bg: '#fff3e0', color: '#e65100' },
    aprobada: { bg: '#e8f5e9', color: '#2e7d32' },
    rechazada: { bg: '#ffebee', color: '#c62828' },
    vencida: { bg: '#fce4ec', color: '#880e4f' },
    activo: { bg: '#e3f2fd', color: '#1565c0' },
    pausado: { bg: '#fff3e0', color: '#ef6c00' },
    completado: { bg: '#e8f5e9', color: '#2e7d32' },
    cancelado: { bg: '#ffebee', color: '#c62828' },
    pendiente: { bg: '#fff8e1', color: '#f57f17' },
    pagado: { bg: '#e8f5e9', color: '#2e7d32' },
    vencido: { bg: '#ffebee', color: '#c62828' },
    anulado: { bg: '#f5f5f5', color: '#9e9e9e' },
  };
  return colors[estado] || { bg: '#f0f0f0', color: '#555' };
}

// ═══════════════════════════════════════════
// VALOR UF - Integración con mindicador.cl
// ═══════════════════════════════════════════
export async function fetchValorUF(fecha) {
  try {
    const d = new Date(fecha + 'T12:00:00');
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const res = await fetch(`https://mindicador.cl/api/uf/${dia}-${mes}-${anio}`);
    const data = await res.json();
    if (data.serie && data.serie.length > 0) {
      return data.serie[0].valor;
    }
    return null;
  } catch (err) {
    console.error('Error obteniendo UF:', err);
    return null;
  }
}

// ═══════════════════════════════════════════
// APU - Cálculo de Análisis de Precio Unitario
// ═══════════════════════════════════════════
export function calcularAPU(item) {
  const directo =
    (Number(item.apu_hh_cantidad) || 0) * (Number(item.apu_hh_tarifa) || 0) +
    (Number(item.apu_materiales) || 0) +
    (Number(item.apu_equipos) || 0) +
    (Number(item.apu_subcontratos) || 0) +
    (Number(item.apu_otros) || 0);

  const conGG = directo * (1 + (Number(item.apu_gg_porcentaje) || 0) / 100);
  const total = conGG * (1 + (Number(item.apu_utilidad_porcentaje) || 0) / 100);

  return {
    directo: Math.round(directo),
    gg: Math.round(conGG - directo),
    utilidad: Math.round(total - conGG),
    total: Math.round(total),
  };
}
