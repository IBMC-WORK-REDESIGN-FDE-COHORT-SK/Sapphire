import Sidebar from "@/components/sidebar";
import PromotionRibbon from "@/components/PromotionRibbon";
import { useAuth } from "@/hooks/useAuth";
import { useActivePromotion } from "@/hooks/useActivePromotion";
import { useEffect } from "react";
import { trackPage } from "@/lib/analytics";
import { Activity, Heart, BarChart3, Moon } from "lucide-react";

/**
 * Metrics page — health metrics overview.
 * ADF-9: PromotionRibbon rendered as the first element inside page content.
 */
export default function Metrics() {
  const { user } = useAuth();
  const { promotion } = useActivePromotion();

  useEffect(() => {
    trackPage("Metrics", { userId: user?.email });
  }, [user?.email]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center h-16 px-8">
            <h1 className="text-xl font-semibold text-slate-900">Health Metrics</h1>
          </div>
        </header>

        {/* ADF-9: Promotional ribbon — first element inside page content */}
        <PromotionRibbon promotion={promotion} />

        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Your Metrics</h2>
              <p className="text-slate-600">Track your health metrics over time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Heart Rate", icon: Heart, colour: "text-red-600", bg: "bg-red-50", value: "— BPM" },
                { label: "Steps", icon: Activity, colour: "text-blue-600", bg: "bg-blue-50", value: "— steps" },
                { label: "Blood Pressure", icon: BarChart3, colour: "text-green-600", bg: "bg-green-50", value: "—/— mmHg" },
                { label: "Sleep", icon: Moon, colour: "text-purple-600", bg: "bg-purple-50", value: "— h" },
              ].map(({ label, icon: Icon, colour, bg, value }) => (
                <div key={label} className={`${bg} rounded-xl p-6 flex flex-col gap-2`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${colour}`} />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
