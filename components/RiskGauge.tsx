import React from 'react';
import GaugeComponent from 'react-gauge-component';

interface RiskGaugeProps {
  score: number; // 0 to 100
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  // Check if dark mode is enabled
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div className="w-full max-w-[500px] mx-auto relative">
      <GaugeComponent
        type="semicircle"
        arc={{
          width: 0.2,
          padding: 0.005,
          cornerRadius: 1,
          subArcs: [
            {
              limit: 35,
              color: '#10B981', // Emerald (Safe)
              showTick: true,
              tooltip: { text: 'Niedriges Risiko' }
            },
            {
              limit: 70,
              color: '#F59E0B', // Amber (Mittel)
              showTick: true,
              tooltip: { text: 'Mittleres Risiko' }
            },
            {
              limit: 100,
              color: '#C42126', // Brand Red (Critical)
              showTick: true,
              tooltip: { text: 'Hohes Risiko' }
            }
          ]
        }}
        pointer={{
          type: "needle",
          elastic: true,
          animationDelay: 0,
          color: isDarkMode ? '#94A3B8' : '#64748B', // Light grey in dark mode, medium grey in light mode
          length: 0.80,
          width: 15,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (value) => value + '%',
            style: { 
              fontSize: '45px', 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fill: isDarkMode ? '#E2E8F0' : '#1F2937',
              textShadow: 'none' 
            },
            matchColorWithArc: true
          },
          tickLabels: {
            type: "outer",
            // Only show the main boundary ticks to keep it clean
            ticks: [
              { value: 35 },
              { value: 70 }
            ],
            defaultTickValueConfig: {
              hide: true // Hide numbers on ticks for cleaner look, or set to false if numbers wanted
            }
          }
        }}
        value={score}
        minValue={0}
        maxValue={100}
      />
      
      {/* Custom Labels */}
      <div className="flex justify-between px-10 -mt-6 relative z-10">
        <div className="flex flex-col items-center">
           <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sicher</span>
        </div>
        <div className="flex flex-col items-center">
           <span className="text-xs font-bold text-brand-red uppercase tracking-wider">Kritisch</span>
        </div>
      </div>
    </div>
  );
};