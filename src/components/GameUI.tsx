import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Target, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface GameUIProps {
  score: number;
  onMove: (dx: number, dz: number) => void;
  onDrop: () => void;
  isDropping: boolean;
}

export function GameUI({ score, onMove, onDrop, isDropping }: GameUIProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-3"
        >
          <Trophy className="text-yellow-400 w-6 h-6" />
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Prizes Collected</p>
            <p className="text-white text-2xl font-mono leading-none">{score}</p>
          </div>
        </motion.div>

        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3">
          <p className="text-white/60 text-[10px] uppercase tracking-wider font-bold">Status</p>
          <p className={`text-sm font-bold ${isDropping ? 'text-rose-500' : 'text-emerald-500'}`}>
            {isDropping ? 'CLAW ACTIVE' : 'READY TO GRAB'}
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center items-end gap-12 pb-8">
        {/* Joystick Area */}
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          <div className="grid grid-cols-3 gap-2 bg-black/40 p-4 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
            <div />
            <ControlButton icon={<ArrowUp />} onClick={() => onMove(0, -0.1)} disabled={isDropping} />
            <div />
            <ControlButton icon={<ArrowLeft />} onClick={() => onMove(-0.1, 0)} disabled={isDropping} />
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white/20 animate-pulse" />
            </div>
            <ControlButton icon={<ArrowRight />} onClick={() => onMove(0.1, 0)} disabled={isDropping} />
            <div />
            <ControlButton icon={<ArrowDown />} onClick={() => onMove(0, 0.1)} disabled={isDropping} />
            <div />
          </div>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Move Claw</p>
        </div>

        {/* Action Button */}
        <div className="pointer-events-auto flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDrop}
            disabled={isDropping}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-4 ${
              isDropping 
                ? 'bg-slate-800 border-slate-700 cursor-not-allowed opacity-50' 
                : 'bg-rose-600 border-rose-400 hover:bg-rose-500 active:shadow-inner'
            }`}
          >
            <Target className="w-10 h-10 text-white" />
          </motion.button>
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Drop Claw</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 text-white/30 text-[10px] max-w-[200px] leading-relaxed">
        <p>CONTROL THE CLAW USING THE JOYSTICK. POSITION IT OVER A PRIZE AND PRESS THE RED BUTTON TO GRAB.</p>
      </div>
    </div>
  );
}

function ControlButton({ icon, onClick, disabled }: { icon: React.ReactNode, onClick: () => void, disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
        disabled 
          ? 'text-white/10 cursor-not-allowed' 
          : 'text-white bg-white/10 hover:bg-white/20 active:bg-white/30'
      }`}
    >
      {icon}
    </button>
  );
}
