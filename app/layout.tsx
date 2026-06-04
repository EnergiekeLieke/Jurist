import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/700.css';

export const metadata = { title: 'Tools' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{ fontFamily: 'Montserrat, system-ui, sans-serif', fontWeight: 300, margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
