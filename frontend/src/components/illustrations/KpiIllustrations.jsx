import React from 'react';
import { motion } from 'framer-motion';

// Shared Defs for glass effects
const SharedDefs = () => (
  <defs>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
      <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
      <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
    </linearGradient>
    <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f59e0b" />
      <stop offset="100%" stopColor="#d97706" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ef4444" />
      <stop offset="100%" stopColor="#b91c1c" />
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#3b82f6" />
      <stop offset="100%" stopColor="#1d4ed8" />
    </linearGradient>
    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#a855f7" />
      <stop offset="100%" stopColor="#7e22ce" />
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
);

/* ==============================================================
   ADMIN DASHBOARD ILLUSTRATIONS
   ============================================================== */

export const InventoryCrates = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.g animate={{ y: isHovered ? -2 : 0 }} transition={{ type: 'spring' }}>
      {/* Bottom Left Crate */}
      <polygon points="10,25 20,30 20,20 10,15" fill="url(#blueGrad)" fillOpacity="0.8" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
      <polygon points="20,30 30,25 30,15 20,20" fill="url(#purpleGrad)" fillOpacity="0.8" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
      <polygon points="10,15 20,20 30,15 20,10" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
      
      {/* Top Crate */}
      <motion.g animate={{ y: isHovered ? -4 : 0 }} transition={{ type: 'spring', delay: 0.05 }}>
        <polygon points="15,18 25,23 25,13 15,8" fill="url(#blueGrad)" fillOpacity="0.9" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        <polygon points="25,23 35,18 35,8 25,13" fill="url(#purpleGrad)" fillOpacity="0.9" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
        <polygon points="15,8 25,13 35,8 25,3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1" />
        
        {/* Crystal Highlight */}
        <line x1="25" y1="13" x2="25" y2="23" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      </motion.g>
    </motion.g>
  </svg>
);

export const CrystalCoin = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    {/* Energy Ring */}
    <motion.circle 
      cx="20" cy="20" r="16" 
      stroke="url(#glassGrad)" strokeWidth="1.5" strokeDasharray="4 4" fill="none"
      animate={{ rotate: isHovered ? 180 : 0, scale: isHovered ? 1.1 : 1 }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      style={{ transformOrigin: 'center' }}
    />
    <motion.circle cx="20" cy="20" r="12" fill="url(#amberGrad)" fillOpacity="0.8" stroke="url(#glassGrad)" strokeWidth="1" />
    <motion.circle cx="20" cy="20" r="12" fill="url(#glassGrad)" />
    
    <motion.text 
      x="20" y="25" fontSize="16" fill="#fff" fontWeight="900" textAnchor="middle"
      style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))' }}
    >
      ₹
    </motion.text>
  </svg>
);

export const EmptyCrate = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    {/* Transparent Crate Frame */}
    <polygon points="10,25 20,30 30,25 20,20" fill="rgba(255,0,0,0.1)" stroke="url(#glassGrad)" strokeWidth="1" />
    <polygon points="10,15 10,25 20,30 20,20" fill="rgba(255,0,0,0.05)" stroke="url(#glassGrad)" strokeWidth="1" />
    <polygon points="30,15 30,25 20,30 20,20" fill="rgba(255,0,0,0.05)" stroke="url(#glassGrad)" strokeWidth="1" />
    
    {/* Warning Crystal */}
    <motion.polygon 
      points="20,10 23,16 20,22 17,16" 
      fill="url(#redGrad)" 
      filter="url(#glow)"
      animate={{ y: isHovered ? -3 : 0, opacity: isHovered ? 1 : 0.8 }}
      transition={{ type: 'spring' }}
    />
    
    {/* Broken pieces */}
    <polygon points="13,24 16,26 14,27" fill="rgba(255,255,255,0.6)" />
    <polygon points="26,22 28,24 25,25" fill="rgba(255,255,255,0.4)" />
  </svg>
);

