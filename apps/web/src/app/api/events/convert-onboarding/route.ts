import { createClient } from '@/lib/supabase/server';
import { convertOnboardingToEvents } from '@/lib/events/onboarding-mapper';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  console.log("🔄 Convert Onboarding API endpoint hit");
  
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    // Convert onboarding answers to life events
    const result = await convertOnboardingToEvents(user.id, supabase);
    
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
