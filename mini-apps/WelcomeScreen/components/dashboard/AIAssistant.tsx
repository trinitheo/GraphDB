import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AIAssistantProps {
  patientDetails: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ patientDetails }) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSuggestion = async () => {
      if (!patientDetails) {
        setSuggestion("No active patient to review.");
        return;
      }
      
      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Prepare context
        const patientContext = `
          Name: ${patientDetails.name}
          Age: ${patientDetails.age}
          Vitals: ${JSON.stringify(patientDetails.latestVitals || {})}
          Problems: ${JSON.stringify(patientDetails.activeProblems || [])}
          Medications: ${JSON.stringify(patientDetails.medications || [])}
        `;
        
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: `Review the following patient data and provide a single, short (max 2 sentences), highly actionable clinical suggestion or insight:\n\n${patientContext}`,
          config: {
            systemInstruction: "You are an expert Clinical Decision Support AI. Analyze patient data and provide immediate, concise, actionable clinical insights. Do not include greetings or conversational filler. Be direct and medical.",
          }
        });
        
        setSuggestion(response.text || "Review patient chart for any outstanding items.");
      } catch (error: any) {
        let errorMsg = `Review flagged labs for ${patientDetails?.name || 'the patient'}.`;
        
        // Handle Gemini API quota error gracefully
        const errorString = typeof error === 'object' ? JSON.stringify(error) : String(error);
        if (error?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
          errorMsg = "AI suggestion unavailable: API quota exceeded. Please check your plan limits.";
          console.warn("AI suggestion rate limited (429 Quota Exceeded)");
        } else {
          console.error("Failed to generate AI suggestion", error);
        }
        
        setSuggestion(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, [patientDetails]);

  return (
    <div className="mt-4 relative">
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 size={16} className="animate-spin" />
          <span>Analyzing patient chart with Gemini...</span>
        </div>
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
          {suggestion}
        </p>
      )}
    </div>
  );
};

export default AIAssistant;
