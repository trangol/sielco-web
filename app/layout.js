import './globals.css';

export const metadata = {
  title: 'SIELCO | Sistemas & Soluciones',
  description:
    'Protección Contra Incendio y Desarrollo de Aplicaciones. Soluciones de ingeniería a la medida en Santiago, Chile.',
  keywords:
    'protección contra incendio, desarrollo de aplicaciones, NFPA, sistemas de detección, rociadores, software, Chile',
  openGraph: {
    title: 'SIELCO | Sistemas & Soluciones',
    description: 'Protección Contra Incendio y Desarrollo de Aplicaciones',
    url: 'https://sielco.cl',
    siteName: 'SIELCO',
    locale: 'es_CL',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Playfair+Display:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
