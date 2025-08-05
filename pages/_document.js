import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Configuration ultra-minimale sans aucun préchargement */}
        <meta httpEquiv="x-dns-prefetch-control" content="off" />
        <meta httpEquiv="cache-control" content="no-cache" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
