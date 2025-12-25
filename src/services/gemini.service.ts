import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  async generateTasks(projectDescription: string): Promise<any> {
    const model = 'gemini-2.5-flash';
    const response = await this.ai.models.generateContent({
      model: model,
      contents: `Break down the following project description into a list of 3-5 actionable tasks. 
      Project: ${projectDescription}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  estimatedHours: { type: Type.INTEGER },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                },
                required: ['title', 'estimatedHours', 'priority']
              }
            }
          }
        }
      }
    });

    const text = response.text();
    return JSON.parse(text || '{ "tasks": [] }');
  }

  async chatWithAgent(message: string, history: any[]): Promise<string> {
    // Map internal history format to Gemini format if needed, 
    // for simplicity we just send the message here as a single turn for this demo 
    // or use chat session if persistent.
    // To keep it simple and stateless for the demo, we'll just prompt with context.
    
    const context = history.map(h => `${h.role}: ${h.text}`).join('\n');
    const prompt = `You are Nexus, an elite AI project manager. 
    Previous conversation:
    ${context}
    
    User: ${message}
    Nexus:`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Be concise, professional, and motivating."
      }
    });

    return response.text || "I'm offline right now.";
  }

  async generateConceptArt(prompt: string): Promise<string> {
    const response = await this.ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64 = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64}`;
    }
    throw new Error('No image generated');
  }
}