import type { Api } from '../../../api_contract/patient';

export interface RxNormConcept {
    rxcui: string;
    name: string;
    dose: string;
    form: string;
}

const mockRxNormDb: RxNormConcept[] = [
    // Lisinopril
    { rxcui: '206765', name: 'lisinopril 2.5 MG Oral Tablet [Zestril]', dose: '2.5 MG', form: 'Oral Tablet' },
    { rxcui: '206766', name: 'lisinopril 5 MG Oral Tablet [Zestril]', dose: '5 MG', form: 'Oral Tablet' },
    { rxcui: '206767', name: 'lisinopril 10 MG Oral Tablet [Zestril]', dose: '10 MG', form: 'Oral Tablet' },
    { rxcui: '206768', name: 'lisinopril 20 MG Oral Tablet [Zestril]', dose: '20 MG', form: 'Oral Tablet' },
    { rxcui: '1361393', name: 'lisinopril 1 MG/ML Oral Solution [Qbrelis]', dose: '1 MG/ML', form: 'Oral Solution' },
    // Jentadueto
    { rxcui: '1243026', name: 'linagliptin 2.5 MG / metformin hydrochloride 1000 MG Oral Tablet [Jentadueto]', dose: '2.5 MG', form: 'Oral Tablet' },
    { rxcui: '1243034', name: 'linagliptin 2.5 MG / metformin hydrochloride 500 MG Oral Tablet [Jentadueto]', dose: '2.5 MG', form: 'Oral Tablet' },
    // Other
    { rxcui: '866924', name: 'atorvastatin 10 MG Oral Tablet [Lipitor]', dose: '10 MG', form: 'Oral Tablet' },
    { rxcui: '866931', name: 'atorvastatin 20 MG Oral Tablet [Lipitor]', dose: '20 MG', form: 'Oral Tablet' },
    { rxcui: '197361', name: 'amlodipine 5 MG Oral Tablet [Norvasc]', dose: '5 MG', form: 'Oral Tablet' },
    { rxcui: '308056', name: 'amoxicillin 500 MG Oral Capsule', dose: '500 MG', form: 'Oral Capsule' },
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const rxNormService = {
  async search(query: string): Promise<RxNormConcept[]> {
    await delay(250); // Simulate network latency
    if (!query) {
      return [];
    }
    const lowerCaseQuery = query.toLowerCase();
    return mockRxNormDb.filter(concept =>
      concept.name.toLowerCase().includes(lowerCaseQuery)
    );
  },

  async findDrugs(searchTerm: string): Promise<Api.V1.DrugSuggestion[]> {
    if (!searchTerm || searchTerm.trim().length < 3) return [];
    
    const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(searchTerm)}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const suggestions: Api.V1.DrugSuggestion[] = [];
      
      if (data.drugGroup.conceptGroup) {
        data.drugGroup.conceptGroup.forEach((group: any) => {
          if (group.conceptProperties) {
            group.conceptProperties.forEach((prop: any) => {
              suggestions.push({
                rxcui: prop.rxcui,
                name: prop.name,
              });
            });
          }
        });
      }
      return suggestions.slice(0, 10); // Return top 10 suggestions
    } catch (error) {
      console.error("Failed to fetch drugs from RxNorm:", error);
      return [];
    }
  },
};
