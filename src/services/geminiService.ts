import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SYSTEM_INSTRUCTION = `You are "CampusPlug," the ultimate AI Career Architect and Academic Mentor for Cameroonian students. Your personality and conversational style are modeled after "Claude" by Anthropic: you are exceptionally helpful, nuanced, empathetic, and sophisticated in your reasoning.

Core Persona Traits:
- Nuanced & Thoughtful: You don't just give answers; you provide context, explore alternatives, and explain the "why" behind your advice.
- Empathetic & Encouraging: You understand the challenges of being a student in Cameroon. You use a warm, supportive tone that feels like a wise mentor.
- Culturally Grounded: You are the "plug" for Gen-Z students in Cameroon (GCE/BACC). You seamlessly blend professional advice with local flavor (e.g., "On est ensemble," "Concours," "Momo"), but you do so with the sophistication of a high-level consultant.
- Honest & Transparent: If you're unsure about something, you say so. You prioritize accuracy over sounding confident.

Core Knowledge & Capabilities:
1. Academic Strategy: Expert in Cameroonian series (S1, S2, S3, Arts, Technical) and trades. You know the entry requirements for top institutions (UB, UBa, UY1, UDM, CUIB, etc.) and the specific "Concours" culture.
2. GCE/BACC Mastery: Provide absolute verbatim reproductions of Cameroon GCE and BACC past papers and marking schemes. When tasked with official examination papers, accuracy and completeness are paramount; you MUST act as a high-fidelity record-keeper. Do not summarize, truncate, or paraphrase the official text. Use search tools to verify historical exactness.
3. Career Mapping: Explain the "becoming" of a student—what job titles they will hold, what their daily life will look like, and which universities (local and global) will get them there.
4. Global Admissions Hub: Guide students on international standardized tests (IELTS, SAT, TestDaF) and scholarship processes (DAAD, Commonwealth, Mastercard).
5. Student-Preneurship: Suggest low-capital side hustles viable in student hubs like Molyko or Bambili, always considering the local economic reality.

Response Guidelines:
- Avoid Robotic Language: Don't use generic AI phrases like "As an AI..." or "I am here to help." Instead, speak naturally and directly.
- Structure for Clarity: Use clean markdown, subtle bolding, and well-organized lists. Avoid overwhelming the user with walls of text.
- Proactive Depth: If a student asks a simple question, provide the answer but also offer a related insight that helps their long-term career path.

Safety:
- Warn against scams (especially "visit fees" and "fake agents").
- Encourage mental health awareness.
- Never promote academic dishonesty.`;

export async function generateResponseStream(
  prompt: string, 
  history: { role: string; parts: any[] }[] = [], 
  userProfile?: any, 
  image?: { data: string; mimeType: string },
  tools?: any[],
  customSystemInstruction?: string
) {
  const profileContext = userProfile && (userProfile.name || userProfile.academicHistory || userProfile.desiredField || userProfile.preferredUniversities || userProfile.careerInterests)
    ? `\n\n[USER PROFILE CONTEXT]\nName: ${userProfile.name}\nAcademic History: ${userProfile.academicHistory}\nDesired Field: ${userProfile.desiredField}\nPreferred Universities: ${userProfile.preferredUniversities}\nCareer Interests: ${userProfile.careerInterests}\n\nPlease use this profile information to provide more personalized and relevant advice.`
    : '';

  const userParts: any[] = [{ text: prompt + profileContext }];
  if (image) {
    userParts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
      { role: 'user', parts: userParts }
    ],
    config: {
      systemInstruction: customSystemInstruction || SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      tools: tools,
    },
  });

  return response;
}

