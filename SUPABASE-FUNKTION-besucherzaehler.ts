import { createClient } from "npm:@supabase/supabase-js@2";
const allowedOrigin = "https://platinoladies.github.io";
const cors = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};
const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: cors });
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET" && req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  if (req.headers.get("origin") !== allowedOrigin) return reply({ error: "Forbidden origin" }, 403);
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("pl_visit_total").select("count").eq("id", 1).single();
      if (error) throw error;
      return reply({ count: Number(data.count) });
    }
    // One counted visit per IP/browser fingerprint and 30-minute window.
    // Only a salted SHA-256 digest is stored, never a raw IP or user agent.
    const ip = req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const agent = req.headers.get("user-agent") ?? "unknown";
    const window = Math.floor(Date.now() / (30 * 60 * 1000));
    const secret = Deno.env.get("VISITOR_HASH_SECRET");
    if (!secret) return reply({ error: "Missing VISITOR_HASH_SECRET" }, 503);
    const bytes = new TextEncoder().encode(`${secret}:${window}:${ip}:${agent}`);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    const fingerprint = Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, "0")).join("");
    const { data, error } = await supabase.rpc("pl_record_visit", { p_fingerprint: fingerprint });
    if (error) throw error;
    return reply({ count: Number(data) });
  } catch (error) {
    console.error("Besucherzähler:", error);
    return reply({ error: "Counter unavailable" }, 500);
  }
});
