import {
  Newspaper,
  ExternalLink,
  Clock,
  Radio,
} from "lucide-react";

const news = [
  {
    title: "XRPL AI Starter Kit",
    source: "Ripple",
    time: "Today",
  },
  {
    title: "RLUSD Expansion",
    source: "Ripple",
    time: "Today",
  },
  {
    title: "CBDC Developments",
    source: "Global",
    time: "Today",
  },
  {
    title: "ISO 20022 Update",
    source: "Finance",
    time: "Today",
  },
  {
    title: "mBridge News",
    source: "BIS",
    time: "Today",
  },
  {
    title: "Fedwire Migration",
    source: "Federal Reserve",
    time: "Today",
  },
];

export function NewsWidget() {
  return (
    <div className="border border-white/10 bg-white/[0.02] p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/35 mb-2">
            Daily Intelligence
          </p>

          <h2 className="font-orbitron text-xl font-black uppercase">
            News Feed
          </h2>
        </div>

        <Radio className="text-white/60" size={18} />
      </div>

      <div className="space-y-3">
        {news.map((item) => (
          <div
            key={item.title}
            className="border border-white/10 bg-black hover:bg-white/[0.03] transition-all p-4 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Newspaper size={15} className="text-white/60" />

                  <p className="font-orbitron text-xs uppercase font-bold">
                    {item.title}
                  </p>
                </div>

                <div className="flex gap-4">
                  <span className="font-mono text-[10px] uppercase text-white/35">
                    {item.source}
                  </span>

                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-white/25">
                    <Clock size={10} />
                    {item.time}
                  </span>
                </div>
              </div>

              <ExternalLink
                size={15}
                className="text-white/20"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