export const LowStockGauge = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    {/* Cylinder Base */}
    <ellipse cx="20" cy="30" rx="12" ry="4" fill="rgba(0,0,0,0.2)" />
    <path d="M8,15 v15 a12,4 0 0,0 24,0 v-15" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    
    {/* Amber Liquid */}
    <path d="M8,25 v5 a12,4 0 0,0 24,0 v-5 a12,4 0 0,1 -24,0" fill="url(#amberGrad)" fillOpacity="0.8" />
    
    {/* Gauge Overlay */}
    <line x1="14" y1="12" x2="14" y2="28" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2 2" />
    <motion.circle cx="14" cy="22" r="2" fill="#f59e0b" filter="url(#glow)" animate={{ cy: isHovered ? 25 : 22 }} />
  </svg>
);


/* ==============================================================
   CUSTOMER DASHBOARD ILLUSTRATIONS
   ============================================================== */

export const FloatingPackage = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.g animate={{ y: isHovered ? -3 : 0 }} transition={{ type: 'spring' }}>
      <polygon points="20,10 32,16 20,22 8,16" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      <polygon points="8,16 20,22 20,34 8,28" fill="url(#blueGrad)" fillOpacity="0.7" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <polygon points="32,16 20,22 20,34 32,28" fill="url(#purpleGrad)" fillOpacity="0.7" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <line x1="20" y1="22" x2="20" y2="34" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      <line x1="14" y1="13" x2="26" y2="19" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
    </motion.g>
  </svg>
);

export const CrystalFolders = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.g animate={{ y: isHovered ? -4 : 0 }} transition={{ type: 'spring' }}>
      {/* Back folder */}
      <path d="M6,14 L12,14 L15,18 L34,18 L34,32 L6,32 Z" fill="url(#blueGrad)" fillOpacity="0.6" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      {/* Front folder */}
      <motion.path 
        d="M8,18 L14,18 L17,22 L36,22 L36,36 L8,36 Z" 
        fill="url(#glassGrad)" 
        stroke="rgba(255,255,255,0.9)" 
        strokeWidth="1.5"
        animate={{ x: isHovered ? 2 : 0, y: isHovered ? 2 : 0 }}
      />
    </motion.g>
  </svg>
);

export const AmberWarningContainer = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.g animate={{ rotate: isHovered ? [0, -5, 5, -5, 0] : 0 }} transition={{ duration: 0.5 }}>
      <rect x="8" y="14" width="24" height="20" rx="4" fill="url(#amberGrad)" fillOpacity="0.6" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      <path d="M14,14 L14,10 C14,8 26,8 26,10 L26,14" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="24" r="4" fill="#fff" filter="url(#glow)" />
      <line x1="20" y1="22" x2="20" y2="25" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="20" y1="26" x2="20" y2="26.5" stroke="#f59e0b" strokeWidth="1.5" />
    </motion.g>
  </svg>
);


/* ==============================================================
   SUPER ADMIN DASHBOARD ILLUSTRATIONS
   ============================================================== */

export const FuturisticTowers = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.g animate={{ y: isHovered ? -3 : 0 }} transition={{ type: 'spring' }}>
      {/* Left Tower */}
      <rect x="8" y="15" width="10" height="20" rx="2" fill="url(#blueGrad)" fillOpacity="0.8" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
      <line x1="13" y1="15" x2="13" y2="35" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
      
      {/* Right Tower */}
      <motion.rect x="22" y="10" width="10" height="25" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" animate={{ y: isHovered ? -2 : 0 }} />
      <line x1="27" y1="10" x2="27" y2="35" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
      
      {/* Connecting Bridge */}
      <rect x="18" y="22" width="4" height="4" fill="#fff" filter="url(#glow)" />
    </motion.g>
  </svg>
);

export const PremiumShield = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.path 
      d="M20,6 L8,10 L8,20 C8,28 13,33 20,36 C27,33 32,28 32,20 L32,10 Z" 
      fill="url(#glassGrad)" 
      stroke="rgba(255,255,255,0.9)" 
      strokeWidth="1.5"
      animate={{ scale: isHovered ? 1.05 : 1 }}
    />
    <path d="M20,6 L20,36 C27,33 32,28 32,20 L32,10 Z" fill="url(#blueGrad)" fillOpacity="0.4" />
    <motion.circle cx="20" cy="18" r="4" fill="#fff" filter="url(#glow)" animate={{ scale: isHovered ? 1.2 : 1 }} />
  </svg>
);

