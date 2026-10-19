const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://heniten.com';
export const metadata = {
  metadataBase: new URL(base),
  title: 'Heniten Construction PLC | Building & Civil Contractor, Addis Ababa',
  description: 'Licensed building and civil contractor in Addis Ababa delivering commercial towers, fuel stations, industrial complexes and residential estates.',
  openGraph: { title: 'Heniten Construction PLC', description: 'Commercial, industrial, residential and fuel station projects across Ethiopia.', images: ['/assets/images/taf-headquarters.webp'], type: 'website' },
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico', apple: '/favicon.png' },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
