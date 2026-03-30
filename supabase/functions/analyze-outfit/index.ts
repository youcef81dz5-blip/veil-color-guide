import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, pieces, allCategories, photo, referencePhoto, personPhoto } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ─── MODE: suggest missing piece colors ───
    if (mode === "suggest") {
      const selectedIds = pieces.map((p: any) => p.category);
      const piecesDesc = pieces
        .map((p: any) => `${p.categoryAr} (${p.category}): ${p.color}`)
        .join(", ");

      const prompt = `You are a fashion color coordination expert for modest women's fashion (hijab style).

The user has selected these pieces and colors:
${piecesDesc}

Suggest colors for 3-4 complementary pieces she doesn't have yet. Focus on pieces that would complete a stylish, coordinated outfit.

Return ONLY a JSON array (no markdown, no explanation) with objects having these exact fields:
- "categoryId": one of: hijab, top, dress, abaya, blazer, pants, skirt, leggings, shoes, bag, scarf, belt
- "categoryName": Arabic name of the piece
- "suggestedColor": hex color code
- "suggestedColorName": Arabic color name
- "reason": brief Arabic explanation of why this color works (max 15 words)

Do NOT suggest categories the user already has. Return valid JSON array only.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return errResponse("rate_limited", 429);
        if (response.status === 402) return errResponse("payment_required", 402);
        throw new Error(`AI error: ${response.status}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "[]";
      // Clean markdown fences
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let suggestions;
      try {
        suggestions = JSON.parse(text);
      } catch {
        suggestions = [];
      }

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── MODE: generate outfit image ───
    if (mode === "generate") {
      const outfitDesc = pieces
        .map((p: any) => `- ${p.categoryAr} (${p.category}): exact color ${p.color}`)
        .join("\n");

      const hasPersonPhoto = !!personPhoto;

      const prompt = hasPersonPhoto
        ? `You are given a photo of a real person. Generate a NEW photorealistic full-body fashion photo of THIS EXACT SAME PERSON wearing the outfit described below.

CRITICAL RULES FOR PERSON PRESERVATION:
- The generated person MUST have the EXACT same face, skin tone, facial features, eye color, face shape, and body proportions as the person in the provided photo
- Do NOT alter, beautify, or change ANY facial features — keep them 100% identical
- Preserve the person's exact skin color and complexion
- The person should look natural and realistic, as if this is a real photo of them

Outfit pieces to dress the person in:
${outfitDesc}

CRITICAL RULES FOR OUTFIT:
- Every garment listed MUST appear exactly as described with EXACT hex color match
- Do NOT add garments not listed
- If a reference clothing photo is also provided, preserve the exact style, cut, and fabric of those garments
- Studio lighting, fashion photography, elegant modest pose, clean soft background, high quality 4K`
        : `Generate a photorealistic full-body fashion photo of a modest Muslim woman (wearing hijab) with this EXACT outfit. 
Each garment must match the EXACT color specified — do NOT change, reinterpret, or substitute any color or garment type.

Outfit pieces:
${outfitDesc}

CRITICAL RULES:
- Every garment listed above MUST appear exactly as described
- Colors must be EXACT hex matches — no approximation
- If a reference photo is provided, preserve the exact style, cut, fabric texture, and design of each visible garment — only render missing pieces
- Do NOT add garments not listed
- Do NOT change the style or design of garments from the reference photo
- Studio lighting, fashion photography, elegant pose, clean soft background, high quality 4K`;

      const contentParts: any[] = [{ type: "text", text: prompt }];

      // Add person photo first (most important reference)
      if (personPhoto) {
        contentParts.push({ type: "image_url", image_url: { url: personPhoto } });
      }
      // Add clothing reference photo if available
      if (referencePhoto) {
        contentParts.push({
          type: "text",
          text: "Reference clothing photo — preserve the exact style, cut, and fabric of garments visible here:",
        });
        contentParts.push({ type: "image_url", image_url: { url: referencePhoto } });
      }

      const messages: any[] = [{ role: "user", content: contentParts.length > 1 ? contentParts : prompt }];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages,
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return errResponse("rate_limited", 429);
        if (response.status === 402) return errResponse("payment_required", 402);
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

      return new Response(JSON.stringify({ imageUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── MODE: analyze photo ───
    if (mode === "analyze") {
      const prompt = `Analyze this photo carefully. Identify each visible clothing piece, its exact dominant color, and a brief description of its style/cut.

Return ONLY a JSON array (no markdown) with objects having:
- "categoryId": one of: hijab, top, dress, abaya, blazer, pants, skirt, leggings, shoes, bag, scarf, belt
- "color": exact hex color code of the piece (be very precise)
- "description": brief description of the garment style (e.g. "long pleated maxi skirt", "fitted blazer with lapels")

Only include pieces you can clearly see. Be very precise with colors — sample the dominant color carefully. Return valid JSON array only.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: photo } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) return errResponse("rate_limited", 429);
        if (response.status === 402) return errResponse("payment_required", 402);
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content || "[]";
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

      let detectedPieces;
      try {
        detectedPieces = JSON.parse(text);
      } catch {
        detectedPieces = [];
      }

      return new Response(JSON.stringify({ pieces: detectedPieces }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return errResponse("Invalid mode", 400);
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    let status = 500;
    if (message === "rate_limited") status = 429;
    if (message === "payment_required") status = 402;
    return errResponse(message, status);
  }
});

function errResponse(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
