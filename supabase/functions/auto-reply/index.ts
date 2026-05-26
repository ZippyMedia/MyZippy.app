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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { message_id, content, platform, contact_id, user_id } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ matched: false, reason: "No message content provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let rulesQuery = supabase
      .from("auto_responses")
      .select("*")
      .eq("active", true)
      .or(`platform.eq.all,platform.eq.${platform}`);

    if (user_id) {
      rulesQuery = rulesQuery.eq("user_id", user_id);
    }

    const { data: rules } = await rulesQuery;

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ matched: false, reason: "No active rules" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lowerContent = content.toLowerCase();
    let matchedRule = null;

    for (const rule of rules) {
      const keyword = rule.trigger_keyword.toLowerCase().trim();
      if (lowerContent.includes(keyword)) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return new Response(
        JSON.stringify({ matched: false, reason: "No keyword match" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: replyMsg, error: replyError } = await supabase
      .from("messages")
      .insert({
        platform,
        direction: "outbound",
        content: matchedRule.response_template,
        contact_id: contact_id ?? null,
        read: true,
        auto_replied: true,
        user_id: user_id ?? null,
      })
      .select()
      .single();

    if (replyError) {
      return new Response(
        JSON.stringify({ matched: true, error: replyError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase
      .from("auto_responses")
      .update({ match_count: matchedRule.match_count + 1 })
      .eq("id", matchedRule.id);

    if (message_id) {
      await supabase
        .from("messages")
        .update({ auto_replied: true })
        .eq("id", message_id);
    }

    return new Response(
      JSON.stringify({
        matched: true,
        rule_id: matchedRule.id,
        keyword: matchedRule.trigger_keyword,
        reply: matchedRule.response_template,
        reply_message: replyMsg,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
