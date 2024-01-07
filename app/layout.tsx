import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

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

// メタデータ
// ページのタイトルと説明
// title.templateを使用してページタイトルのテンプレートを定義　ページタイトルやその他の含めたい情報を含めることができる
export const metadata: Metadata = {
  title: {
    // %s は特定のページタイトルに置き換えられます
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};
