import React from 'react';
import { analyticsMock } from '@/lib/mockData';
import { Line, Radar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, ArcElement, Tooltip, Legend);

const HeatmapGrid = ({ data }) => {
  // simple calendar-like grid for last 30 days
  return (
    <div className="grid grid-cols-7 gap-1">
      {data.map((d) => {
        const intensity = d.count; // 0-5
        const bg = intensity === 0 ? 'bg-slate-100' : intensity <= 2 ? 'bg-emerald-200' : intensity <= 4 ? 'bg-emerald-400' : 'bg-emerald-700 text-white';
        return (
          <div key={d.day} className={`${bg} p-3 rounded` } title={`Day ${d.day}: ${d.count}`}>
            <div className="text-xs text-center">{d.day}</div>
          </div>
        );
      })}
    </div>
  );
};

export default function AnalyticsDashboard({ demo = true }) {
  const { heatmap, consistency, radar, positiveNegative } = analyticsMock;

  const lineData = {
    labels: consistency.map((c) => c.month),
    datasets: [
      {
        label: 'Consistency (%)',
        data: consistency.map((c) => c.value),
        fill: false,
        borderColor: '#059669',
        tension: 0.3
      }
    ]
  };

  const radarData = {
    labels: Object.keys(radar),
    datasets: [
      {
        label: 'User Metrics',
        data: Object.values(radar),
        backgroundColor: 'rgba(34,197,94,0.15)',
        borderColor: 'rgba(34,197,94,0.9)'
      }
    ]
  };

  const pieData = {
    labels: ['Positive', 'Negative'],
    datasets: [
      {
        data: [positiveNegative.positive, positiveNegative.negative],
        backgroundColor: ['#10B981', '#EF4444']
      }
    ]
  };

  return (
    <div className="space-y-6">
      {demo && (
        <div className="text-sm text-slate-600">Showing demo analytics (mock data)</div>
      )}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Habit Completion Heatmap (last 30 days)</h3>
            <HeatmapGrid data={heatmap} />
          </div>
        </div>

        <div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Positive vs Negative</h3>
            <Pie data={pieData} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Consistency Over Months</h3>
          <Line data={lineData} />
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Composite Radar Metrics</h3>
          <Radar data={radarData} />
        </div>
      </div>
    </div>
  );
}
