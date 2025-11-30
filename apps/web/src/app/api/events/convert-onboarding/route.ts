import { createClient, createServiceClient } from '@/lib/supabase/server';
import { convertOnboardingToEvents } from '@/lib/events/onboarding-mapper';

export const dynamic = "force-dynamic";

export async function POST() {
  console.log("🔄 Convert Onboarding API endpoint hit");
  
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      console.error("❌ No authenticated user found");
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    console.log("🔄 Converting onboarding for user:", user.id);

    // Use service client to bypass RLS for inserts (user already validated)
    const serviceClient = await createServiceClient();
    
    // Convert onboarding answers to life events
    const result = await convertOnboardingToEvents(user.id, serviceClient);
    
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
