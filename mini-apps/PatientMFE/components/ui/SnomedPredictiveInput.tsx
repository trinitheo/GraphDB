import React, { useState, useEffect, useRef } from "react";
import { snomedService } from "../../services/snomedService";
import type { SnomedConcept } from "../../types";

const DEBOUNCE_MS = 250;

interface SnomedPredictiveInputProps {
  value?: SnomedConcept[];
  onSelect: (dx: SnomedConcept) => void;
  placeholder?: string;
}

const SnomedPredictiveInput: React.FC<SnomedPredictiveInputProps> = ({ 
  onSelect, 
  placeholder = "Search diagnoses (SNOMED)..." 
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SnomedConcept[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRequest = useRef(true);

  useEffect(() => {
    activeRequest.current = true;
    return () => {
      activeRequest.current = false;
    };
  }, []);

  const performSearch = async (text: string) => {
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const matches = await snomedService.search(text);

      if (activeRequest.current) {
        setResults(matches || []);
      }
    } catch (err) {
      console.error("SNOMED search failed:", err);

      if (activeRequest.current) {
        setResults([]);
      }
    } finally {
      if (activeRequest.current) {
        setLoading(false);
      }
    }
  };

  const handleChange = (text: string) => {
    setQuery(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(text);
    }, DEBOUNCE_MS);
  };

  return (
    <div className="relative">
      <input
        className="input-neu w-full p-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
      />

      {loading && (
        <div className="absolute right-3 top-2.5">
           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-50 bg-white border border-slate-200 rounded-lg mt-1 w-full max-h-60 overflow-y-auto shadow-lg">
          {results.map((item) => (
            <div
              key={item.code}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
              onClick={() => {
                onSelect(item);
                setQuery("");
                setResults([]);
              }}
            >
              <p className="font-bold text-slate-800 text-sm">{item.display}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">SNOMED: {item.code}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SnomedPredictiveInput;