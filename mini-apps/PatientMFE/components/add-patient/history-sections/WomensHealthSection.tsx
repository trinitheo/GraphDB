import React from 'react';
import type { MedicalHistoryForm } from '../../../types';
import FormSelect from '../../form/FormSelect';
import FormInput from '../../form/FormInput';
import CustomDatePicker from '../../form/CustomDatePicker'; // Import the new component

type WomensHealthSectionProps = {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
};

const WomensHealthSection: React.FC<WomensHealthSectionProps> = ({ formData, dispatch }) => {
    
    const handleWomensHealthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        dispatch({ type: 'UPDATE_NESTED_FIELD', payload: { step: 'history', nestedKey: 'womensHealth', field: e.target.name, value: e.target.value } });
    };

    const handleDateChange = (name: string, value: string) => {
        dispatch({ type: 'UPDATE_NESTED_FIELD', payload: { step: 'history', nestedKey: 'womensHealth', field: name, value } });
    };

    const { womensHealth } = formData;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomDatePicker
                    label="Last Menstrual Period (LMP)"
                    name="lmp"
                    value={womensHealth.lmp}
                    onChange={(value) => handleDateChange('lmp', value)}
                />
                <FormSelect label="Are periods regular?" name="periodsRegular" value={womensHealth.periodsRegular} onChange={handleWomensHealthChange}>
                    <option value="">Select...</option><option value="Yes">Yes</option><option value="No">No</option>
                </FormSelect>
                <FormInput label="Number of Pregnancies" name="pregnancies" type="number" min="0" value={womensHealth.pregnancies} onChange={handleWomensHealthChange} />
                <FormInput label="Number of Live Births" name="liveBirths" type="number" min="0" value={womensHealth.liveBirths} onChange={handleWomensHealthChange} />
                <div className="md:col-span-2">
                    <FormSelect label="Any possibility of pregnancy now?" name="possibilityOfPregnancy" value={womensHealth.possibilityOfPregnancy} onChange={handleWomensHealthChange}>
                        <option value="">Select...</option><option value="Yes">Yes</option><option value="No">No</option><option value="Unsure">Unsure</option>
                    </FormSelect>
                </div>
                <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                    <h4 className="text-base font-semibold text-slate-700 mb-2">Screenings</h4>
                </div>
                <CustomDatePicker
                    label="Last Pap Smear Date"
                    name="lastPapSmearDate"
                    value={womensHealth.lastPapSmearDate || ''}
                    onChange={(value) => handleDateChange('lastPapSmearDate', value)}
                />
                <FormInput
                    label="Last Pap Smear Result"
                    name="lastPapSmearResult"
                    value={womensHealth.lastPapSmearResult || ''}
                    onChange={handleWomensHealthChange}
                />
                <CustomDatePicker
                    label="Last Mammogram Date"
                    name="lastMammogramDate"
                    value={womensHealth.lastMammogramDate || ''}
                    onChange={(value) => handleDateChange('lastMammogramDate', value)}
                />
                <FormInput
                    label="Last Mammogram Result"
                    name="lastMammogramResult"
                    value={womensHealth.lastMammogramResult || ''}
                    onChange={handleWomensHealthChange}
                />
            </div>
        </div>
    );
};

export default WomensHealthSection;