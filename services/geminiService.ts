
import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation, DailyProgress } from "../types";

export async function getPersonalizedGuidance(
  history: DailyProgress[],
  currentPrayer: string,
  userName: string
): Promise<AIRecommendation[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Analyze last 3 days of habits
  const recentHistory = history.slice(-3).map(h => {
    const completed = Object.entries(h.prayers).filter(([_, v]) => v).map(([k]) => k).join(', ');
    return `${h.date}: ${completed || 'None'}`;
  }).join('\n');

  const prompt = `
    You are NoorAI, a wise and empathetic spiritual guide.
    User Context:
    Name: ${userName}
    Current Time Phase: ${currentPrayer}
    Recent Prayer History (Last 3 days):
    ${recentHistory}

    Based on this, provide 3 highly personalized spiritual recommendations for right now.
    One should be a relevant Dua (Arabic + Translation), one a Quranic Verse (Arabic + Translation), and one a practical habit or spiritual practice for today.
    
    Consider if they missed prayers recently (encourage gently) or have been consistent (congratulate and offer higher-level practices).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['dua', 'verse', 'habit', 'quote'] },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              arabic: { type: Type.STRING },
              translation: { type: Type.STRING },
              source: { type: Type.STRING },
              reasoning: { type: Type.STRING, description: "Why NoorAI suggested this based on history" },
            },
            required: ['type', 'title', 'content', 'reasoning'],
          },
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Guidance Error:", error);
    return [];
  }
}
