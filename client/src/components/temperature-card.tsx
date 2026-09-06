import React, { useState } from "react";
import { Thermometer } from "lucide-react";
import MetricCard from "@/components/metric-card";

export interface TemperatureCardProps {
  valueCelsius?: number;
  timestamp?: string;
  status?: string;
  className?: string;
}

export default function TemperatureCard({
  valueCelsius = 36.8,
  timestamp,
  status = "Normal",
  className
}: TemperatureCardProps) {
  const [unit, setUnit] = useState<"C" | "F">(() => {
    return (localStorage.getItem("preferred_temp_unit") as "C" | "F") || "C";
  });

  const toggleUnit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextUnit = unit === "C" ? "F" : "C";
    setUnit(nextUnit);
    localStorage.setItem("preferred_temp_unit", nextUnit);
  };

  const displayValue = unit === "C" 
    ? valueCelsius.toFixed(1) 
    : ((valueCelsius * 9) / 5 + 32).toFixed(1);

  const getStatusDetails = (s: string) => {
    switch (s.toUpperCase()) {
      case "HYPOTHERMIA":
        return { text: "Low", color: "text-blue-700", bg: "bg-blue-100" };
      case "FEVER":
        return { text: "Fever", color: "text-amber-700", bg: "bg-amber-100" };
      case "HIGH_FEVER":
        return { text: "High Fever", color: "text-red-700", bg: "bg-red-100" };
      default:
        return { text: "Normal", color: "text-emerald-700", bg: "bg-emerald-100" };
    }
  };

  const statusInfo = getStatusDetails(status);

  return (
    <div className="relative">
      <MetricCard
        title="Body Temperature"
        value={`${displayValue}°${unit}`}
        unit={timestamp ? `Recorded ${timestamp}` : `Target: 36.5 - 37.5°C`}
        icon={Thermometer}
        iconColor="text-rose-500"
        iconBgColor="bg-rose-50"
        status={statusInfo.text}
        statusColor={statusInfo.color}
        statusBgColor={statusInfo.bg}
        className={className}
      />
      <button
        onClick={toggleUnit}
        className="absolute top-4 right-20 text-xs font-semibold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
      >
        Switch to °{unit === "C" ? "F" : "C"}
      </button>
    </div>
  );
}