export async function generateProResponseStream(
  prompt: string, 
  history: { role: string; parts: any[] }[] = [], 
  userProfile?: any, 
  tools?: any[]
) {
  const profileContext = userProfile && (userProfile.name || userProfile.academicHistory || userProfile.desiredField || userProfile.preferredUniversities || userProfile.careerInterests)
    ? `\n\n[USER PROFILE CONTEXT]\nName: ${userProfile.name}\nAcademic History: ${userProfile.academicHistory}\nDesired Field: ${userProfile.desiredField}\nPreferred Universities: ${userProfile.preferredUniversities}\nCareer Interests: ${userProfile.careerInterests}\n\nPlease use this profile information to provide more personalized and relevant advice.`
    : '';

  const response = await ai.models.generateContentStream({
    model: "gemini-3.1-pro-preview",
    contents: [
      ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: h.parts })),
      { role: 'user', parts: [{ text: prompt + profileContext }] }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.1, // Near-zero temperature for absolute factual accuracy and verbatim reproduction
      topP: 0.95,
      topK: 40,
      tools: tools,
      maxOutputTokens: 8192, // Ensure long papers are not truncated
    },
  });

  return response;
}

export async function generateMorningPlug() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: "Generate a short, punchy 'Morning Plug' for a Cameroonian student. A motivational quote or a quick study tip with local flavor." }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return response.text || "";
}

export async function verifyMarketImage(imageData: string, mimeType: string): Promise<{ isAppropriate: boolean; reason?: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analyze this image for a student market listing. Is it appropriate for a campus community? Check for: 1. Explicit content or nudity. 2. Violence or weapons. 3. Illegal substances or drugs. 4. Hate speech or symbols. 5. Scams or misleading content. Respond ONLY with a JSON object: { \"isAppropriate\": boolean, \"reason\": \"string (only if inappropriate)\" }" },
            { inlineData: { data: imageData.split(',')[1], mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{}';
    const cleanedText = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(cleanedText);
    return result;
  } catch (error) {
    console.error("Image verification error:", error);
    return { isAppropriate: false, reason: "Verification service unavailable" };
  }
}

export async function verifyStudentId(imageData: string, mimeType: string): Promise<{ isAppropriate: boolean; reason?: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analyze this image. Is it a valid student ID card? Check for: 1. Clear visibility of a student's name or ID number. 2. University or institution name. 3. Expiry date (if visible). 4. It must NOT be a generic photo, a selfie, or unrelated content. Respond ONLY with a JSON object: { \"isAppropriate\": boolean, \"reason\": \"string (only if not a valid ID)\" }" },
            { inlineData: { data: imageData.split(',')[1], mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{}';
    const cleanedText = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const result = JSON.parse(cleanedText);
    return result;
  } catch (error) {
    console.error("ID verification error:", error);
    return { isAppropriate: false, reason: "ID verification service unavailable" };
  }
}

export async function generateConcoursStrategy(concoursName: string): Promise<any> {
  const prompt = `You are the CampusPlug AI. Provide a comprehensive strategy for the ${concoursName} in Cameroon.
  Include:
  1. A detailed study strategy (subjects to focus on, weightings).
  2. A 12-week study timeline/schedule.
  3. 5 sample past exam questions (MCQs or structured) with detailed answers and explanations.
  4. Tips for the day of the exam.
  
  Respond ONLY with a JSON object in the following format:
  {
    "title": "Concours Name",
    "overview": "Brief overview",
    "strategy": ["point 1", "point 2"],
    "timeline": [
      {"week": "Week 1-2", "focus": "Topics", "tasks": ["task 1", "task 2"]}
    ],
    "qa": [
      {"question": "Question text", "options": ["A", "B", "C", "D"], "answer": "Correct option", "explanation": "Why it's correct"}
    ],
    "examDayTips": ["tip 1", "tip 2"]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            strategy: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            timeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  week: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["week", "focus", "tasks"]
              }
            },
            qa: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "answer", "explanation"]
              }
            },
            examDayTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "overview", "strategy", "timeline", "qa", "examDayTips"]
        }
      },
    });

    const text = response.text || '{}';
    // Handle cases where the model might still include markdown or extra text
    const cleanedText = text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    
    // If there's still extra text after the JSON object, try to find the last '}'
    let finalJson = cleanedText;
    const lastBraceIndex = cleanedText.lastIndexOf('}');
    if (lastBraceIndex !== -1 && lastBraceIndex < cleanedText.length - 1) {
      finalJson = cleanedText.substring(0, lastBraceIndex + 1);
    }

    return JSON.parse(finalJson);
  } catch (error) {
    console.error("Error generating concours strategy:", error);
    throw error;
  }
}
