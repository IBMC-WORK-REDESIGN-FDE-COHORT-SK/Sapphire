import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { ApolloError } from "@apollo/client";
import { format } from "date-fns";
import { GET_TEMPERATURE_HISTORY } from "@/graphql/temperature";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TemperatureTrendPoint {
  timestamp: string;
  min: number;
  max: number;
  avg: number;
  sampleCount?: number;
}

export interface TemperatureDetailChartProps {
  dataPoints?: TemperatureTrendPoint[];
  overallMin?: number | null;
  overallMax?: number | null;
  overallAvg?: number | null;
  unit?: "C" | "F";
  loading?: boolean;
  error?: ApolloError;
  /** userId used to fetch the history table (T022) */
  userId?: string;
}

// ─── History table (T022) ─────────────────────────────────────────────────────

interface HistoryRow {
  timestamp: string;
  value: number;
  unit: string;
  status?: string | null;
  sourceDeviceId?: string | null;
}

function TemperatureHistoryTable({ userId }: { userId?: string }) {
  const now = Date.now();
  const from = now - 30 * 24 * 60 * 60 * 1000; // last 30 days

  const { data, loading, error } = useQuery(GET_TEMPERATURE_HISTORY, {
    variables: { userId, from, to: now },
    fetchPolicy: "cache-and-network",
    skip: !userId
  });

  const rows: HistoryRow[] = (data as any)?.temperatureHistory ?? [];

  if (!userId) return null;
  if (loading && rows.length === 0)
    return <p className="text-sm text-slate-500 mt-4">Loading temperature history…</p>;
  if (error)
    return <p className="text-sm text-red-500 mt-4">Error loading history: {error.message}</p>;
  if (rows.length === 0)
    return <p className="text-sm text-slate-400 mt-4">No temperature history available.</p>;

  return (
    <div className="mt-6 overflow-x-auto">
      <h3 className="text-sm font-medium text-slate-900 mb-2">Recent Readings</h3>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {["Timestamp", "Value", "Unit", "Status", "Device"].map(h => (
              <th key={h} className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {rows.slice(0, 20).map((r, i) => (
            <tr key={i}>
              <td className="px-3 py-2 whitespace-nowrap text-slate-900">
                {format(new Date(r.timestamp), "MMM d, h:mm a")}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-900">{r.value}</td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-600">{r.unit}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {r.status ? (
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                    {r.status}
                  </span>
                ) : "—"}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-500 text-xs">
                {r.sourceDeviceId ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main chart component (T020) ──────────────────────────────────────────────

export default function TemperatureDetailChart({
  dataPoints = [],
  overallMin,
  overallMax,
  overallAvg,
  unit = "C",
  loading = false,
  error,
  userId
}: TemperatureDetailChartProps) {
  const yDomain: [number, number] = unit === "C" ? [35, 40] : [95, 104];

  const chartData = dataPoints.map(d => ({
    label: format(new Date(d.timestamp), unit === "C" ? "EEE HH:mm" : "EEE"),
    min: d.min,
    max: d.max,
    avg: d.avg
  }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Body Temperature Trends</h2>
          <p className="text-sm text-slate-600">Daily min / avg / max (°{unit})</p>
        </div>
        {(overallMin != null || overallMax != null || overallAvg != null) && (
          <div className="flex gap-4 text-xs text-slate-600">
            {overallMin != null && <span>Min: <strong>{overallMin}°{unit}</strong></span>}
            {overallAvg != null && <span>Avg: <strong>{overallAvg}°{unit}</strong></span>}
            {overallMax != null && <span>Max: <strong>{overallMax}°{unit}</strong></span>}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && dataPoints.length === 0 && (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm animate-pulse">
          Loading temperature trends…
        </div>
      )}

      {/* Error state — does not block sibling cards */}
      {error && !loading && (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-red-500">Unable to load trend data: {error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && dataPoints.length === 0 && (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          No temperature data available for this period.
        </div>
      )}

      {/* Chart */}
      {!loading && !error && dataPoints.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" stroke="#64748B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748B" domain={yDomain} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}°${unit}`} />
              <Legend />
              <Line type="monotone" dataKey="min" name={`Min °${unit}`} stroke="#93C5FD" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="avg" name={`Avg °${unit}`} stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="max" name={`Max °${unit}`} stroke="#FB923C" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History table (T022) */}
      <TemperatureHistoryTable userId={userId} />
    </div>
  );
}
