import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const IllustrationWrapper = ({ 
  children, 
  gradient = ['#3b82f6', '#06b6d4'],
  className = ''
}) => {
  const ref = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
        background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)`,
        boxShadow: isHovered 
          ? `0 20px 40px -10px ${gradient[0]}80, inset 0 1px 2px rgba(255,255,255,0.7), inset 0 -1px 2px rgba(0,0,0,0.1)`
          : `0 8px 20px -5px rgba(0,0,0,0.1), inset 0 1px 1px rgba(255,255,255,0.25)`,
        backdropFilter: isHovered ? 'blur(20px)' : 'blur(12px)',
        WebkitBackdropFilter: isHovered ? 'blur(20px)' : 'blur(12px)',
        border: `1px solid rgba(255,255,255,0.2)`,
      }}
      whileHover={{ scale: 1.08, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative w-[58px] h-[58px] rounded-[18px] flex items-center justify-center cursor-pointer overflow-visible flex-shrink-0 ${className}`}
    >
      {/* Outer Glow */}
      <motion.div
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 -z-10 blur-xl rounded-[18px]"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
        }}
      />
      
      {/* Glossy Reflection Highlight */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, top: isHovered ? '10%' : '0%' }}
        transition={{ duration: 0.4 }}
        className="absolute left-[10%] right-[10%] h-[40%] rounded-full pointer-events-none mix-blend-overlay"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.8) 0%, transparent 70%)',
          transform: 'translateZ(20px)'
        }}
      />

      {/* SVG Illustration Container (with z-translation for parallax) */}
      <motion.div 
        className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none"
        style={{ transform: 'translateZ(30px)' }}
      >
        {React.cloneElement(children, { isHovered })}
      </motion.div>
    </motion.div>
  );
};
