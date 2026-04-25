import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Users, UserPlus, Activity, ArrowLeft } from 'lucide-react';

export default function GraphNetworkView() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      
      const query = `
        query {
          professionals {
            id
            name
            role
            type
          }
          patients {
            id
            name
            age
            gender
            avatar
            careTeam {
              professional {
                id
              }
              type
              details
            }
          }
        }
      `;

      const response = await fetch('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch graph data');
      }

      const { data } = await response.json();
      
      const nodes: any[] = [];
      const links: any[] = [];
      
      // Add professional nodes
      data.professionals.forEach((p: any) => {
        nodes.push({ id: p.id, name: p.name, group: 'Professional', val: 2, ...p });
      });

      // Add patient nodes and build links
      data.patients.forEach((p: any) => {
        nodes.push({ id: p.id, name: p.name, group: 'Patient', val: 1, ...p });
        
        if (p.careTeam) {
          p.careTeam.forEach((rel: any) => {
            links.push({
              source: p.id,
              target: rel.professional.id,
              name: rel.type,
              details: rel.details ? JSON.parse(rel.details) : null
            });
          });
        }
      });

      setGraphData({ nodes, links });
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (node: any) => {
    setSelectedNode(node);
    try {
      if (node.group === 'Patient') {
        const query = `
          query GetPatientNetwork($id: ID!) {
            patient(id: $id) {
              id
              name
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
          body: JSON.stringify({ query, variables: { id: node.id } })
        });
        if (res.ok) {
          const { data } = await res.json();
          // Map to the expected format for the UI
          setNodeDetails({
            patient: { id: data.patient.id, name: data.patient.name },
            relationships: data.patient.careTeam.map((rel: any) => ({
              professional: rel.professional,
              type: rel.type,
              details: rel.details ? JSON.parse(rel.details) : null
            }))
          });
        }
      } else {
        const query = `
          query GetProfessionalPatients($id: ID!) {
            professionals {
              id
              name
              role
              patients {
                patient {
                  id
                  name
                  age
                  gender
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
          body: JSON.stringify({ query, variables: { id: node.id } })
        });
        if (res.ok) {
          const { data } = await res.json();
          const professional = data.professionals.find((p: any) => p.id === node.id);
          if (professional) {
            setNodeDetails({
              professional: { id: professional.id, name: professional.name, role: professional.role },
              relationships: professional.patients.map((rel: any) => ({
                patient: rel.patient,
                type: rel.type,
                details: rel.details ? JSON.parse(rel.details) : null
              }))
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch node details', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-500" />
            Care Network Graph
          </h2>
          <p className="text-sm text-slate-500">Visualizing relationships between patients and healthcare professionals</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500"></div>
            <span>Patients</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span>Professionals</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph Container */}
        <div className="flex-1 relative" ref={containerRef}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
          ) : (
            <ForceGraph2D
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="name"
              nodeColor={node => node.group === 'Patient' ? '#0ea5e9' : '#10b981'}
              nodeRelSize={6}
              linkColor={() => '#cbd5e1'}
              linkDirectionalArrowLength={3.5}
              linkDirectionalArrowRelPos={1}
              onNodeClick={handleNodeClick}
              linkCanvasObjectMode={() => 'after'}
              linkCanvasObject={(link: any, ctx, globalScale) => {
                const MAX_FONT_SIZE = 4;
                const LABEL_NODE_MARGIN = graphData.nodes.length * 1.5;
                const start = link.source;
                const end = link.target;
                
                // ignore unbound links
                if (typeof start !== 'object' || typeof end !== 'object') return;

                const textPos = Object.assign(...['x', 'y'].map(c => ({
                  [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                })));

                const relLink = { x: end.x - start.x, y: end.y - start.y };
                const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;

                let textAngle = Math.atan2(relLink.y, relLink.x);
                if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
                if (textAngle < -Math.PI / 2) textAngle = -(Math.PI + textAngle);

                const fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / link.name.length);
                ctx.font = `${fontSize}px Sans-Serif`;
                const textWidth = ctx.measureText(link.name).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                ctx.save();
                ctx.translate(textPos.x, textPos.y);
                ctx.rotate(textAngle);

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#64748b';
                ctx.fillText(link.name, 0, 0);
                ctx.restore();
              }}
            />
          )}
        </div>

        {/* Details Sidebar */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto p-4 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
            <button 
              onClick={() => setSelectedNode(null)}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to full view
            </button>
            
            <div className="mb-6">
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                selectedNode.group === 'Patient' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedNode.group}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">{selectedNode.name}</h3>
              {selectedNode.role && <p className="text-slate-600 font-medium">{selectedNode.role}</p>}
              {selectedNode.age && <p className="text-slate-500">Age: {selectedNode.age}</p>}
            </div>

            {nodeDetails && (
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {selectedNode.group === 'Patient' ? 'Care Team' : 'Patients'}
                </h4>
                <div className="space-y-3">
                  {selectedNode.group === 'Patient' ? (
                    nodeDetails.relationships?.map((rel: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="font-medium text-slate-800">{rel.professional.name}</div>
                        <div className="text-xs text-slate-500 mb-2">{rel.professional.role}</div>
                        <div className="text-xs bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                          <span className="font-semibold text-slate-600">{rel.type}</span>
                          {rel.details.condition && <span className="ml-1 text-slate-500">for {rel.details.condition}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    nodeDetails.patients?.map((rel: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="font-medium text-slate-800">{rel.patient.name}</div>
                        <div className="text-xs text-slate-500 mb-2">Age: {rel.patient.age}</div>
                        <div className="text-xs bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                          <span className="font-semibold text-slate-600">{rel.relationship}</span>
                          {rel.details.since && <span className="ml-1 text-slate-500">since {rel.details.since}</span>}
                        </div>
                      </div>
                    ))
                  )}
                  
                  {((selectedNode.group === 'Patient' && nodeDetails.relationships?.length === 0) || 
                    (selectedNode.group === 'Professional' && nodeDetails.patients?.length === 0)) && (
                    <div className="text-sm text-slate-500 italic">No relationships found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
