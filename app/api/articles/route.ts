import { NextResponse } from 'next/server';
import { mockArticles } from '@/lib/mock-articles';

export async function GET() {
  return NextResponse.json(mockArticles);
}
