import React from 'react';
import type { MedicalHistoryForm } from '../../../types';
import FormInput from '../../form/FormInput';
import FormRadioGroup from '../../form/FormRadioGroup';

type SocialHistorySectionProps = {
    formData: MedicalHistoryForm['history'];
    dispatch: React.Dispatch<any>;
};

const SocialHistorySection: React.FC<SocialHistorySectionProps> = ({ formData, dispatch }) => {
    
    const handleSocialHistoryChange = (field: string, value: string) => {
        dispatch({ type: 'UPDATE_NESTED_FIELD', payload: { step: 'history', nestedKey: 'socialHistory', field, value } });
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleSocialHistoryChange(e.target.name, e.target.value);
    }

    return (
        <div className="space-y-6">
            <FormRadioGroup
                label="Smoking Status"
                name="smokingStatus"
                options={['Never Smoked', 'Former Smoker', 'Current Smoker']}
                value={formData.socialHistory.smokingStatus}
                onChange={(value) => handleSocialHistoryChange('smokingStatus', value)}
                inline
            />
             <FormRadioGroup
                label="Alcohol Consumption"
                name="alcoholConsumption"
                options={['None', 'Rare', 'Socially', 'Regularly']}
                value={formData.socialHistory.alcoholConsumption}
                onChange={(value) => handleSocialHistoryChange('alcoholConsumption', value)}
                inline
            />
            <FormInput
                label="Occupation"
                name="occupation"
                value={formData.socialHistory.occupation}
                onChange={handleInputChange}
            />
            <FormInput
                label="Living Situation"
                name="livingSituation"
                value={formData.socialHistory.livingSituation}
                onChange={handleInputChange}
                placeholder="e.g., Lives with spouse, Lives alone..."
            />
        </div>
    );
};

export default SocialHistorySection;