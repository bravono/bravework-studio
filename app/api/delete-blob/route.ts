
import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Missing blob URL to delete' }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting from Vercel Blob:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}