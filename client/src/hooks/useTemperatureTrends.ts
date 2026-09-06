import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_TEMPERATURE_TRENDS } from "@/graphql/temperature";

export function useTemperatureTrends(userId?: string, initialPeriod: string = "WEEK") {
  const [period, setPeriod] = useState<string>(initialPeriod);
  const [unit, setUnit] = useState<"C" | "F">(() => {
    return (localStorage.getItem("preferred_temp_unit") as "C" | "F") || "C";
  });

  const { data, loading, error, refetch } = useQuery(GET_TEMPERATURE_TRENDS, {
    variables: {
      userId,
      period,
      unit: unit === "C" ? "CELSIUS" : "FAHRENHEIT"
    },
    fetchPolicy: "network-only"
  });

  const toggleUnit = () => {
    const next = unit === "C" ? "F" : "C";
    setUnit(next);
    localStorage.setItem("preferred_temp_unit", next);
  };

  return {
    period,
    setPeriod,
    unit,
    toggleUnit,
    trends: (data as any)?.temperatureTrends,
    loading,
    error,
    refetch
  };
}
