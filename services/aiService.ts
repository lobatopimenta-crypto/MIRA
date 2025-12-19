
import { GoogleGenAI } from "@google/genai";

export const analyzeDroneImage = async (base64Image: string, fileName: string): Promise<string> => {
  try {
    // Initialize AI with apiKey property as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: `Analyze this drone photo named "${fileName}". Provide a brief technical summary for a GIS professional. Identify terrain type, potential structures, and any environmental features. Keep it under 60 words.` },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
        ]
      },
      config: {
        systemInstruction: "You are an expert GIS and Drone Imagery analyst for M.I.R.A. (Mapeamento de Inteligência e Reconhecimento Aéreo). Your goal is to provide technical insights from aerial views."
      }
    });

    // Use .text property directly as per guidelines
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "AI analysis failed to load.";
  }
};

export const analyzeDroneVideoContext = async (fileName: string, metadata: string): Promise<string> => {
  try {
    // Initialize AI with apiKey property as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: `As a GIS expert, provide a simulated high-level technical scan report for a drone video named "${fileName}". Metadata provided: ${metadata}. Describe potential GIS use cases for this footage (e.g., topographic mapping, thermal inspection, volume calculation). Keep it professional and under 70 words.` }
        ]
      },
      config: {
        systemInstruction: "You are the M.I.R.A. (Mapeamento de Inteligência e Reconhecimento Aéreo) AI assistant. You specialize in analyzing drone mission parameters and telemetry to provide intelligence reports."
      }
    });

    // Use .text property directly as per guidelines
    return response.text || "Análise de vídeo indisponível no momento.";
  } catch (error) {
    console.error("AI Video Analysis failed:", error);
    return "Falha na análise inteligente do vídeo.";
  }
};
