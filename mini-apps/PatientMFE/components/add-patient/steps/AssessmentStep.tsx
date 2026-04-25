import React, { useState } from "react";
import { useIntake } from "../../../context/IntakeContext";
import FormTextArea from "../../form/FormTextArea";
import { GoogleGenAI, Type } from "@google/genai";
import { snomedService } from "../../../services/snomedService";
import type { SnomedConcept } from "../../../types";
import { Sparkles, TrashIcon, CheckCircle, SearchIcon, AlertTriangle } from "../../../../../components/icons";

// Common medical abbreviations → full terms
const ABBREV_MAP: Record<string, string> = {
  GERD: "gastroesophageal reflux disease",
  HTN: "hypertension",
  DM: "diabetes mellitus",
  T2DM: "type 2 diabetes mellitus",
  T1DM: "type 1 diabetes mellitus",
  COPD: "chronic obstructive pulmonary disease",
  CKD: "chronic kidney disease",
  CHF: "congestive heart failure",
  CAD: "coronary artery disease",
  MI: "myocardial infarction",
  AF: "atrial fibrillation",
  AFIB: "atrial fibrillation",
  OA: "osteoarthritis",
  RA: "rheumatoid arthritis",
  UTI: "urinary tract infection",
  URI: "upper respiratory infection",
  STI: "sexually transmitted infection",
  ADHD: "attention deficit hyperactivity disorder",
  PTSD: "post‑traumatic stress disorder",
  IBS: "irritable bowel syndrome",
  IBD: "inflammatory bowel disease",
  SOB: "shortness of breath",
};

const expandAbbreviations = (text: string): string => {
  let output = text;
  Object.entries(ABBREV_MAP).forEach(([abbr, full]) => {
    const regex = new RegExp(`\\b${abbr}\\b`, "gi");
    output = output.replace(regex, full);
  });
  return output;
};

const AssessmentStep: React.FC = () => {
  const { state, dispatch, validationErrors } = useIntake();
  const { differentialDiagnosis, workingDiagnosis } = state.formData.assessment;

  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const addDiagnoses = (items: SnomedConcept[]) => {
    dispatch({ type: "ADD_DIAGNOSES", payload: items });
  };

  const toggleWorking = (dx: SnomedConcept) => {
    dispatch({ type: "TOGGLE_WORKING_DIAGNOSIS", payload: dx });
  };

  const removeDiagnosis = (dx: SnomedConcept) => {
    dispatch({ type: "REMOVE_DIAGNOSIS", payload: dx });
  };

  const handleAIExtract = async () => {
    if (!textInput.trim() || isProcessing) return;

    setIsProcessing(true);
    setAiError(null);

    try {
      const expandedText = expandAbbreviations(textInput);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          Extract all unique clinical diagnoses/conditions from this clinical text.
          Expand medical abbreviations. Return ONLY a valid JSON array of strings.
          Text: ${expandedText}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const extracted = JSON.parse(response.text || "[]");

      const resolved = await Promise.all(
        extracted.map(async (term: string) => {
          try {
            const matches = await snomedService.search(term);
            return matches[0] || {
              code: `custom_${crypto.randomUUID().slice(0, 8)}`,
              display: term,
            };
          } catch {
            return {
              code: `custom_${crypto.randomUUID().slice(0, 8)}`,
              display: term,
            };
          }
        })
      );

      addDiagnoses(resolved);
      setTextInput("");
    } catch (err: any) {
      console.error("AI extraction failed:", err);
      const errorString = typeof err === 'object' ? JSON.stringify(err) : String(err);
      if (err?.status === 429 || errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
         setAiError("AI extraction unavailable: API quota exceeded. Please check your plan limits.");
      } else {
         setAiError("AI extraction failed. Please try again or add items manually via notes.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Assessment</h2>
        <p className="text-sm text-slate-600 mt-1">
          Document the patient's differential and working diagnoses using clinical notes.
        </p>
      </div>

      {/* AI Text Extraction Tool (Always Visible) */}
      <section className="card-panel p-6 space-y-4 bg-sky-50/10 border-sky-100">
        <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
          <Sparkles className="w-5 h-5" />
          AI Clinical Text Processor
        </div>

        <FormTextArea
          label="Paste Clinical Notes or Shorthand"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          rows={5}
          placeholder="e.g. Patient has history of HTN, T2DM. Presenting today with acute SOB, query CHF exacerbation..."
          className="bg-white"
        />

        {aiError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle size={14} />
            {aiError}
          </div>
        )}

        <button
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isProcessing || !textInput.trim()}
          onClick={handleAIExtract}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>Extract Diagnoses from Text</span>
          )}
        </button>
      </section>

      {/* Diagnosis List */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-none">Problem List (Differential)</h3>
            <p className="text-xs text-slate-500 mt-1.5">Check items that are part of your current working diagnosis.</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{differentialDiagnosis.length} Items</span>
        </div>

        {differentialDiagnosis.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {differentialDiagnosis.map((dx) => {
              const isWorking = workingDiagnosis.some((w) => w.code === dx.code);
              const isCustom = dx.code.startsWith("custom_");

              return (
                <div
                  key={dx.code}
                  className={`group flex items-center justify-between p-4 border rounded-xl transition-all ${
                    isWorking 
                    ? 'bg-sky-50 border-sky-300 shadow-sm ring-1 ring-sky-300' 
                    : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isWorking}
                        onChange={() => toggleWorking(dx)}
                        className="peer sr-only"
                      />
                      <div className="w-6 h-6 border-2 border-slate-300 rounded-md peer-checked:bg-sky-600 peer-checked:border-sky-600 transition-all flex items-center justify-center shadow-sm">
                        {isWorking && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                    </label>
                    
                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleWorking(dx)}>
                      <p className={`font-bold text-[15px] truncate ${isWorking ? 'text-sky-900' : 'text-slate-800'}`}>
                        {dx.display}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {isWorking && (
                          <span className="text-[9px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Working</span>
                        )}
                        {isCustom ? (
                          <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">Manual Entry</span>
                        ) : (
                          <p className="text-[10px] font-mono text-slate-400 uppercase">SNOMED ID: {dx.code}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDiagnosis(dx);
                    }}
                    title="Remove from list"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center grayscale opacity-60">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <SearchIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium italic">
              No diagnoses recorded yet.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
              Use the clinical notes tool above to process data into structured diagnoses.
            </p>
          </div>
        )}
      </section>
      
      {validationErrors.Assessment?.some(e => e.includes('working diagnosis')) && (
          <div className="flex items-center justify-center gap-2 text-red-600 p-4 bg-red-50 rounded-xl border border-red-200">
            <AlertTriangle size={18} />
            <p className="text-sm font-bold">Please select at least one working diagnosis before proceeding.</p>
          </div>
      )}
    </div>
  );
};

export default AssessmentStep;