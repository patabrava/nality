import { NextRequest, NextResponse } from 'next/server'
import { buildAuthCallbackSearchParams } from '@/lib/auth/callback-query'

export async function GET(request: NextRequest) {
  const callbackUrl = new URL('/auth/callback', request.nextUrl.origin)
  callbackUrl.search = buildAuthCallbackSearchParams(request.nextUrl.searchParams).toString()
  return NextResponse.redirect(callbackUrl)
}
