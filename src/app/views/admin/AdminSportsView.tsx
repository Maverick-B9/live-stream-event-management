import React from 'react';
import { Link } from 'react-router';
import { useEvent } from '../../contexts/EventContext';
import { ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function AdminSportsView() {
  const { sports } = useEvent();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="flex items-center gap-4 px-6 py-3 border-b border-gray-800 sticky top-0 bg-gray-950 z-10">
        <Link to="/admin" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-bold text-white">Sports & Scoring Schemas</h1>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {sports.map(sport => {
          // @ts-ignore
          const Icon = Icons[sport.icon] || Icons.Trophy;
          const schema = sport.scoringSchema;
          return (
            <div key={sport.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-white">{sport.name}</h3>
                  <span className="text-xs text-gray-400">{sport.gender === 'men' ? 'Men' : 'Women'}</span>
                </div>
                <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
                  <span>{schema.periodLabel} × {schema.maxPeriods}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-gray-700 text-gray-500 uppercase">
                    <tr>
                      <th className="text-left pb-2 pr-4">Key</th>
                      <th className="text-left pb-2 pr-4">Label</th>
                      <th className="text-left pb-2 pr-4">Type</th>
                      <th className="text-center pb-2 pr-4">Primary</th>
                      <th className="text-center pb-2">Show in Card</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.fields.map(field => (
                      <tr key={field.key} className="border-b border-gray-800">
                        <td className="py-2 pr-4 font-mono text-gray-400">{field.key}</td>
                        <td className="py-2 pr-4 text-gray-300">{field.label}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${field.type === 'number' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {field.type}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-center">
                          {field.isPrimary ? <span className="text-amber-400">★</span> : <span className="text-gray-700">—</span>}
                        </td>
                        <td className="py-2 text-center">
                          {field.showInCard ? <span className="text-green-400">✓</span> : <span className="text-gray-700">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {sports.length === 0 && (
          <div className="text-center text-gray-500 py-12">Sports loading from Firestore...</div>
        )}
      </div>
    </div>
  );
}
