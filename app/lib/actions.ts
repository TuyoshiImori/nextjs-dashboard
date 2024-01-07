// use serverを追加するとファイル内のエクスポートされたすべての関数がサーバー関数としてマークされる
// サーバー機能はクライアント コンポーネントとサーバー コンポーネントにインポートできるため、非常に汎用性が高くなります。
'use server';

import { z } from 'zod'; // 型検証ライブラリ
import { sql } from '@vercel/postgres'; // SQL
import { revalidatePath } from 'next/cache'; // ルーターキャッシュ データベースが更新されると/dashboard/invoices パスが再検証され新しいデータがサーバーから取得される
import { redirect } from 'next/navigation'; // データベースが更新された時に/dashboard/invoicesページにリダイレクトする
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// const FormSchema = z.object({
//   id: z.string(),
//   customerId: z.string(),
//   amount: z.coerce.number(),
//   status: z.enum(['pending', 'paid']),
//   date: z.string(),
// });

const FormSchema = z.object({
  id: z.string(),
  // Zodでstringかどうかを検証
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  // stringからnumberに強制しているため空文字の場合.gt()で0になる
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

// 請求書の作成
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // prevStateはフックから渡された状態が含まれる
  // formDataの値を抽出する
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // 送信前にフォームフィールドが条件付きで正しく検証されたかを確認
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // 浮動小数点エラーを防ぐためにセント単位にする
  const date = new Date().toISOString().split('T')[0]; // 請求書の作成日をYYYY-MM-DDの形式で作成する

  try {
    // SQLクエリを作成して請求書をデータベースに挿入する
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 請求書データの更新
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  // Zodを使用して型を検証する
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // 浮動小数点エラーを防ぐためにセント単位にする

  try {
    // 変数をSQLに渡す
    await sql`
  UPDATE invoices
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  WHERE id = ${id}
`;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices'); // クライアントキャッシュをクリアして新しいサーバーリクエストを作成
  redirect('/dashboard/invoices'); // ユーザーを請求書のページにリダイレクトする
}

// 請求書の削除
export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

// 認証ロジック
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // https://errors.authjs.dev/
    throw error;
  }
}
