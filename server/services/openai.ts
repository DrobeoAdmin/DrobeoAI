import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ClothingAnalysis {
  category: string;
  color: string;
  style: string;
  season: string;
  occasion: string[];
  pattern?: string;
  material?: string;
  confidence: number;
}

export interface OutfitSuggestion {
  name: string;
  items: number[];
  occasion: string;
  weatherCondition: string;
  styleDescription: string;
  rating: number;
  reasoning: string;
}

export async function analyzeClothingImage(base64Image: string): Promise<ClothingAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a fashion expert AI that analyzes clothing items. Analyze the clothing item in the image and provide detailed information about it. Respond with JSON in this exact format: {
            "category": "one of: tops, bottoms, dresses, shoes, accessories, outerwear",
            "color": "primary color name",
            "style": "style description (e.g., casual, formal, streetwear, vintage)",
            "season": "one of: spring, summer, fall, winter, all",
            "occasion": ["array of suitable occasions like work, casual, formal, party"],
            "pattern": "pattern if any (solid, striped, floral, etc.)",
            "material": "material type if identifiable",
            "confidence": "confidence score between 0 and 1"
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this clothing item and provide the requested information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      category: result.category || "tops",
      color: result.color || "unknown",
      style: result.style || "casual",
      season: result.season || "all",
      occasion: result.occasion || ["casual"],
      pattern: result.pattern,
      material: result.material,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7)),
    };
  } catch (error) {
    console.error("Error analyzing clothing image:", error);
    throw new Error("Failed to analyze clothing image: " + (error as Error).message);
  }
}

export async function generateOutfitSuggestions(
  clothingItems: any[],
  preferences: {
    occasion: string;
    weatherCondition: string;
    style?: string;
    colors?: string[];
  }
): Promise<OutfitSuggestion[]> {
  try {
    const itemsDescription = clothingItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      style: item.style,
      season: item.season,
      timesWorn: item.timesWorn
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional fashion stylist AI. Create 3 outfit suggestions using the provided clothing items. Consider the occasion, weather, and style preferences. Prioritize items that haven't been worn much to help rotate the wardrobe. Respond with JSON in this exact format: {
            "outfits": [
              {
                "name": "outfit name",
                "items": [array of item IDs],
                "occasion": "occasion type",
                "weatherCondition": "weather condition",
                "styleDescription": "description of the outfit style",
                "rating": "rating from 1-5",
                "reasoning": "brief explanation of why this outfit works"
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Create outfit suggestions for:
          - Occasion: ${preferences.occasion}
          - Weather: ${preferences.weatherCondition}
          - Preferred style: ${preferences.style || "any"}
          - Preferred colors: ${preferences.colors?.join(", ") || "any"}
          
          Available clothing items:
          ${JSON.stringify(itemsDescription, null, 2)}
          
          Please create 3 diverse outfit combinations that work well together.`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return result.outfits?.map((outfit: any) => ({
      name: outfit.name,
      items: outfit.items || [],
      occasion: outfit.occasion || preferences.occasion,
      weatherCondition: outfit.weatherCondition || preferences.weatherCondition,
      styleDescription: outfit.styleDescription || "",
      rating: Math.max(1, Math.min(5, outfit.rating || 4)),
      reasoning: outfit.reasoning || "",
    })) || [];
  } catch (error) {
    console.error("Error generating outfit suggestions:", error);
    throw new Error("Failed to generate outfit suggestions: " + (error as Error).message);
  }
}

export async function getStyleAdvice(question: string, userContext?: any): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional fashion stylist and personal shopper. Provide helpful, personalized fashion advice based on current trends, body types, occasions, and personal style preferences. Keep responses concise but informative."
        },
        {
          role: "user",
          content: `${question}${userContext ? `\n\nUser context: ${JSON.stringify(userContext)}` : ""}`
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't provide advice at this time.";
  } catch (error) {
    console.error("Error getting style advice:", error);
    throw new Error("Failed to get style advice: " + (error as Error).message);
  }
}
