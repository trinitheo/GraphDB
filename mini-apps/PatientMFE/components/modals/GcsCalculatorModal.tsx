import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';

interface GcsCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (gcsValue: string) => void;
    currentGcs: string;
}

const GCS_OPTIONS = {
  eye: [
    { score: 4, text: 'Spontaneous' },
    { score: 3, text: 'To speech' },
    { score: 2, text: 'To pain' },
    { score: 1, text: 'None' },
  ],
  verbal: [
    { score: 5, text: 'Orientated' },
    { score: 4, text: 'Confused' },
    { score: 3, text: 'Inappropriate words' },
    { score: 2, text: 'Incomprehensible sounds' },
    { score: 1, text: 'None' },
  ],
  motor: [
    { score: 6, text: 'Obeys commands' },
    { score: 5, text: 'Localises to pain' },
    { score: 4, text: 'Withdraws from pain' },
    { score: 3, text: 'Abnormal flexion (decorticate)' },
    { score: 2, text: 'Abnormal extension (decerebrate)' },
    { score: 1, text: 'None' },
  ],
};

type GcsComponent = 'eye' | 'verbal' | 'motor';

const parseGcsString = (gcs: string): { e: number | null, v: number | null, m: number | null } => {
    if (!gcs) return { e: null, v: null, m: null };
    const match = gcs.match(/\(E(\d)V(\d)M(\d)\)/);
    if (match) {
        return {
            e: parseInt(match[1], 10),
            v: parseInt(match[2], 10),
            m: parseInt(match[3], 10),
        };
    }
     // Fallback for just a total score
    const totalMatch = gcs.match(/^(\d+)/);
    if(totalMatch) {
        // Can't derive components, so return null
        return { e: null, v: null, m: null };
    }
    return { e: null, v: null, m: null };
};

const getGcsClassification = (score: number): { text: string; color: string } => {
    if (score <= 8) return { text: 'Severe', color: 'text-red-600' };
    if (score <= 12) return { text: 'Moderate', color: 'text-yellow-600' };
    return { text: 'Mild', color: 'text-green-600' };
};

const GcsCalculatorModal: React.FC<GcsCalculatorModalProps> = ({ isOpen, onClose, onSave, currentGcs }) => {
    const [eScore, setEScore] = useState<number | null>(null);
    const [vScore, setVScore] = useState<number | null>(null);
    const [mScore, setMScore] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            const { e, v, m } = parseGcsString(currentGcs);
            setEScore(e);
            setVScore(v);
            setMScore(m);
        }
    }, [isOpen, currentGcs]);

    const totalScore = useMemo(() => {
        if (eScore === null || vScore === null || mScore === null) return null;
        return eScore + vScore + mScore;
    }, [eScore, vScore, mScore]);
    
    const classification = useMemo(() => {
        if (totalScore === null) return null;
        return getGcsClassification(totalScore);
    }, [totalScore]);

    const handleSave = () => {
        if (totalScore !== null && eScore !== null && vScore !== null && mScore !== null) {
            const formattedString = `${totalScore} (E${eScore}V${vScore}M${mScore})`;
            onSave(formattedString);
        }
    };

    const isComplete = eScore !== null && vScore !== null && mScore !== null;
    
    const RadioOption: React.FC<{
        name: GcsComponent;
        score: number;
        text: string;
        checked: boolean;
        onChange: (score: number) => void;
    }> = ({ name, score, text, checked, onChange }) => (
        <label className={`block p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
            checked 
            ? 'bg-sky-50 border-sky-500 shadow-sm' 
            : 'bg-white border-slate-200 hover:bg-slate-50'
        }`}>
            <input
                type="radio"
                name={name}
                value={score}
                checked={checked}
                onChange={() => onChange(score)}
                className="sr-only"
            />
            <div className="flex items-center justify-between">
                <span className={`font-medium ${
                    checked ? 'text-sky-900' : 'text-slate-700'
                }`}>{text}</span>
                <span className={`font-bold text-lg ${
                    checked ? 'text-sky-600' : 'text-slate-500'
                }`}>{score}</span>
            </div>
        </label>
    );

    const footer = (
        <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-neu">
                Cancel
            </button>
            <button
                type="button"
                onClick={handleSave}
                disabled={!isComplete}
                className="btn-neu text-sky-600"
            >
                Save Score
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Glasgow Coma Scale (GCS) Calculator" footer={footer}>
            <div className="space-y-6">
                 <div className="text-center p-4 rounded-lg bg-slate-100 border border-slate-200">
                    <p className="text-sm font-medium text-slate-600">Total Score</p>
                    <p className={`text-5xl font-bold ${totalScore === null ? 'text-slate-400' : 'text-slate-800'}`}>
                        {totalScore ?? '—'}
                    </p>
                    {classification && <p className={`mt-1 font-semibold ${classification.color}`}>{classification.text}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Eye Opening (E)</h3>
                        <div className="space-y-2">
                            {GCS_OPTIONS.eye.map(opt => <RadioOption key={opt.score} name="eye" {...opt} checked={eScore === opt.score} onChange={setEScore} />)}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Verbal Response (V)</h3>
                        <div className="space-y-2">
                            {GCS_OPTIONS.verbal.map(opt => <RadioOption key={opt.score} name="verbal" {...opt} checked={vScore === opt.score} onChange={setVScore} />)}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Motor Response (M)</h3>
                        <div className="space-y-2">
                            {GCS_OPTIONS.motor.map(opt => <RadioOption key={opt.score} name="motor" {...opt} checked={mScore === opt.score} onChange={setMScore} />)}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default GcsCalculatorModal;
