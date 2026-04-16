'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const links = [
    { href: '/dashboard', label: 'Dashboard', section: 'General' },
    { href: '/cotizaciones', label: 'Cotizaciones', section: 'Ventas' },
    { href: '/clientes', label: 'Clientes', section: 'Ventas' },
    { href: '/proyectos', label: 'Proyectos', section: 'Gestión' },
    { href: '/gastos', label: 'Gastos', section: 'Gestión' },
    { href: '/pagos', label: 'Cobros y Pagos', section: 'Finanzas' },
    { href: '/emisores', label: 'Emisores', section: 'Configuración' },
  ];

  let lastSection = '';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div>
          <span className="brand-s">S</span>
          <span className="brand-name">IELCO</span>
          <span className="brand-tag">Intranet</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => {
          const showSection = link.section !== lastSection;
          lastSection = link.section;
          return (
            <div key={link.href}>
              {showSection && <div className="sidebar-section">{link.section}</div>}
              <Link
                href={link.href}
                className={`sidebar-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: 'currentColor', opacity: 0.5 }} />
                {link.label}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
              {user.email}
            </span>
            <button
              onClick={signOut}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', padding: '0.25rem 0.5rem', borderRadius: 4, cursor: 'pointer' }}
            >
              Salir
            </button>
          </div>
        )}
        <div>SIELCO Sistemas &amp; Soluciones</div>
      </div>
    </aside>
  );
}
