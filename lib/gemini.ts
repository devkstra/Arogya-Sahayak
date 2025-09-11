// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface MedicalContext {
  symptoms?: string[];
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  vitalSigns?: {
    temperature?: number;
    bloodPressure?: string;
    heartRate?: number;
    respiratoryRate?: number;
  };
  patientLanguage?: string;
}

export interface ConsultationSummary {
  symptoms: string[];
  possibleDiagnosis: string[];
  recommendations: string[];
  followUpActions: string[];
  urgencyLevel: "low" | "medium" | "high" | "critical";
  confidence: number;
}

export class GeminiMedicalAssistant {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateMedicalSummary(
    patientMessage: string,
    conversationHistory: string,
    medicalContext?: MedicalContext
  ): Promise<ConsultationSummary> {
    const prompt = this.buildMedicalPrompt(
      patientMessage,
      conversationHistory,
      medicalContext
    );

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseMedicalResponse(text);
    } catch (error) {
      console.error("Error generating medical summary:", error);
      throw new Error("Failed to generate medical summary");
    }
  }

  async generateDoctorResponse(
    patientMessage: string,
    conversationHistory: string,
    medicalContext?: MedicalContext
  ): Promise<string> {
    const prompt = `You are an experienced medical professional providing consultation through a telemedicine platform called Arogya Sahayak.

Patient's Current Message: "${patientMessage}"

Conversation History:
${conversationHistory}

${medicalContext ? this.formatMedicalContext(medicalContext) : ""}

Please provide a professional, empathetic, and informative response as a doctor would. Consider:
1. Address the patient's immediate concerns
2. Ask relevant follow-up questions
3. Provide preliminary guidance (while emphasizing this is not a substitute for in-person examination)
4. Suggest appropriate next steps
5. Use simple, patient-friendly language
6. Be culturally sensitive and respectful

Keep the response concise but comprehensive, around 2-3 sentences.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating doctor response:", error);
      throw new Error("Failed to generate response");
    }
  }

  async generatePatientEducationContent(
    topic: string,
    language: string = "English"
  ): Promise<string> {
    const prompt = `Generate educational content about "${topic}" for patients in ${language}. 
    
    The content should be:
    - Easy to understand for non-medical audiences
    - Accurate and evidence-based
    - Include prevention tips where applicable
    - Mention when to seek medical help
    - Be culturally appropriate for Indian patients
    - Around 150-200 words
    
    Format the response with clear headings and bullet points where appropriate.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating educational content:", error);
      throw new Error("Failed to generate educational content");
    }
  }

  async assessSymptomUrgency(symptoms: string[]): Promise<{
    urgencyLevel: "low" | "medium" | "high" | "critical";
    reasoning: string;
    immediateActions: string[];
  }> {
    const prompt = `As a medical AI assistant, assess the urgency level of these symptoms: ${symptoms.join(
      ", "
    )}

    Provide:
    1. Urgency level (low/medium/high/critical)
    2. Brief reasoning for the assessment
    3. Immediate actions the patient should take

    Respond in JSON format:
    {
      "urgencyLevel": "...",
      "reasoning": "...",
      "immediateActions": ["..."]
    }`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error assessing symptom urgency:", error);
      return {
        urgencyLevel: "medium",
        reasoning:
          "Unable to assess urgency automatically. Please consult with a healthcare provider.",
        immediateActions: ["Seek medical consultation"],
      };
    }
  }

  private buildMedicalPrompt(
    patientMessage: string,
    conversationHistory: string,
    medicalContext?: MedicalContext
  ): string {
    return `You are a medical AI assistant helping doctors provide better patient care. Analyze the following consultation data and provide a structured medical summary.

Patient's Latest Message: "${patientMessage}"

Conversation History:
${conversationHistory}

${medicalContext ? this.formatMedicalContext(medicalContext) : ""}

Please provide a medical analysis in the following JSON format:
{
  "symptoms": ["list of identified symptoms"],
  "possibleDiagnosis": ["list of possible diagnoses based on symptoms"],
  "recommendations": ["list of medical recommendations"],
  "followUpActions": ["specific actions for follow-up"],
  "urgencyLevel": "low|medium|high|critical",
  "confidence": 0.0-1.0
}

Consider:
- Only include medically relevant information
- Base recommendations on evidence-based medicine
- Account for the patient's age, language, and cultural context
- Be conservative with urgency assessment
- Provide confidence score based on available information quality`;
  }

  private formatMedicalContext(context: MedicalContext): string {
    return `
Medical Context:
- Age: ${context.age || "Not specified"}
- Gender: ${context.gender || "Not specified"}
- Language: ${context.patientLanguage || "Not specified"}
- Known Symptoms: ${context.symptoms?.join(", ") || "None specified"}
- Medical History: ${context.medicalHistory?.join(", ") || "None specified"}
- Current Medications: ${
      context.currentMedications?.join(", ") || "None specified"
    }
- Vital Signs: ${
      context.vitalSigns ? JSON.stringify(context.vitalSigns) : "Not available"
    }
`;
  }

  private parseMedicalResponse(text: string): ConsultationSummary {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          symptoms: parsed.symptoms || [],
          possibleDiagnosis: parsed.possibleDiagnosis || [],
          recommendations: parsed.recommendations || [],
          followUpActions: parsed.followUpActions || [],
          urgencyLevel: parsed.urgencyLevel || "medium",
          confidence: parsed.confidence || 0.5,
        };
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (error) {
      console.error("Error parsing medical response:", error);
      // Fallback response
      return {
        symptoms: ["Unable to parse symptoms"],
        possibleDiagnosis: ["Requires further evaluation"],
        recommendations: ["Please consult with a healthcare provider"],
        followUpActions: ["Schedule follow-up appointment"],
        urgencyLevel: "medium",
        confidence: 0.1,
      };
    }
  }
}

export const geminiAssistant = new GeminiMedicalAssistant();
