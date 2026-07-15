import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const PremiumIcon = ({ 
  icon: Icon, 
  gradient = ['#3b82f6', '#06b6d4'],
  size = 'large', // 'large' for KPIs (58x58), 'small' for table actions, 'sidebar' for sidebar icons
  isActive = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const gradientId = `grad-${Math.random().toString(36).substr(2, 9)}`;

  // Size configurations
  let containerSize = 'w-[58px] h-[58px]';
  let iconSize = 28;
  let borderRadius = 'rounded-[18px]';
  
  if (size === 'small') {
    containerSize = 'w-10 h-10';
    iconSize = 18;
    borderRadius = 'rounded-xl';
  } else if (size === 'sidebar') {
    containerSize = 'w-9 h-9';
    iconSize = 20;
    borderRadius = 'rounded-[10px]';
  }

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.08, rotate: 4, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative flex items-center justify-center cursor-pointer ${containerSize} ${borderRadius} ${className}`}
      style={{
        background: isActive 
          ? `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)`
          : `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)`,
        boxShadow: isHovered || isActive
          ? `0 15px 35px -5px ${gradient[0]}40, inset 0 1px 1px rgba(255,255,255,0.4)`
          : `0 8px 20px -5px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.15)`,
        backdropFilter: isHovered || isActive ? 'blur(16px)' : 'blur(12px)',
        WebkitBackdropFilter: isHovered || isActive ? 'blur(16px)' : 'blur(12px)',
        border: isActive ? `1px solid ${gradient[0]}60` : '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Outer Ambient Glow */}
      <motion.div
        animate={{ opacity: isHovered || isActive ? 0.4 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 -z-10 blur-xl"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          borderRadius: 'inherit'
        }}
      />

      {/* SVG Gradient Definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
      </svg>

      <Icon 
        size={iconSize}
        style={{ 
          stroke: `url(#${gradientId})`,
          filter: isHovered || isActive ? `drop-shadow(0px 0px 8px ${gradient[0]}80)` : 'none',
          transition: 'filter 0.3s ease'
        }}
        strokeWidth={size === 'sidebar' ? 2 : 1.5}
      />
    </motion.div>
  );
};
