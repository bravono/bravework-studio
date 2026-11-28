"use client";

interface MetricChartProps {
  title: string;
  value: number;
  unit?: string;
  maxValue?: number;
  threshold?: number;
}

export default function MetricChart({
  title,
  value,
  unit = "%",
  maxValue = 100,
  threshold = 80,
}: MetricChartProps) {
  const percentage = (value / maxValue) * 100;
  const isWarning = value > threshold;

  const getColor = () => {
    if (isWarning) return "bg-red-500";
    if (percentage > 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-gray-900">
            {value}
            <span className="text-lg text-gray-600 ml-1">{unit}</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
