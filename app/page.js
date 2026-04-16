'use client';
import { useState } from 'react';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* ═══ NAVBAR ═══ */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="nav-logo">
            <img src="/logo-sielco.png" alt="SIELCO" />
          </a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            <span /><span /><span />
          </button>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="#proyectos" onClick={() => setMenuOpen(false)}>Proyectos</a>
            <a href="#nosotros" onClick={() => setMenuOpen(false)}>Nosotros</a>
            <a href="#contacto" onClick={() => setMenuOpen(false)} className="nav-cta">Contacto</a>
            <a href="https://intranet.sielco.cl" className="nav-cta" style={{ background: '#004C99' }}>Intranet</a>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">Desde 2015 en Chile</div>
            <h1>
              Protección contra incendio<br />
              <span className="accent">& desarrollo tecnológico</span>
            </h1>
            <p className="hero-sub">
              Diseñamos, instalamos y mantenemos sistemas de protección contra incendio 
              bajo normativa NFPA. Desarrollamos soluciones de software a la medida de su negocio.
            </p>
            <div className="hero-buttons">
              <a href="#contacto" className="btn-primary">
                Solicitar Cotización
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#servicios" className="btn-outline">Nuestros Servicios</a>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-num">10+</div>
                <div className="stat-label">Años de experiencia</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">NFPA</div>
                <div className="stat-label">Normativa internacional</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">100%</div>
                <div className="stat-label">Soluciones a medida</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-logo-wrap">
              <img src="/logo-sielco.png" alt="SIELCO Logo" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section id="servicios" className="section services">
        <div className="container">
          <div className="section-header animate-up">
            <div className="section-tag">Líneas de Negocio</div>
            <h2 className="section-title">Dos especialidades, una sola misión</h2>
            <p className="section-desc">
              Combinamos la ingeniería en protección contra incendio con el desarrollo 
              de soluciones tecnológicas para ofrecer un servicio integral.
            </p>
          </div>
          <div className="services-grid">
            {/* FIRE */}
            <div className="service-card fire animate-left delay-2">
              <div className="service-icon fire-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 12c2-4 4-6 4-9-4 1-6 5-6 9s2 7 2 9c0-2 2-5 4-7s4-4 4-7c-2 1-4 3-4 5"/></svg>
              </div>
              <h3>Protección Contra Incendio</h3>
              <p>
                Diseño, suministro, instalación y mantenimiento de sistemas de extinción 
                y detección bajo normativa NFPA. Protegemos sus activos con soluciones certificadas.
              </p>
              <ul className="service-list">
                <li>Sistemas de rociadores automáticos (NFPA 13)</li>
                <li>Detección y alarma direccionable (NFPA 72)</li>
                <li>Sistemas de extinción especial (CO₂, FM-200, Novec 1230)</li>
                <li>Cálculo hidráulico y memorias de cálculo</li>
                <li>Inspección, pruebas y mantenimiento (NFPA 25)</li>
                <li>Programación de paneles de detección Edwards</li>
                <li>Planos de ingeniería y documentación As-Built</li>
              </ul>
            </div>
            {/* TECH */}
            <div className="service-card tech animate-right delay-3">
              <div className="service-icon tech-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>
              </div>
              <h3>Desarrollo de Aplicaciones</h3>
              <p>
                Creamos plataformas web, aplicaciones móviles y soluciones digitales 
                a medida, utilizando tecnologías modernas y metodologías ágiles.
              </p>
              <ul className="service-list">
                <li>Aplicaciones web (React, Next.js, TypeScript)</li>
                <li>Plataformas e-commerce y marketplaces</li>
                <li>Sistemas de gestión y dashboards</li>
                <li>Integración con Firebase, APIs y servicios cloud</li>
                <li>Diseño UI/UX responsivo y accesible</li>
                <li>Despliegue en Vercel, AWS y plataformas cloud</li>
                <li>Mantenimiento y soporte continuo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PROJECTS ═══ */}
      <section id="proyectos" className="section">
        <div className="container">
          <div className="section-header animate-up">
            <div className="section-tag">Proyectos Destacados</div>
            <h2 className="section-title">Experiencia que respalda</h2>
            <p className="section-desc">
              Una selección de proyectos que demuestran nuestra capacidad en ambas líneas de negocio.
            </p>
          </div>
          <div className="projects-grid">
            <div className="project-card fire-project animate-up delay-1">
              <div className="project-content">
                <div className="project-tag">Protección contra incendio</div>
                <h3>Local Claro — Mall Florida Center</h3>
                <p>Sistema completo de extinción y detección bajo NFPA 13/72.</p>
              </div>
            </div>
            <div className="project-card fire-project animate-up delay-2">
              <div className="project-content">
                <div className="project-tag">Protección contra incendio</div>
                <h3>Sistemas de Extinción Especial</h3>
                <p>Diseño y cálculo hidráulico para sistemas FM-200, Novec 1230 e Inergen en salas técnicas.</p>
              </div>
            </div>
            <div className="project-card tech-project animate-up delay-3">
              <div className="project-content">
                <div className="project-tag">Desarrollo</div>
                <h3>Ya no lo uso</h3>
                <p>Marketplace de segunda mano para la Región Metropolitana. Next.js, Firebase, Cloudinary.  https://ya-no-lo-uso.vercel.app/</p>
              </div>
            </div>
            <div className="project-card fire-project animate-up delay-4">
              <div className="project-content">
                <div className="project-tag">Protección contra incendio</div>
                <h3>Inspección y Mantenimiento</h3>
                <p>Programas de inspección, pruebas y mantenimiento según NFPA 25.</p>
              </div>
            </div>
            <div className="project-card tech-project animate-up delay-5">
              <div className="project-content">
                <div className="project-tag">Desarrollo</div>
                <h3>Soluciones de Control a Medida</h3>
                <p>Sistemas electrónicos de control, HMI y automatización para procesos industriales.</p>
              </div>
            </div>
            <div className="project-card fire-project animate-up delay-6">
              <div className="project-content">
                <div className="project-tag">Ingeniería</div>
                <h3>Asesorías Técnicas NFPA</h3>
                <p>Criterios de diseño, revisión de ingeniería y selección de equipos para proyectos de protección.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="nosotros" className="section about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content animate-left">
              <div className="section-tag">Sobre SIELCO</div>
              <h3>
                Precisar su problema<br />
                y <span className="accent">solucionarlo</span> es nuestro desafío
              </h3>
              <p>
                Desde 2015, SIELCO (Sistemas Electrónicos de Control SPA) ofrece soluciones 
                integrales en protección contra incendio y desarrollo tecnológico en la Región 
                Metropolitana de Chile.
              </p>
              <p>
                Nuestro equipo combina experiencia en ingeniería NFPA con competencias en 
                desarrollo de software moderno, ofreciendo un enfoque único que integra 
                seguridad física y soluciones digitales.
              </p>
              <div className="about-values">
                <div className="value-item">
                  <h4>🔥 Normativa NFPA</h4>
                  <p>Diseños certificados bajo estándares internacionales</p>
                </div>
                <div className="value-item">
                  <h4>⚡ Tecnología Moderna</h4>
                  <p>React, Next.js, Firebase y cloud computing</p>
                </div>
                <div className="value-item">
                  <h4>🛡️ Calidad Garantizada</h4>
                  <p>Equipos listados UL y aprobados FM</p>
                </div>
                <div className="value-item">
                  <h4>🔧 Soporte Continuo</h4>
                  <p>Mantenimiento preventivo y soporte técnico</p>
                </div>
              </div>
            </div>
            <div className="about-visual animate-right delay-2">
              <div className="about-stat-card">
                <div className="about-stat-num">10+</div>
                <div className="about-stat-text">
                  <h4>Años de trayectoria</h4>
                  <p>Desde 2015 en el mercado chileno</p>
                </div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-num" style={{color: 'rgba(41,128,185,0.8)'}}>Full</div>
                <div className="about-stat-text">
                  <h4>Stack Development</h4>
                  <p>Frontend, Backend, Cloud & DevOps</p>
                </div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-num">NFPA</div>
                <div className="about-stat-text">
                  <h4>Normativa Internacional</h4>
                  <p>NFPA y estándares asociados</p>
                </div>
              </div>
              <div className="about-stat-card">
                <div className="about-stat-num">CL</div>
                <div className="about-stat-text">
                  <h4>Todo chile</h4>
                  <p>Cobertura nacional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contacto" className="section contact">
        <div className="container">
          <div className="section-header animate-up">
            <div className="section-tag">Contacto</div>
            <h2 className="section-title">Conversemos sobre su proyecto</h2>
            <p className="section-desc">
              Ya sea protección contra incendio o desarrollo de software, 
              estamos listos para ayudarle.
            </p>
          </div>
          <div className="contact-grid">
            <div className="contact-info animate-left delay-2">
              <h3>Información de Contacto</h3>
              <p>Contáctenos directamente o complete el formulario y le responderemos a la brevedad.</p>
              
              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div className="contact-detail-text">
                  <h4>Email</h4>
                  <p>ventas@sielco.cl</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </div>
                <div className="contact-detail-text">
                  <h4>Teléfono / WhatsApp</h4>
                  <p>+56 9 7865 4687</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                </div>
                <div className="contact-detail-text">
                  <h4>Web</h4>
                  <p>https://sielco-web.vercel.app/</p>
                </div>
              </div>
              
              <div className="contact-detail">
                <div className="contact-detail-icon" style={{background: 'var(--flame-bg)', color: 'var(--flame)'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="contact-detail-text">
                  <h4>Ubicación</h4>
                  <p>Región Metropolitana, Santiago, Chile</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form animate-right delay-3">
              <form onSubmit={(e) => { e.preventDefault(); alert('Gracias por su mensaje. Le contactaremos pronto.'); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input type="text" placeholder="Su nombre" required />
                  </div>
                  <div className="form-group">
                    <label>Empresa</label>
                    <input type="text" placeholder="Nombre de empresa" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="correo@empresa.cl" required />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input type="tel" placeholder="+56 9 ..." />
                  </div>
                </div>
                <div className="form-group">
                  <label>Área de Interés</label>
                  <select defaultValue="">
                    <option value="" disabled>Seleccione un servicio</option>
                    <option>Protección Contra Incendio</option>
                    <option>Desarrollo de Aplicaciones</option>
                    <option>Asesoría Técnica NFPA</option>
                    <option>Mantenimiento de Sistemas</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mensaje</label>
                  <textarea placeholder="Cuéntenos sobre su proyecto..." required />
                </div>
                <button type="submit" className="btn-submit">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/logo-sielco.png" alt="SIELCO" />
              <p>
                Sistemas Electrónicos de Control SPA. Soluciones integrales en 
                protección contra incendio y desarrollo de aplicaciones desde 2015.
              </p>
            </div>
            <div className="footer-col">
              <h4>Servicios</h4>
              <a href="#servicios">Protección Contra Incendio</a>
              <a href="#servicios">Desarrollo de Aplicaciones</a>
              <a href="#servicios">Asesoría Técnica NFPA</a>
              <a href="#servicios">Mantenimiento de Sistemas</a>
            </div>
            <div className="footer-col">
              <h4>Contacto</h4>
              <a href="mailto:ventas@sielco.cl">ventas@sielco.cl</a>
              <a href="tel:+56978983503">+56 9 7898 3503</a>
              <a href="https://https://sielco-web.vercel.app/" target="_blank" rel="noopener">https://sielco-web.vercel.app/</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} SIELCO — Sistemas Electrónicos de Control SPA. Todos los derechos reservados.</span>
            <span>Santiago, Chile</span>
          </div>
        </div>
      </footer>
    </>
  );
}