export const ConnectedBuildings = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.path d="M8,26 L16,18 L32,24" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" animate={{ strokeDashoffset: isHovered ? 10 : 0 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
    <rect x="6" y="24" width="8" height="10" rx="1" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
    <rect x="14" y="14" width="8" height="12" rx="1" fill="url(#purpleGrad)" fillOpacity="0.7" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
    <rect x="28" y="20" width="8" height="12" rx="1" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="1" />
  </svg>
);

export const LogisticsWarehouse = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.path d="M6,20 L20,12 L34,20 L34,32 L6,32 Z" fill="url(#blueGrad)" fillOpacity="0.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" animate={{ y: isHovered ? -2 : 0 }} />
    <polygon points="6,20 20,12 34,20 20,28" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.9)" strokeWidth="1" />
    <rect x="16" y="24" width="8" height="8" fill="#fff" fillOpacity="0.4" />
  </svg>
);

export const CrystalVault = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <rect x="8" y="10" width="24" height="22" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
    <circle cx="20" cy="21" r="5" fill="url(#amberGrad)" filter="url(#glow)" />
    <motion.path d="M20,16 A5,5 0 0,1 25,21" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" animate={{ rotate: isHovered ? 180 : 0 }} style={{ transformOrigin: '20px 21px' }} />
  </svg>
);

export const ConnectedTeam = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <line x1="20" y1="16" x2="12" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    <line x1="20" y1="16" x2="28" y2="26" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
    <motion.circle cx="20" cy="14" r="5" fill="url(#glassGrad)" stroke="#fff" strokeWidth="1.5" animate={{ y: isHovered ? -2 : 0 }} filter="url(#glow)" />
    <circle cx="12" cy="26" r="4" fill="url(#blueGrad)" stroke="#fff" strokeWidth="1" />
    <circle cx="28" cy="26" r="4" fill="url(#purpleGrad)" stroke="#fff" strokeWidth="1" />
  </svg>
);

export const FloatingTicket = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.g animate={{ rotate: isHovered ? -10 : -5, y: isHovered ? -4 : 0 }} style={{ transformOrigin: 'center' }}>
      <path d="M10,12 L30,12 A3,3 0 0,0 30,18 A3,3 0 0,1 30,24 A3,3 0 0,0 30,30 L10,30 A3,3 0 0,0 10,24 A3,3 0 0,1 10,18 A3,3 0 0,0 10,12 Z" fill="url(#redGrad)" fillOpacity="0.7" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
      <circle cx="16" cy="21" r="2" fill="#fff" />
      <circle cx="24" cy="21" r="2" fill="#fff" />
    </motion.g>
  </svg>
);

export const CrystalWallet = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.rect x="8" y="14" width="24" height="16" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" animate={{ y: isHovered ? -2 : 0 }} />
    <path d="M28,18 L32,18 L32,26 L28,26 Z" fill="url(#amberGrad)" stroke="#fff" strokeWidth="1" />
    <circle cx="30" cy="22" r="1" fill="#fff" />
  </svg>
);

export const LuxuryBadge = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.path d="M20,6 L30,16 L20,26 L10,16 Z" fill="url(#amberGrad)" fillOpacity="0.9" stroke="#fff" strokeWidth="1.5" filter="url(#glow)" animate={{ scale: isHovered ? 1.1 : 1 }} />
    <path d="M15,22 L15,34 L20,30 L25,34 L25,22" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
  </svg>
);

export const GlassOrb = ({ isHovered }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <SharedDefs />
    <motion.circle cx="20" cy="20" r="12" fill="url(#blueGrad)" fillOpacity="0.6" stroke="url(#glassGrad)" strokeWidth="2" animate={{ scale: isHovered ? 1.05 : 1 }} />
    <circle cx="20" cy="20" r="8" fill="url(#purpleGrad)" filter="url(#glow)" />
    <motion.circle cx="17" cy="17" r="3" fill="#fff" fillOpacity="0.8" animate={{ opacity: isHovered ? 1 : 0.6 }} />
  </svg>
);
