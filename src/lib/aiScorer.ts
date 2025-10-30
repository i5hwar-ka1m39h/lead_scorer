import { GoogleGenAI, Type } from "@google/genai";
import type { Lead, Offer } from "./scorer.js";
import dotenv from 'dotenv'
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey!,
});
const intentScoreMap : Record<string, number> = {
    HIGH: 50,
    MEDIUM: 30,
    LOW: 10
}
type aiResp = {
    intent:string;
    reasoning:string;
    score: number
}
export const getAiScore = async (offer: Offer, lead: Lead) => {
  let offerSTR = JSON.stringify(offer);
  let leadSTR = JSON.stringify(lead);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
        Task: Given the offer and the lead info, classify the lead's buying intent as HIGH/MEDIUM/LOW and explain
        why in 1-2 sentence.
        Offer :${offerSTR}.
        Lead :${leadSTR} `,
    config: {
      systemInstruction: "You are a sales intelligence assistant.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intent: { type: Type.STRING },
          reasoning: { type: Type.STRING },
        },
      },
    },
  });

  if (!response) {
    throw new Error("something went wrong with the gemini");
  }

  const rawData = response.text;
  const data = rawData ? JSON.parse(rawData) : null;
 
 
  let score = intentScoreMap[data.intent] ?? 10;

  return {intent:data.intent, reasoning:data.reasoning, score:score} as aiResp
  
};

// const offer = {
//   name: "AI Outreach Automation",
//   value_prop: ["24/7 outreach", "6x more meetings"],
//   ideal_use_cases: ["B2B SaaS mid-market"],
// };

// const lead = {
//   name: "Ava Patel",
//   role: "Head of Growth",
//   company: "FlowMetrics",
//   industry: "SaaS",
//   location: "India",
//   linkedIn_bio: "B2B SaaS growth expert with 10+ years in marketing",
// };



