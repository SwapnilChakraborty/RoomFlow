import React from 'react';

export function Logo({ className = "", showText = true }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative group">
        <div className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform overflow-hidden">
          <img src="/logo.png" alt="RoomFlow" className="w-9 h-9 object-contain" />
        </div>
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#4a3b2c] rounded-full border-2 border-white shadow-sm" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-serif text-2xl tracking-[0.1em] text-[#4a3b2c] leading-none font-normal uppercase">
            ROOM<span className="text-slate-400">FLOW</span>
          </span>
          <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2 leading-none">
            Proprietary Hotel OS v4.2
          </span>
        </div>
      )}
    </div>
  );
}
