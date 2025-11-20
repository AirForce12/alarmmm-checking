
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_API_KEY } from '../constants';

export interface VisionAnalysisResult {
  isLock: boolean;
  securityLevel: 'low' | 'medium' | 'high' | 'unknown';
  reason: string;
}

/**
 * Sends an image (base64) to Google Gemini 2.5 Flash for analysis.
 */
export const analyzeLockImage = async (base64Image: string): Promise<VisionAnalysisResult> => {
  try {
    // Use the hardcoded API Key from constants to ensure functionality
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Detect mime type dynamically
    const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // Remove data URL prefix - handle all image types including HEIF/HEIC from iOS
    const base64Data = base64Image.replace(/^data:image\/[^;]+;base64,/, '');

    const prompt = `
      Du bist ein Sicherheitsexperte für Schließtechnik. Analysiere dieses Bild sorgfältig.
      
      Aufgabe:
      1. Zeigt das Bild einen Türzylinder, einen Schlüssel oder einen Türgriff?
      2. Wenn ja, schätze das Sicherheitsniveau ein.
         - "low": Standard-Zackenschlüssel, Standard-Profilzylinder, kein Bohrschutz erkennbar.
         - "medium": Bohrmuldenschlüssel (Wendeschlüssel), Sicherungskarte erkennbar.
         - "high": Hochsicherheits-Elektronikzylinder, komplexes mechanisches System, KESO/DOM/BKS janus etc.
      
      Gib das Feld "reason" zwingend auf DEUTSCH zurück. Sei präzise, professionell und direkt.
      Beispiel für reason: "Erkannt wurde ein Standard-Profilzylinder mit Zackenschlüssel. Dieser bietet keinen Schutz gegen Picking oder Schlagschlüssel-Methoden."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isLock: { type: Type.BOOLEAN },
            securityLevel: { type: Type.STRING, enum: ['low', 'medium', 'high', 'unknown'] },
            reason: { type: Type.STRING }
          },
          required: ['isLock', 'securityLevel', 'reason']
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(jsonStr) as VisionAnalysisResult;

  } catch (error: any) {
    console.error("Vision analysis failed:", error);
    
    const errorMessage = error?.message || String(error);
    let reason = 'Die Bildanalyse war nicht möglich. Bitte versuchen Sie es mit einem Bild bei besserem Licht.';
    
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      reason = 'Das monatliche Analyse-Kontingent wurde erreicht. Bitte versuchen Sie es später erneut.';
    } else if (errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
      reason = 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
    } else if (errorMessage.includes('Invalid image') || errorMessage.includes('format')) {
      reason = 'Bildformat nicht unterstützt. Bitte verwenden Sie JPG, PNG oder WebP.';
    }
    
    return {
      isLock: false,
      securityLevel: 'unknown',
      reason
    };
  }
};