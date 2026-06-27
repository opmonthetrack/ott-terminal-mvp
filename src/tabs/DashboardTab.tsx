import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { OTTProfileCard } from "../components/OTTProfileCard";

type DashboardTabProps = {
  walletAddress: string;
};

export function DashboardTab({ walletAddress }: DashboardTabProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-white/70" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <OTTProfileCard walletAddress={walletAddress} />

      <div className="border border-white/10 bg-white/[0.02] p-8">
        <p className="font-mono text-[10px] text-white/35 uppercase tracking-[0.35em] mb-4">
          Dashboard
        </p>

        <h2 className="font-orbitron text-2xl font-black uppercase mb-4">
          XRPL OTT Terminal Dashboard
        </h2>

        <p className="font-mono text-sm text-white/45 leading-relaxed">
          Dashboard hersteld. Vanaf hier bouwen we veilig verder.
        </p>
      </div>
    </div>
  );
}
