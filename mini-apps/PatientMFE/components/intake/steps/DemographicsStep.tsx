import React from 'react';
import { useIntake } from '../../../context/IntakeContext';
import FormInput from '../../form/FormInput';
import FormSelect from '../../form/FormSelect';
import CustomDatePicker from '../../form/CustomDatePicker';

const DemographicsStep: React.FC = () => {
    const { state, dispatch, validationErrors } = useIntake();
    const { demographics } = state.formData;

    const handleChange = (field: string, value: any) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'demographics', field, value } });
    };
    
    const handleDobChange = (value: string) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'demographics', field: 'dob', value } });
    };


    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Patient Demographics</h2>
            <p className="text-sm text-slate-600">Enter the patient's basic identifying and contact information.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="First Name"
                    value={demographics.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    error={validationErrors.Demographics?.find(e => e.includes('First Name'))}
                />
                <FormInput
                    label="Last Name"
                    value={demographics.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    error={validationErrors.Demographics?.find(e => e.includes('Last Name'))}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <CustomDatePicker
                    label="Date of Birth"
                    value={demographics.dob}
                    onChange={(value) => handleDobChange(value)}
                    required
                    error={validationErrors.Demographics?.find(e => e.includes('Date of Birth'))}
                />
                <FormSelect
                    label="Sex (Assigned at Birth)"
                    value={demographics.sex}
                    onChange={(e) => handleChange('sex', e.target.value)}
                >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </FormSelect>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                    label="Gender"
                    value={demographics.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                >
                    <option value="">Select...</option>
                    <option value="Man">Man</option>
                    <option value="Woman">Woman</option>
                    <option value="Girl">Girl</option>
                    <option value="Boy">Boy</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                </FormSelect>
                <FormSelect
                    label="Blood Type (Self-Reported)"
                    value={demographics.bloodType}
                    onChange={(e) => handleChange('bloodType', e.target.value)}
                >
                    <option value="Unknown">Unknown</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                </FormSelect>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                    label="Phone"
                    type="tel"
                    value={demographics.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                />
                 <FormInput
                    label="Email"
                    type="email"
                    value={demographics.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                />
            </div>

            <FormInput
                label="Address"
                value={demographics.address}
                onChange={(e) => handleChange('address', e.target.value)}
            />
        </div>
    );
};

export default DemographicsStep;