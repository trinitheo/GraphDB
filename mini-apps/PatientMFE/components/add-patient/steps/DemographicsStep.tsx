import React from 'react';
// FIX: Import useIntake to get data from context.
import { useIntake } from '../../../context/IntakeContext';
import FormInput from '../../form/FormInput';
import FormSelect from '../../form/FormSelect';
import { calculateAge } from '../../../utils';
import CollapsibleSection from '../CollapsibleSection';
import CustomDatePicker from '../../form/CustomDatePicker';

// FIX: Component no longer needs props, it uses the useIntake hook.
const DemographicsStep: React.FC = () => {
    const { state, dispatch } = useIntake();
    const formData = state.formData.demographics;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'demographics', field: name, value } });
    };

    const handleDobChange = (value: string) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'demographics', field: 'dob', value } });
        const age = calculateAge(value);
        dispatch({ type: 'UPDATE_FIELD', payload: { step: 'demographics', field: 'age', value: age } });
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Patient Demographics</h2>
            <p className="text-sm text-slate-600">Enter the patient's basic information.</p>

            <CollapsibleSection title="Identifying Information" defaultOpen={true} zIndex="z-30">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        <FormInput label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                        <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <CustomDatePicker label="Date of Birth" name="dob" value={formData.dob} onChange={handleDobChange} required />
                        <FormInput label="Age" name="age" value={String(formData.age)} readOnly className="neu-sunken-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="">Select...</option>
                            <option value="Man">Man</option>
                            <option value="Woman">Woman</option>
                            <option value="Boy">Boy</option>
                            <option value="Girl">Girl</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Other">Other</option>
                        </FormSelect>
                        <FormSelect label="Sex (Assigned at Birth)" name="sex" value={formData.sex} onChange={handleChange}>
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </FormSelect>
                    </div>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Contact Information" defaultOpen={true} zIndex="z-20">
                 <div className="space-y-4">
                    <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                    <FormInput label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" />
                    <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} />
                 </div>
            </CollapsibleSection>

            <CollapsibleSection title="Insurance Information" defaultOpen={false} zIndex="z-10">
                 <div className="space-y-4">
                    <FormInput label="Insurance Provider" name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} />
                    <FormInput label="Policy Number" name="policyNumber" value={formData.policyNumber} onChange={handleChange} />
                    <FormInput label="Group Number" name="groupNumber" value={formData.groupNumber} onChange={handleChange} />
                 </div>
            </CollapsibleSection>
        </div>
    );
};

export default DemographicsStep;