import React, { useEffect, useState } from 'react';
import { UsersIcon } from '../../../../components/icons';

interface CareTeamCardProps {
  patientId: string;
}

const CareTeamCard: React.FC<CareTeamCardProps> = ({ patientId }) => {
  const [network, setNetwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const query = `
          query GetPatientCareTeam($id: ID!) {
            patient(id: $id) {
              careTeam {
                professional {
                  id
                  name
                  role
                }
                type
                details
              }
            }
          }
        `;
        const res = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables: { id: patientId } })
        });
        if (res.ok) {
          const { data } = await res.json();
          if (data.patient) {
            setNetwork({
              relationships: data.patient.careTeam.map((rel: any) => ({
                professional: rel.professional,
                type: rel.type,
                details: rel.details ? JSON.parse(rel.details) : {}
              }))
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch care team', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetwork();
  }, [patientId]);

  if (loading) {
    return (
      <div className="bg-slate-50 p-4 rounded-lg animate-pulse">
        <div className="h-5 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!network || !network.relationships || network.relationships.length === 0) {
    return (
      <div className="bg-slate-50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-3">
          <UsersIcon size={18} className="text-sky-500" />
          Care Team
        </h4>
        <p className="text-sm text-slate-500 italic">No care team members assigned.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-4 rounded-lg">
      <h4 className="text-sm font-semibold text-slate-600 flex items-center gap-2 mb-3">
        <UsersIcon size={18} className="text-sky-500" />
        Care Team
      </h4>
      <div className="space-y-3">
        {network.relationships.map((rel: any, idx: number) => (
          <div key={idx} className="flex items-start justify-between p-3 bg-white rounded-md border border-slate-200 shadow-sm">
            <div>
              <div className="font-medium text-slate-800 text-sm">{rel.professional.name}</div>
              <div className="text-xs text-slate-500">{rel.professional.role}</div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 bg-sky-50 text-sky-700 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                {rel.type.replace(/_/g, ' ')}
              </span>
              {rel.details.condition && (
                <div className="text-[10px] text-slate-400 mt-1">for {rel.details.condition}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareTeamCard;
