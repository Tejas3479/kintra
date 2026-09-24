'use client';

import React from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { Sparkles, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const PersonalityWorkspace: React.FC = () => {
  const { project } = useBrandStore();
  const identity = project.creativeIdentity;

  if (!identity || identity.personalityTraits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Brand Personality Architecture ({identity.personalityTraits.length} Primary Traits)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Grounded behavioral boundaries derived from the approved strategic positioning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {identity.personalityTraits.map((trait) => (
          <div
            key={trait.id}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-amber-300">{trait.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {Math.round(trait.confidence * 100)}% fit
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{trait.definition}</p>

              <div className="text-[11px] text-zinc-400 pt-1">
                <span className="text-zinc-500 font-semibold">Strategic Basis: </span>
                {trait.strategicBasis}
              </div>

              {/* Behavior Examples */}
              <div className="pt-2 border-t border-zinc-900 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500">Observable Behaviors:</span>
                <ul className="space-y-1">
                  {trait.behaviorExamples.map((ex, i) => (
                    <li key={i} className="text-[11px] text-zinc-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trait to Avoid */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-2.5 text-[11px] space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Anti-Trait to Avoid:
              </span>
              <p className="text-red-200/90 leading-tight">{trait.traitToAvoid}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
