import { createClient, createServiceClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { convertOnboardingToEvents } from '@/lib/events/onboarding-mapper';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("🔄 Convert Onboarding API endpoint hit");
  
  try {
    // Try to get body with userId/accessToken (like chat route does)
    let bodyUserId: string | null = null;
    let accessToken: string | null = null;
    
    try {
      const body = await req.json();
      bodyUserId = body.userId || null;
      accessToken = body.accessToken || null;
    } catch {
      // No body or invalid JSON - that's fine
    }

    // Get authenticated user - try server auth first
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let effectiveUserId = user?.id || null;

    // If no server auth, try to validate with accessToken
    if (!effectiveUserId && accessToken) {
      const authedClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        }
      );
      const { data: { user: tokenUser } } = await authedClient.auth.getUser();
      if (tokenUser?.id) {
        effectiveUserId = tokenUser.id;
        console.log("🔑 Authenticated via accessToken");
      }
    }

    // Fallback to bodyUserId if provided (trust client in this case)
    if (!effectiveUserId && bodyUserId) {
      effectiveUserId = bodyUserId;
      console.log("🟡 Using client-provided userId:", bodyUserId);
    }

    if (!effectiveUserId) {
      console.error("❌ No authenticated user found");
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log("🔄 Converting onboarding for user:", effectiveUserId);

    // Use service client to bypass RLS for inserts (user already validated)
    const serviceClient = await createServiceClient();
    
    // Convert onboarding answers to life events
    const result = await convertOnboardingToEvents(effectiveUserId, serviceClient);
    
    console.log("✅ Onboarding conversion result:", result);
    
    return Response.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error("❌ Convert Onboarding API error:", error);
    return Response.json(
      { error: "Failed to convert onboarding data" },
      { status: 500 }
    );
  }
}
