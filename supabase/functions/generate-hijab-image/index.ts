import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Map hex colors to descriptive names for better prompts
function getColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    "#1e3a5f": "navy blue",
    "#1a1a1a": "black",
    "#f5f5f0": "off-white",
    "#d4b896": "beige",
    "#4a6741": "olive green",
    "#6b4226": "brown",
    "#7a7d80": "gray",
    "#722f37": "burgundy",
    "#2e8b8b": "teal",
    "#c97b84": "dusty pink",
    "#6ca0dc": "sky blue",
    "#cc5500": "burnt orange",
  };
  return colorMap[hex] || hex;
}

function getSkinToneName(hex: string): string {
  const toneMap: Record<string, string> = {
    "#fde7d0": "very fair skin",
    "#f5d0a9": "fair skin",
    "#e8b88a": "light wheat skin",
    "#d4a06a": "wheat skin",
    "#c08c5a": "warm tan skin",
    "#a87844": "olive skin",
    "#8d6535": "medium brown skin",
    "#6b4423": "dark brown skin",
  };
  return toneMap[hex] || "medium skin";
}

// Get complementary hijab colors based on the outfit color
function getSuggestedHijabColors(outfitColor: string): { name: string; hex: string }[] {
  const suggestions: Record<string, { name: string; hex: string }[]> = {
    "#1e3a5f": [
      { name: "burnt orange", hex: "#cc5500" },
      { name: "dusty rose", hex: "#c97b84" },
    ],
    "#1a1a1a": [
      { name: "emerald green", hex: "#2e8b57" },
      { name: "burgundy red", hex: "#722f37" },
    ],
    "#f5f5f0": [
      { name: "navy blue", hex: "#1e3a5f" },
      { name: "dusty mauve", hex: "#b0879b" },
    ],
    "#d4b896": [
      { name: "teal", hex: "#2e8b8b" },
      { name: "chocolate brown", hex: "#6b4226" },
    ],
    "#4a6741": [
      { name: "mustard yellow", hex: "#c7a93c" },
      { name: "cream", hex: "#f5f0e1" },
    ],
    "#6b4226": [
      { name: "sky blue", hex: "#6ca0dc" },
      { name: "sage green", hex: "#9caf88" },
    ],
    "#7a7d80": [
      { name: "blush pink", hex: "#de98a0" },
      { name: "royal blue", hex: "#4169e1" },
    ],
    "#722f37": [
      { name: "gold", hex: "#c7a93c" },
      { name: "cream white", hex: "#f5f0e1" },
    ],
    "#2e8b8b": [
      { name: "burnt orange", hex: "#cc5500" },
      { name: "coral", hex: "#e07060" },
    ],
    "#c97b84": [
      { name: "olive green", hex: "#4a6741" },
      { name: "charcoal", hex: "#36454f" },
    ],
    "#6ca0dc": [
      { name: "peach", hex: "#f0a080" },
      { name: "tan", hex: "#c8a882" },
    ],
    "#cc5500": [
      { name: "navy blue", hex: "#1e3a5f" },
      { name: "forest green", hex: "#355e3b" },
    ],
  };
  return suggestions[outfitColor] || [
    { name: "cream white", hex: "#f5f0e1" },
    { name: "dusty rose", hex: "#c97b84" },
  ];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { outfitColor, skinTone } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const colorName = getColorName(outfitColor);
    const skinName = getSkinToneName(skinTone);
    const hijabSuggestions = getSuggestedHijabColors(outfitColor);

    // Generate two images in parallel - one for each suggested hijab color
    const imagePromises = hijabSuggestions.map(async (hijab) => {
      const prompt = `A photorealistic portrait of a beautiful young Muslim woman with ${skinName} wearing a stylish ${colorName} blazer/outfit and a ${hijab.name} colored hijab. The hijab color is exactly ${hijab.hex}. Studio lighting, fashion photography, elegant pose, soft background, high quality, 4K. The woman should look natural and confident.`;

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Image generation failed [${response.status}]:`, errorText);
        if (response.status === 429) {
          throw new Error("rate_limited");
        }
        if (response.status === 402) {
          throw new Error("payment_required");
        }
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl =
        data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

      return {
        hijabColor: hijab.name,
        hijabHex: hijab.hex,
        imageUrl,
        description: `تنسيق حجاب ${hijab.name} مع ${colorName}`,
      };
    });

    const results = await Promise.all(imagePromises);

    return new Response(JSON.stringify({ suggestions: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    let status = 500;
    if (message === "rate_limited") status = 429;
    if (message === "payment_required") status = 402;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
