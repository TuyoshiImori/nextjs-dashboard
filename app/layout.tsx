import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

// ルートレイアウトはapp内の全てのページで共有される
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
