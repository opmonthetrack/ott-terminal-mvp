import { Wallet } from 'lucide-react';

interface HeaderProps {
  ottBalance: number;
}

export function Header({ ottBalance }: HeaderProps) {
  return (
    <header className="h-20 border-b border-gray-800 bg-black px-6 md:px-8 flex items-center justify-between font-sans sticky top-0 z-40 relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-ott-blue to-ott-pink mix-blend-screen" />
      <div className="flex items-center space-x-4 md:hidden">
        <h2 className="font-orbitron font-bold text-lg tracking-widest uppercase">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-ott-blue to-ott-pink">OTT</span><br/>
          Terminal
        </h2>
      </div>
      
      <div className="hidden md:flex flex-col">
        <div className="text-[10px] uppercase font-mono text-gray-500 tracking-[0.2em] mb-1">
          Stay humble, Stay positive, 589 steps ahead
        </div>
        <div className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-ott-blue to-ott-pink uppercase tracking-wider font-orbitron font-bold">
          OnTheTrack we got your back.
        </div>
      </div>

      <div className="flex space-x-6 items-center">
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase text-gray-500 font-mono tracking-widest mb-1">$OTT Balance</span>
          <span className="font-orbitron font-bold text-lg text-white">{ottBalance} OTT</span>
        </div>
        <div className="border border-ott-blue/50 p-2 shadow-[0_0_10px_rgba(43,130,255,0.2)]">
          <Wallet className="w-6 h-6 text-ott-pink" />
        </div>
      </div>
    </header>
  );
}
