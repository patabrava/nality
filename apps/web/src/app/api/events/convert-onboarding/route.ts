import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { convertOnboardingToEvents } from '@/lib/events/onboarding-mapper';
import {
  authenticationRequiredResponse,
  getAuthenticatedRequestContext,
} from '@/lib/server/auth';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Get base URL from request headers (works in both dev and prod)
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const host = req.headers.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;
  
  try {
    const auth = await getAuthenticatedRequestContext(req);
    if (!auth) {
      return authenticationRequiredResponse();
    }

    // Use service client to bypass RLS for inserts (user already validated)
    const serviceClient = await createServiceClient();
    
    // Convert onboarding answers to life events
    const conversionOptions: { baseUrl: string; accessToken?: string } = { baseUrl };
    if (auth.accessToken) {
      conversionOptions.accessToken = auth.accessToken;
    }
    const result = await convertOnboardingToEvents(auth.user.id, serviceClient, conversionOptions);
    
    return NextResponse.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error("❌ Convert Onboarding API error:", error);
    return NextResponse.json(
      { error: "Onboarding-Daten konnten nicht umgewandelt werden" },
      { status: 500 }
    );
  }
}
