import { UserStats } from "@/components/dashboard/UserStats";
import { UserChart } from "@/components/dashboard/UserChart";
import { BigQuerySync } from "@/components/dashboard/BigQuerySync";

export default function Main() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <BigQuerySync />
      </div>
      <div className="space-y-4">
        <UserStats />
        <UserChart />
      </div>
    </div>
  );
}