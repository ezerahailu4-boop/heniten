import fs from 'node:fs';
import path from 'node:path';
import Legacy from '@/components/Legacy';
const ld = { '@context': 'https://schema.org', '@type': 'GeneralContractor', name: 'Heniten Construction PLC', telephone: '+251991999501', email: 'henitenc@gmail.com', address: { '@type': 'PostalAddress', addressLocality: 'Addis Ababa', addressCountry: 'ET' } };
export default function Home() {
  const html = fs.readFileSync(path.join(process.cwd(), 'content', 'body.html'), 'utf8');
  return (<>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@600;700;800&display=swap" precedence="default" />
    <link rel="stylesheet" href="/assets/css/style.css" precedence="default" />
    <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
    <Legacy />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
  </>);
}
