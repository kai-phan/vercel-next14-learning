'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';

const InvoiceSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce.number().gt(0, {
    message: 'Amount must be greater than 0.',
  }),
  status: z.enum(['paid', 'pending'], {
    invalid_type_error: 'Please select a status.',
  }),
  date: z.string(),
});

const CreateInvoiceSchema = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoiceSchema = InvoiceSchema.omit({ date: true, id: true });

export async function createInvoice(formData: FormData) {
  const rawData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  }

  try {
    const validatedData = CreateInvoiceSchema.parse(rawData);
    const amountCents = (validatedData.amount) * 100;
    const date = new Date().toISOString().split('T')[0];

    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${validatedData.customerId}, ${amountCents}, ${validatedData.status}, ${date})
  `;
  } catch (error) {
    console.log({ error })
    return {
      message: 'Failed to create invoice.',
    }
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export type UpdateInvoiceFormState = {
  errors: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string;
}

export async function updateInvoice(id: string, state: UpdateInvoiceFormState, formData: FormData) {
  const rawData = {
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  }

  const validation = UpdateInvoiceSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      message: 'Failed to update invoice.',
    }
  }

  try {
    const validatedData = validation.data;
    const amountCents = (validatedData.amount) * 100;

    await sql`
    UPDATE invoices
    SET customer_id = ${validatedData.customerId},
        amount = ${amountCents},
        status = ${validatedData.status}
    WHERE id = ${id}
  `;
  } catch (e) {
    console.log({ e })
    return {
      message: 'Failed to update invoice.',
      errors: {},
    }
  }

  revalidatePath(`/dashboard/invoices`);
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  } catch (e) {
    console.log({ e })
    return {
      message: 'Failed to delete invoice.',
    }
  }
}

export async function authorize(state: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (e) {
    if ((e as Error).message.includes('CredentialsSignin')) {
      return 'CredentialsSignin'
    }

    throw e;
  }
}