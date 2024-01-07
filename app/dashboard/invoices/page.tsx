import Pagination from '@/app/ui/invoices/pagination'; // 請求書のページへ移動
import Search from '@/app/ui/search'; // 請求書の検索
import Table from '@/app/ui/invoices/table'; // 請求書を表示する
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchInvoicesPages } from '@/app/lib/data';
import { Metadata } from 'next';

// 特定のページにカスタムタイトルを追加したい場合はこのようにmetadataオブジェクトをページ自体に追加する
export const metadata: Metadata = {
  title: 'Invoices',
};

// URL検索パラメータを使用する理由
// ブックマーク可能および共有可能な URL:
// 検索パラメータが URL に含まれるため、ユーザーは、将来の参照や共有のために、検索クエリやフィルタを含むアプリケーションの現在の状態をブックマークできます。

// サーバー側のレンダリングと初期読み込み:
// URL パラメータをサーバー上で直接使用して初期状態をレンダリングできるため、サーバー レンダリングの処理が容易になります。

// 分析と追跡:
// URL 内に検索クエリとフィルタを直接設定すると、追加のクライアント側ロジックを必要とせずに、ユーザーの行動を簡単に追跡できるようになります。

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* Searchはクライアントコンポーネントなのでサーバーに戻る必要がなくuseSearchParams()を使用している */}
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        {/* 独自のデータを取得するサーバーコンポーネントなのでsearchParamsプロパティをページからコンポーネントに渡す */}
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
