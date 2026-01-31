import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    // Remove lang="en" here so Next.js handles it automatically (e.g., lang="es")
    <Html>
      <Head />
      <body className="bg-slate-50 text-slate-800 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}