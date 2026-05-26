import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages, conversation_id, business_context } = await req.json();

    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your edge function secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Zippy, an AI business assistant for a small business owner using ZippyMedia.Ai. You help with:
- Customer communication strategies
- Marketing and social media growth
- Appointment and booking optimization
- Business analytics and revenue opportunities
- Lead generation and follow-up
- Local SEO and online presence

${business_context ? `Business context: ${business_context}` : ""}

Be concise, actionable, and practical. Give specific advice tailored to small businesses. Keep responses focused and helpful.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}`, detail: err }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const assistantContent = data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (conversation_id) {
      await supabase.from("ai_messages").insert({
        conversation_id,
        role: "assistant",
        content: assistantContent,
      });

      await supabase.from("ai_conversations").update({
        updated_at: new Date().toISOString(),
      }).eq("id", conversation_id);
    }

    return new Response(
      JSON.stringify({ content: assistantContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
