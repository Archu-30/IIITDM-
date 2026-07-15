import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, LineChart, Box, Users } from 'lucide-react';

export function LoginIllustration() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30; // max 15px movement
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-full flex flex-col xl:flex-row items-center xl:items-start z-10" style={{ gap: '32px' }}>
      
      {/* 4 Feature Cards */}
      <div 
        className="grid flex-shrink-0" 
        style={{ 
          gridTemplateColumns: 'repeat(2, 200px)', 
          gap: '20px' 
        }}
      >
        <FeatureCard 
          icon={<ShieldCheck size={24} className="text-emerald-400" />}
          title="Secure & Reliable"
          desc="Enterprise security."
        />
        <FeatureCard 
          icon={<LineChart size={24} className="text-blue-400" />}
          title="Real-time Insights"
          desc="Live analytics."
        />
        <FeatureCard 
          icon={<Box size={24} className="text-purple-400" />}
          title="Asset Tracking"
          desc="Track everything."
        />
        <FeatureCard 
          icon={<Users size={24} className="text-amber-400" />}
          title="Role-Based"
          desc="Granular control."
        />
      </div>

    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: { y: 0, backgroundColor: 'rgba(255,255,255,0.03)' },
        hover: { y: -4, backgroundColor: 'rgba(255,255,255,0.08)' }
      }}
      className="rounded-[22px] border border-white/10 backdrop-blur-xl flex flex-col justify-center items-start gap-[12px] cursor-default relative overflow-hidden group w-full"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.2)', height: '130px', padding: '20px' }}
    >
      {/* Animated Border Glow inside card */}
      <motion.div 
        className="absolute inset-0 border border-white/0 rounded-[22px] pointer-events-none"
        variants={{
          rest: { borderColor: 'rgba(255,255,255,0)', boxShadow: 'inset 0 0 0px rgba(59,130,246,0)' },
          hover: { borderColor: 'rgba(255,255,255,0.2)', boxShadow: 'inset 0 0 20px rgba(59,130,246,0.15)' }
        }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="w-[40px] h-[40px] rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] relative z-10 flex-shrink-0">
        <motion.div
          variants={{
            rest: { rotate: 0 },
            hover: { rotate: 360, transition: { duration: 0.8, ease: "anticipate" } }
          }}
        >
          {icon}
        </motion.div>
      </div>
      <div className="relative z-10 flex-shrink-0">
        <h4 className="text-[#FFFFFF] font-[700] mb-[4px]" style={{ fontSize: '15px' }}>{title}</h4>
        <p className="text-slate-400 font-[400] text-[12px] leading-tight">{desc}</p>
      </div>
    </motion.div>
  );
}
