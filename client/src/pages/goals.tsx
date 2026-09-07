import Sidebar from "@/components/sidebar";
import PromotionRibbon from "@/components/PromotionRibbon";
import { useAuth } from "@/hooks/useAuth";
import { useActivePromotion } from "@/hooks/useActivePromotion";
import { useEffect } from "react";
import { trackPage } from "@/lib/analytics";
import { Target, CheckCircle2, Clock } from "lucide-react";

/**
 * Goals page — wellness goal tracking.
 * ADF-9: PromotionRibbon rendered as the first element inside page content.
 */
export default function Goals() {
  const { user } = useAuth();
  const { promotion } = useActivePromotion();

  useEffect(() => {
    trackPage("Goals", { userId: user?.email });
  }, [user?.email]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center h-16 px-8">
            <h1 className="text-xl font-semibold text-slate-900">My Goals</h1>
          </div>
        </header>

        {/* ADF-9: Promotional ribbon — first element inside page content */}
        <PromotionRibbon promotion={promotion} />

        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Wellness Goals</h2>
              <p className="text-slate-600">Set and track your personal health goals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Active Goals", icon: Target, colour: "text-blue-600", bg: "bg-blue-50", count: 0 },
                { label: "Completed", icon: CheckCircle2, colour: "text-green-600", bg: "bg-green-50", count: 0 },
                { label: "In Progress", icon: Clock, colour: "text-amber-600", bg: "bg-amber-50", count: 0 },
              ].map(({ label, icon: Icon, colour, bg, count }) => (
                <div key={label} className={`${bg} rounded-xl p-6 flex flex-col gap-2`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${colour}`} />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
