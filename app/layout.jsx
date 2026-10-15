const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://heniten.com';
export const metadata = {
  metadataBase: new URL(base),
  title: 'Heniten Construction PLC | Building & Civil Contractor, Addis Ababa',
  description: 'Licensed building and civil contractor in Addis Ababa delivering commercial towers, fuel stations, industrial complexes and residential estates.',
  openGraph: { title: 'Heniten Construction PLC', description: 'Commercial, industrial, residential and fuel station projects across Ethiopia.', images: ['/assets/images/taf-headquarters.webp'], type: 'website' },
  icons: { icon: '/assets/images/logo.svg' },
};
export default function RootLayout({ children }) {
  return (<html lang="en"><body>{children}</body></html>);
}
