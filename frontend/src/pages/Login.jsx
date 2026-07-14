import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toastSuccess, toastError } from '../components/Toast';
import { Warehouse, Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Exit animation state
  const [isExiting, setIsExiting] = useState(false);

  // Input states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // References for Canvas
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });

  // Bounding boxes for focus glows
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  // Mouse move handler for card tilt (3 degrees max) & cursor radial light
  const handleMouseMove = (e) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    
    // Tilt calculations relative to screen center or card center
    const x = e.clientX - window.innerWidth / 2;
    const y = e.clientY - window.innerHeight / 2;
    const tiltX = -(y / (window.innerHeight / 2)) * 3; // Max 3 deg
    const tiltY = (x / (window.innerWidth / 2)) * 3;  // Max 3 deg
    setCardTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setCardTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Update global auth context (also writes to localStorage + axios header)
      login(token, user);

      // Keep App.jsx state in sync for legacy prop-drilling
      if (onLoginSuccess) onLoginSuccess(user);

      // Success Transition triggers exit state
      setIsExiting(true);

      setTimeout(() => {
        toastSuccess(`Welcome back, ${user.name}!`);

        if (user.role === 'super_admin') {
          navigate('/super-admin/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'seller') {
          navigate('/seller/dashboard');
        } else {
          navigate('/customer/inventory');
        }
      }, 700);
      
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toastError(errMsg);
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  // Canvas layers engine (Particles, Bezier trails, grid breathing, mouse glow)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Layer 3: 400 Floating Particles setup
    const particleCount = 400;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1, // 1-4px
        baseOpacity: Math.random() * 0.4 + 0.1,
        opacity: 0.2,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        twinkleVal: Math.random() * Math.PI,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
      });
    }

    // Layer 4: Bezier Light Trail (Thin glowing line leaving trail)
    let waveProgress = 0;
    const waveTrails = [];

    // Interpolated mouse coordinates
    let mx = canvas.width / 2;
    let my = canvas.height / 2;

    let time = 0;

    const render = () => {
      time += 0.01;

      // Clear base background (Layer 1: Shifting dark color + radial glow)
      ctx.fillStyle = '#090B15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Shifting background radial glow (Layer 1)
      const gradX = canvas.width * 0.5 + Math.cos(time * 0.3) * 150;
      const bgGrad = ctx.createRadialGradient(gradX, canvas.height * 0.5, 0, gradX, canvas.height * 0.5, 550);
      bgGrad.addColorStop(0, 'rgba(91, 108, 255, 0.08)');
      bgGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(gradX, canvas.height * 0.5, 550, 0, Math.PI * 2);
      ctx.fill();

      // Mouse radial glow spotlight (Layer 12: 250px radius, 12% opacity)
      mx += (mousePos.current.x - mx) * 0.08;
      my += (mousePos.current.y - my) * 0.08;
      const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 250);
      mouseGrad.addColorStop(0, 'rgba(79, 141, 255, 0.12)');
      mouseGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mx, my, 250, 0, Math.PI * 2);
      ctx.fill();

      // Layer 2: Grid Opacity Breathing (0.08 -> 0.12 -> 0.08)
      const gridOpacity = 0.10 + Math.sin(time * 2) * 0.02;
      ctx.strokeStyle = `rgba(91, 108, 255, ${gridOpacity})`;
      ctx.lineWidth = 1;
      const gridSize = 65;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Layer 3: Floating Particles (twinkling and drifting)
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Twinkle calculations
        p.twinkleVal += p.twinkleSpeed;
        const currentOpacity = p.baseOpacity * (0.5 + 0.5 * Math.sin(p.twinkleVal));

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(79, 141, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Layer 4: Bezier neon light trail curve
      waveProgress += 0.005;
      if (waveProgress > 1.0) {
        waveProgress = 0;
      }

      const p0 = { x: -100, y: canvas.height * 0.7 };
      const p1 = { x: canvas.width * 0.5, y: -200 + Math.sin(time * 0.5) * 150 };
      const p2 = { x: canvas.width + 100, y: canvas.height * 0.4 };

      // Calculate head coordinates
      const t = waveProgress;
      const hx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const hy = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

      // Add head coords to trailing list
      waveTrails.push({ x: hx, y: hy, life: 1.0 });

      // Draw active neon light trail
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(79, 141, 255, 0.7)'; // Blue neon
      ctx.shadowColor = '#4F8DFF';
      ctx.shadowBlur = 40; // Glow radius 40px

      ctx.beginPath();
      waveTrails.forEach((pt, index) => {
        pt.life -= 0.015; // Fade over time
        if (pt.life <= 0) {
          waveTrails.splice(index, 1);
          return;
        }

        ctx.fillStyle = `rgba(79, 141, 255, ${pt.life * 0.5})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }} // Page transition fade 0-0.6s
      className="min-h-screen flex flex-col md:flex-row bg-[#090B15] relative overflow-hidden"
    >
      {/* Background Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block pointer-events-none" />

      {/* Global CSS Style rules for animated button gradient and input focus highlight sweeps */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sweep-highlight {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-sweep {
          background: linear-gradient(90deg, transparent, rgba(91, 108, 255, 0.25), transparent);
          background-size: 200% 100%;
          animation: sweep-highlight 1.5s infinite;
        }
        @keyframes button-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .custom-btn-flow {
          background-size: 200% 200% !important;
          animation: button-flow 6s ease infinite !important;
        }
        @keyframes shine-sweep {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .btn-shine-overlay::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
          transform: skewX(-25deg);
          animation: shine-sweep 3s infinite;
        }
      `}} />

      {/* Brand Panel (Left) */}
      <div className="md:w-1/2 bg-slate-900 text-white flex flex-col justify-between p-8 md:p-16 relative overflow-hidden min-h-[30vh] md:min-h-screen z-10">
        
        {/* Subtle Animated Background Grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl" />

        {/* Logo Container (Absolute Top Left) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[40px] left-[60px] z-20 flex items-center gap-[16px]"
        >
          <motion.img 
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 3.0, ease: 'easeInOut' }}
            src="/rentalyze-logo.jpg" 
            alt="Rentalyze Logo" 
            className="h-[52px] w-auto max-w-[220px] object-contain mix-blend-screen" 
          />
          <span className="font-sans text-[34px] font-[800] tracking-[1.5px] text-[#FFFFFF] drop-shadow-md" style={{ fontFamily: 'Inter, sans-serif' }}>
            RENTALYZE
          </span>
        </motion.div>

        {/* Hero Pitch (Loads 0.6s - 1.5s) */}
        <div className="my-auto py-12 md:py-0 z-10 max-w-[560px] flex flex-col items-start text-left">
          
          {/* Subtle float animation every 10s */}
          <motion.h1 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            transition={{
              delay: 0.6,
              duration: 10,
              repeat: Infinity,
              repeatDelay: 0.5,
              ease: 'easeInOut'
            }}
            className="text-[42px] md:text-[56px] lg:text-[72px] font-[800] leading-[1.05] tracking-[-2px] bg-gradient-to-b from-white to-slate-200 bg-clip-text text-transparent"
          >
            Manage your<br />inventory with<br />
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">clarity.</span>
          </motion.h1>

          {/* Description Paragraph (Loads 0.8s - 1.6s, Opacity breathing 0.9 -> 1 -> 0.9) */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: [0.9, 1, 0.9], y: 0 }}
            transition={{
              delay: 0.8,
              y: { duration: 0.8 },
              opacity: { repeat: Infinity, duration: 4.0, ease: 'easeInOut' }
            }}
            className="text-[22px] text-slate-400 mt-6 font-medium leading-relaxed max-w-[520px]"
          >
            A comprehensive, premium management system<br className="hidden md:block" />
            designed to track assets, stock flows,<br className="hidden md:block" />
            and users seamlessly.
          </motion.p>
        </div>

        {/* Brand Footer */}
        <div className="z-10 text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Rentalyze Systems. All rights reserved.
        </div>
      </div>

      {/* Login Card (Right, loads 1.0s - 1.8s, floats 0 -> -6 -> 0 continuously over 8s) */}
      <div className="md:w-1/2 flex items-center justify-center p-6 md:p-16 bg-slate-50 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 45 }}
          animate={isExiting 
            ? { opacity: 0, scale: 0.98 } 
            : { opacity: 1, scale: 1, y: [0, -6, 0] }
          }
          transition={isExiting 
            ? { duration: 0.7 } 
            : {
                y: { repeat: Infinity, duration: 8.0, ease: 'easeInOut' },
                default: { duration: 0.8, delay: 1.0 }
              }
          }
          style={{
            transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
            boxShadow: '0 40px 120px rgba(0,0,0,.55)'
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 border border-slate-100/80 relative overflow-hidden"
        >
          {/* Moving glass reflection sweep overlay */}
          <motion.div 
            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
            transition={{ repeat: Infinity, duration: 15.0, ease: 'linear' }}
            className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.06)_50%,transparent_55%)] bg-[size:200%_200%]"
          />

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Sign In</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Field (Loads 1.4s - 2.0s) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              whileHover={{ y: -1.5 }}
              style={{
                borderColor: emailFocused ? '#5B6CFF' : '',
                boxShadow: emailFocused ? '0 0 15px rgba(91, 108, 255, 0.22)' : '',
                transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.2s'
              }}
              className="relative rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Highlight sweep overlay spreads left to right on focus */}
              {emailFocused && <div className="absolute inset-0 pointer-events-none animate-sweep z-0" />}

              <div className="relative z-10 flex items-center">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@inventory.com"
                  className="pl-10 block w-full px-4 py-3 rounded-xl border-none focus:outline-none focus:ring-0 focus:border-none bg-transparent text-slate-800 text-sm font-medium"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field (Loads 1.5s - 2.0s) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              whileHover={{ y: -1.5 }}
              style={{
                borderColor: passFocused ? '#5B6CFF' : '',
                boxShadow: passFocused ? '0 0 15px rgba(91, 108, 255, 0.22)' : '',
                transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.2s'
              }}
              className="relative rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Highlight sweep overlay spreads left to right on focus */}
              {passFocused && <div className="absolute inset-0 pointer-events-none animate-sweep z-0" />}

              <div className="relative z-10 flex items-center">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 block w-full px-4 py-3 rounded-xl border-none focus:outline-none focus:ring-0 focus:border-none bg-transparent text-slate-800 text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-0 h-full flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button (Loads 1.8s - 2.2s) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.4 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -3 }} // Lift 3px on hover
                whileTap={{ scale: 0.96 }} // Click scale compression
                className="w-full btn-shine-overlay custom-btn-flow flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark disabled:bg-primary/50 transition-all cursor-pointer relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-semibold text-slate-400">Demo Accounts</span>
            </div>
          </div>

          {/* Demo Credentials (Loads 2.0s - 2.5s) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.5 }}
            className="grid grid-cols-1 gap-2.5"
          >
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@inventory.com', 'admin123')}
                className="p-2.5 text-left bg-slate-50 hover:bg-primary/5 rounded-2xl border border-slate-200/60 hover:border-primary/20 transition duration-150 group cursor-pointer"
              >
                <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Admin Profile</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">admin@inventory.com</p>
                <p className="text-[10px] text-slate-400 font-mono">admin123</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('customer@inventory.com', 'customer123')}
                className="p-2.5 text-left bg-slate-50 hover:bg-primary/5 rounded-2xl border border-slate-200/60 hover:border-primary/20 transition duration-150 group cursor-pointer"
              >
                <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Customer Profile</p>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">customer@inventory.com</p>
                <p className="text-[10px] text-slate-400 font-mono">customer123</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDemoLogin('superadmin@inventory.com', 'superadmin123')}
              className="p-2.5 text-left bg-slate-50 hover:bg-primary/5 rounded-2xl border border-slate-200/60 hover:border-primary/20 transition duration-150 group cursor-pointer w-full"
            >
              <p className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Super Admin Profile</p>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-1">superadmin@inventory.com</p>
              <p className="text-[10px] text-slate-400 font-mono">superadmin123</p>
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
