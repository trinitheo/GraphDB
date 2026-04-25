

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Symptom, DemographicsData, WomensHealth, MedicalRecordEntry, Patient, Api } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

type HistoryData = Api.V1.HistoryData;
type Complaint = Api.V1.Complaint;

interface SigInfo {
    name: string;
    dosage: string;
    route: string;
    frequency: string;
    duration?: string;
}

// FIX: LabResult is now available under Api.V1.LabResultValue
type LabResult = Api.V1.LabResultValue;

// Type for the expected OCR response
interface OcrResponse {
    orderingPhysician?: string;
    dateFinalized?: string;
    results: Omit<LabResult, 'isAbnormal'>[];
}

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  public async summarizeMedicalNotes(notes: MedicalRecordEntry[]): Promise<string> {
    if (notes.length === 0) {
      return "There are no medical notes to summarize.";
    }

    const systemInstruction = "You are a helpful clinical assistant. Your task is to summarize patient medical records accurately and concisely for a healthcare professional. Focus on key findings, diagnoses, and treatment plans. Use clear headings and bullet points.";
    const prompt = this.constructSummaryPrompt(notes);

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      return response.text.trim();
    } catch (error: any) {
      console.error("Error generating summary from Gemini API:", error);
      const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
      if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("AI suggestion unavailable: API quota exceeded.");
      }
      throw new Error("Failed to communicate with the AI model.");
    }
  }

  private constructSummaryPrompt(notes: MedicalRecordEntry[]): string {
    let prompt = "Please summarize the following clinical notes for a quick overview:\n\n";

    notes.forEach(note => {
      prompt += `---
Date: ${new Date(note.timestamp).toLocaleString()}
Type: ${note.type}
Author: ${note.authorName} (${note.authorRole})
Content:
${note.content}
---\n\n`;
    });

    prompt += "End of notes. Please provide the summary.";
    return prompt;
  }

  public async generateComplaintTimeline(symptoms: Symptom[], demographics: DemographicsData, womensHealth: WomensHealth): Promise<string> {
    const validSymptoms = symptoms.filter(s => s.description && s.onset);
    if (validSymptoms.length === 0) {
        return "No symptom information provided to generate a timeline.";
    }

    const prompt = this.constructTimelinePrompt(validSymptoms, demographics, womensHealth);
    
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });

      return response.text.trim();
    } catch (error: any) {
      console.error("Error generating content from Gemini API:", error);
      const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
      if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("AI timeline generation unavailable: API quota exceeded.");
      }
      throw new Error("Failed to communicate with the AI model.");
    }
  }

  private constructTimelinePrompt(symptoms: Symptom[], demographics: DemographicsData, womensHealth: WomensHealth): string {
    let prompt = `As a clinical assistant, generate a concise, chronological "History of Present Illness" timeline based on the following patient-reported symptoms. Present it as a single narrative paragraph.\n\n`;

    if (demographics.sex === 'Female') {
        prompt += "Relevant patient context:\n";
        if (womensHealth.lmp) {
            prompt += `- Last Menstrual Period: ${womensHealth.lmp}\n`;
        }
        if (womensHealth.possibilityOfPregnancy) {
            prompt += `- Possibility of pregnancy: ${womensHealth.possibilityOfPregnancy}\n`;
        }
        prompt += "\n";
    }

    prompt += "Patient's symptoms:\n";

    symptoms.forEach((symptom, index) => {
        prompt += `- Symptom ${index + 1}: ${symptom.description}\n`;
        prompt += `  - Onset: ${symptom.onset}\n`;
        prompt += `  - Severity: ${symptom.severity}/10\n`;
        if (symptom.location.length > 0) {
            prompt += `  - Location: ${symptom.location.join(', ')}\n`;
        }
    });

    prompt += "\nGenerate the timeline now.";
    return prompt;
  }

  public async generateSig(sigInfo: SigInfo): Promise<string> {
    const { name, dosage, route, frequency, duration } = sigInfo;
    if (!name || !dosage || !route || !frequency) {
        return Promise.resolve('');
    }

    const systemInstruction = "You are a clinical assistant creating a patient-friendly prescription instruction (a SIG). Be concise and clear. Do not add any extra explanation or labels. Example: 'Take 1 tablet by mouth once daily for 14 days.'";

    const prompt = `Generate a SIG for the following prescription:
    - Medication: ${name}
    - Dosage: ${dosage}
    - Route: ${route}
    - Frequency: ${frequency}
    ${duration ? `- Duration: ${duration}` : ''}`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.2,
            },
        });
        // Basic cleanup to remove potential markdown or unwanted prefixes
        return response.text.trim().replace(/SIG:\s*/, '');
    } catch (error: any) {
        console.error("Error generating SIG from Gemini API:", error);
        const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
        if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
          throw new Error("AI SIG generation unavailable: API quota exceeded.");
        }
        throw new Error("Failed to generate SIG.");
    }
  }
  
  public async summarizeLabResults(results: string): Promise<string> {
    if (!results.trim()) {
        return "No results provided to summarize.";
    }
    const systemInstruction = "You are a helpful clinical assistant. Your task is to summarize patient lab results accurately and concisely for a healthcare professional. For each abnormal finding (indicated by a flag), clearly state the test name, its value with units, its direction (e.g., Creatinine ↑ 1.8), and its potential clinical significance. If all results are normal, state that clearly. Use clear headings and bullet points. Do not include a disclaimer.";

    const prompt = `Please summarize the following lab results. The format for each line is Test|Value|Unit|ReferenceRange|Flag (H for high, L for low).

    ${results}

    Provide a summary, emphasizing and explaining any abnormal results as instructed.`;

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.3,
            },
        });
        return response.text.trim();
    } catch (error: any) {
        console.error("Error generating lab summary from Gemini API:", error);
        const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
        if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
          throw new Error("AI lab summary unavailable: API quota exceeded.");
        }
        throw new Error("Failed to communicate with the AI model for lab summarization.");
    }
  }

  public async extractLabResultsFromImage(base64Data: string, mimeType: string): Promise<OcrResponse> {
    const systemInstruction = "You are a highly accurate medical data extraction specialist. Your task is to analyze an image of a lab report and extract key information into a structured JSON format. Be precise and do not hallucinate data. If a value is not present, omit the key.";
    
    const prompt = "Please extract the lab test results from this report. Identify the ordering physician, the date the results were finalized, and each individual test with its name, value, units, reference range, and whether the result is abnormal.";

    const schema = {
        type: Type.OBJECT,
        properties: {
          orderingPhysician: { type: Type.STRING, description: 'The name of the doctor or clinic that ordered the test.' },
          dateFinalized: { type: Type.STRING, description: 'The date the results were finalized, in YYYY-MM-DD format.' },
          results: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                testName: { type: Type.STRING },
                value: { type: Type.STRING },
                unit: { type: Type.STRING },
                referenceRange: { type: Type.STRING },
                isAbnormal: { type: Type.BOOLEAN },
              },
              required: ['testName', 'value', 'unit', 'referenceRange', 'isAbnormal'],
            },
          },
        },
        required: ['results'],
    };

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Data } },
                { text: prompt },
            ]
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      
      const jsonStr = response.text.trim();
      const data = JSON.parse(jsonStr);

      if (!data.results || !Array.isArray(data.results)) {
          throw new Error("Invalid response structure from AI: 'results' array is missing.");
      }

      // FIX: Cast the results to match the OcrResponse type
      const ocrResponse: OcrResponse = {
        orderingPhysician: data.orderingPhysician,
        dateFinalized: data.dateFinalized,
        results: data.results.map((r: any) => ({
          testName: r.testName,
          value: r.value,
          unit: r.unit,
          referenceRange: r.referenceRange,
          flag: r.isAbnormal ? (parseFloat(r.value) > parseFloat(r.referenceRange.split('-')[1]) ? 'H' : 'L') : ''
        })),
      };

      return ocrResponse;

    } catch (error: any) {
      console.error("Error extracting data from Gemini API:", error);
      const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
      if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
        throw new Error("AI suggestion unavailable: API quota exceeded. Please check your plan limits.");
      }
      throw new Error("Failed to communicate with the AI model for data extraction.");
    }
  }

  public async suggestLabPanels(patient: Patient, validPanels: string[]): Promise<{ panelName: string; rationale: string }[]> {
    const systemInstruction = `You are an expert clinical decision support assistant. Based on the patient's profile, suggest a list of relevant lab panels to order.
    - Provide a short, one-sentence rationale for each suggestion.
    - IMPORTANT: The 'panelName' you return in the JSON MUST EXACTLY MATCH one of the following valid panel names: ${validPanels.map(p => `"${p}"`).join(', ')}.
    - Do not suggest panels that are not in this list.
    - Base your suggestions on the provided active problems, age, and gender.
    - Return an empty array if no specific panels are strongly indicated.`;

    const prompt = `
    Patient Profile:
    - Age: ${patient.age}
    - Gender: ${patient.gender}
    - Active Problems: ${patient.activeProblems?.map(p => p.condition).join(', ') || 'None listed'}

    Suggest relevant lab panels based on this profile.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                panelName: { type: Type.STRING },
                rationale: { type: Type.STRING },
            },
            required: ['panelName', 'rationale'],
        },
    };

    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.2,
            },
        });

        const jsonStr = response.text.trim();
        const suggestions = JSON.parse(jsonStr);

        // Filter to ensure only valid panel names are returned, as a fallback
        return suggestions.filter((s: any) => validPanels.includes(s.panelName));

    } catch (error: any) {
        console.error("Error generating lab suggestions from Gemini API:", error);
        const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
        if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
          throw new Error("AI lab suggestions unavailable: API quota exceeded.");
        }
        throw new Error("Failed to communicate with the AI model for lab suggestions.");
    }
  }

  private constructHistorySummaryPrompt(history: HistoryData, complaint: Complaint): string {
    let prompt = `Please create a clinical history summary based on the following structured data:\n\n`;
    
    prompt += `**Chief Complaint:** ${complaint.symptoms.map(s => s.description).join(', ') || 'Not specified'}\n\n`;
    
    if (history.medicalHistory.length > 0) {
      prompt += `**Past Medical History:**\n- ${history.medicalHistory.map(h => h.condition).join('\n- ')}\n\n`;
    }

    if (history.surgicalHistory.length > 0) {
      prompt += `**Past Surgical History:**\n- ${history.surgicalHistory.map(s => s.procedure).join('\n- ')}\n\n`;
    }
    
    if (history.allergies.length > 0) {
      prompt += `**Allergies:**\n- ${history.allergies.map(a => `${a.substance} (Reaction: ${a.reaction})`).join('\n- ')}\n\n`;
    }

    if (history.medications.length > 0) {
      prompt += `**Current Medications:**\n- ${history.medications.map(m => `${m.name} ${m.dose} ${m.frequency}`).join('\n- ')}\n\n`;
    }

    if (history.familyHistory.length > 0) {
        prompt += `**Family History:**\n- ${history.familyHistory.map(f => `${f.relation}: ${f.condition}`).join('\n- ')}\n\n`;
    }

    prompt += `**Social History:**\n`;
    prompt += `- Smoking: ${history.socialHistory.smokingStatus || 'Not specified'}\n`;
    prompt += `- Alcohol: ${history.socialHistory.alcoholConsumption || 'Not specified'}\n`;
    prompt += `- Occupation: ${history.socialHistory.occupation || 'Not specified'}\n\n`;

    return prompt;
  }

  public async summarizePatientHistory(history: HistoryData, complaint: Complaint): Promise<string> {
    const prompt = this.constructHistorySummaryPrompt(history, complaint);
    const systemInstruction = "You are a clinical assistant. Synthesize the provided patient history into a concise, well-structured narrative for a medical record. Use paragraphs and cover all provided sections. Start with a summary sentence about the patient. For example: 'This is a 42-year-old male with a history of...'";
    
    try {
        const response: GenerateContentResponse = await this.ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.5,
            },
        });
        return response.text.trim();
    } catch (error: any) {
        console.error("Error generating history summary from Gemini API:", error);
        const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
        if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
          throw new Error("AI history summary unavailable: API quota exceeded.");
        }
        throw new Error("Failed to generate history summary.");
    }
  }
}

export const geminiService = new GeminiService();