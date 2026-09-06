import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface TemperaturePoint {
  timestamp: string;
  avg: number;
}

interface TemperatureDetailChartProps {
  data?: TemperaturePoint[];
  unit?: "C" | "F";
}

export default function TemperatureDetailChart({
  data = [
    { timestamp: "Mon", avg: 36.6 },
    { timestamp: "Tue", avg: 36.8 },
    { timestamp: "Wed", avg: 37.0 },
    { timestamp: "Thu", avg: 36.9 },
    { timestamp: "Fri", avg: 36.7 },
    { timestamp: "Sat", avg: 36.8 },
    { timestamp: "Sun", avg: 36.9 }
  ],
  unit = "C"
}: TemperatureDetailChartProps) {
  const chartData = data.map(d => ({
    ...d,
    displayValue: unit === "C" ? d.avg : Number(((d.avg * 9) / 5 + 32).toFixed(1))
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Body Temperature Trends</h2>
          <p className="text-sm text-slate-600">Daily average readings (°{unit})</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="timestamp" stroke="#64748B" />
            <YAxis stroke="#64748B" domain={unit === "C" ? [35, 40] : [95, 104]} />
            <Tooltip />
            <Line type="monotone" dataKey="displayValue" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
