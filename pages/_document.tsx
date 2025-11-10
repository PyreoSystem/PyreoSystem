import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Meta tags globales para SEO y redes sociales */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Global Hub" />
        <meta property="og:image" content="https://pyreo-system.vercel.app/og-default.jpg" />
        <meta property="og:locale" content="es_MX" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://pyreo-system.vercel.app/og-default.jpg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
