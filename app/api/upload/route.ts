import { NextResponse } from "next/server";
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public', // Or 'protected' if you need signed URLs
    });

    return NextResponse.json({ url: blob.url });
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}