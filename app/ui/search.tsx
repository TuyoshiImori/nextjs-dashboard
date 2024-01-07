'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname(); // 現在のパス　この場合は"/dashboard/invoices"
  const { replace } = useRouter();

  // function handleSearch(term: string) {
  // デバウンス ユーザーが入力をやめてから300ミリ秒が経過した時にコードを実行する
  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    // 新しい検索クエリを入力した時にページ番号を1にリセットする
    params.set('page', '1');

    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    // URLを更新する　/dashboard/invoices?query=lee ユーザーが「Lee」を検索した場合。
    replace(`${pathname}?${params.toString()}`); // params.toString()は入力をURLに適した形式に変換される
  }, 300);
  // }

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        // URLと入力の同期を維持する
        defaultValue={searchParams.get('query')?.toString()}
        // ＊状態を使用して入力の値を管理している場合はValue属性を使用する
        // 検索クエリを状態ではなくURLに保存しているためdefaultValueを使用している
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
