import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toastSuccess, toastError } from '../components/Toast';
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, ArrowRight, LineChart, Box, Users } from 'lucide-react';

// =======================================================
// NEW LEFT HERO COMPONENT
// Centered layout, increased feature cards
// =======================================================
function LoginHero() {
  const headingText = "Manage your inventory with ";
  
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center EVERYTHING horizontally
        justifyContent: 'center', // Vertically balance
        height: '100%',
        width: '100%',
        position: 'relative',
        zIndex: 10,
        gap: '48px', // Balanced spacing between main logical blocks
      }}
    >


      {/* 2. HERO CONTENT (Badge, Heading, Description - Centered) */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.4 } }
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
        }}
      >
        {/* Badge */}
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          className="rounded-full border border-white/20 bg-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] text-slate-200"
          style={{ 
            width: 'max-content',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.05em'
          }}
        >
          Smart • Secure • Scalable
        </motion.div>

        {/* Heading (Single Line, 64px strict) */}
        <motion.h1 
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
          style={{
            fontSize: '64px',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: 'white',
            whiteSpace: 'nowrap', // Force single line
            lineHeight: 1
          }}
        >
          {headingText}
          <span 
            className="animate-gradient-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
          >
            clarity.
          </span>
        </motion.h1>

        {/* Description (Strictly 2 lines) */}
        <motion.p 
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          style={{
            fontSize: '20px',
            lineHeight: 1.7,
            color: 'rgba(255,255,255,0.72)',
            maxWidth: '700px',
            whiteSpace: 'pre-line' // Force exact newlines
          }}
        >
          A comprehensive inventory platform built for modern organizations to{"\n"}manage warehouses, assets, orders and operations with confidence.
        </motion.p>
      </motion.div>

      {/* 3. FEATURE CARDS (Large 2x2 Grid) */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 230px)',
          gap: '24px',
        }}
      >
        <NewFeatureCard icon={<ShieldCheck size={44} className="text-emerald-400" />} title="Secure & Reliable" desc="Enterprise security protocols." />
        <NewFeatureCard icon={<LineChart size={44} className="text-blue-400" />} title="Real-time Insights" desc="Live analytics & reports." />
        <NewFeatureCard icon={<Box size={44} className="text-purple-400" />} title="Asset Tracking" desc="Track every asset globally." />
        <NewFeatureCard icon={<Users size={44} className="text-amber-400" />} title="Role-Based Access" desc="Granular user permissions." />
      </motion.div>

    </div>
  );
}

function NewFeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: { 
          y: 0, 
          scale: 1, 
          backgroundColor: 'rgba(255,255,255,0.04)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          borderColor: 'rgba(255,255,255,0.1)'
        },
        hover: { 
          y: -8, 
          scale: 1.03, 
          backgroundColor: 'rgba(255,255,255,0.1)',
          boxShadow: '0 15px 40px rgba(168,85,247,0.3)', // Purple glow
          borderColor: 'rgba(168,85,247,0.4)'
        }
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="backdrop-blur-2xl overflow-hidden group relative"
      style={{
        width: '230px',
        height: '170px',
        borderRadius: '22px',
        borderWidth: '1px',
        borderStyle: 'solid',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center', // Center content inside card too
        textAlign: 'center',
        gap: '16px',
      }}
    >
      {/* Shine Sweep Animation */}
      <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[sweep-highlight_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      
      <div 
        className="rounded-full flex items-center justify-center border border-white/10 shadow-[inset_0_2px_15px_rgba(255,255,255,0.1)] relative z-10"
        style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <motion.div variants={{ rest: { rotate: 0 }, hover: { rotate: 360, transition: { duration: 0.8, ease: "anticipate" } } }}>
          {icon}
        </motion.div>
      </div>
      <div className="relative z-10">
        <h4 style={{ color: 'white', fontWeight: 700, fontSize: '20px', marginBottom: '6px' }}>{title}</h4>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, fontSize: '16px', lineHeight: 1.4 }}>{desc}</p>
      </div>
    </motion.div>
  );
}

// =======================================================
// MAIN LOGIN COMPONENT
// =======================================================
export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isExiting, setIsExiting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const canvasRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const [cardTilt, setCardTilt] = useState({ x: 0, y: 0 });

  const buttonRef = useRef(null);
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    const x = e.clientX - window.innerWidth / 2;
    const y = e.clientY - window.innerHeight / 2;
    const tiltX = -(y / (window.innerHeight / 2)) * 3; 
    const tiltY = (x / (window.innerWidth / 2)) * 3;  
    setCardTilt({ x: tiltX, y: tiltY });
  };

  const handleButtonMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setBtnPos({ x: x * 0.2, y: y * 0.2 });
  };

  const handleButtonMouseLeave = () => setBtnPos({ x: 0, y: 0 });
  const handleMouseLeave = () => setCardTilt({ x: 0, y: 0 });

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
      login(token, user);
      if (onLoginSuccess) onLoginSuccess(user);
      setIsExiting(true);
      setTimeout(() => {
        toastSuccess(`Welcome back, ${user.name}!`);
        if (user.role === 'super_admin') navigate('/super-admin/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'seller') navigate('/seller/dashboard');
        else navigate('/customer/inventory');
      }, 700);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Login failed.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = 200;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5, baseOpacity: Math.random() * 0.4 + 0.1,
        twinkleSpeed: 0.01 + Math.random() * 0.03, twinkleVal: Math.random() * Math.PI,
        speedX: (Math.random() - 0.5) * 0.3, speedY: (Math.random() - 0.5) * 0.3,
      });
    }

    const starCount = 300;
    const stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        size: Math.random() * 1.5, twinkleVal: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.05
      });
    }

    let time = 0;
    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gridOpacity = 0.08;
      ctx.strokeStyle = `rgba(255, 255, 255, ${gridOpacity})`;
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      const xOffset = (time * 10) % gridSize;
      
      ctx.beginPath();
      for (let x = -gridSize; x < canvas.width + gridSize; x += gridSize) {
        ctx.moveTo(x + xOffset, 0); ctx.lineTo(x + xOffset, canvas.height);
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
      }
      ctx.stroke();

      stars.forEach(s => {
        s.twinkleVal += s.twinkleSpeed;
        const op = 0.1 + Math.abs(Math.sin(s.twinkleVal)) * 0.4;
        ctx.fillStyle = `rgba(255, 255, 255, ${op})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
      });

      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY; p.twinkleVal += p.twinkleSpeed;
        const currentOpacity = p.baseOpacity * (0.5 + 0.5 * Math.sin(p.twinkleVal));
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.fillStyle = `rgba(79, 141, 255, ${currentOpacity})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.lineWidth = 1;
      const waveColors = ['rgba(59, 130, 246, 0.15)', 'rgba(168, 85, 247, 0.15)', 'rgba(6, 182, 212, 0.15)'];
      for(let i=0; i<3; i++) {
        ctx.strokeStyle = waveColors[i];
        ctx.beginPath();
        for(let x=0; x<=canvas.width; x+=100) {
          const y = canvas.height/2 + Math.sin(x * 0.003 + time * (2+i)) * 200 + Math.cos(x * 0.002 - time) * 150;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resizeCanvas); };
  }, []);

  const headingWords = "Manage your inventory with".split(" ");

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
      className="relative bg-gradient-to-br from-[#050816] to-[#0B1023] w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(950px, 1.4fr) minmax(480px, 0.8fr)',
        alignItems: 'center',
        height: '100vh',
        padding: '0 80px', 
        gap: '60px',
        overflow: 'hidden'
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_30%,rgba(59,130,246,0.15),transparent)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_70%,rgba(168,85,247,0.12),transparent)] pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sweep-highlight { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradient-text { background-size: 200% auto; animation: gradient-x 4s linear infinite; }
        .floating-label { position: absolute; left: 48px; top: 50%; transform: translateY(-50%); transition: all 0.2s ease-out; pointer-events: none; color: rgba(255,255,255,0.5); font-size: 15px; }
        .peer:focus ~ .floating-label, .peer:not(:placeholder-shown) ~ .floating-label { top: 25%; font-size: 11px; color: #60A5FA; }
        .input-filled { padding-top: 16px !important; padding-bottom: 0px !important; }
        .ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.4); transform: scale(0); animation: ripple-anim 0.6s linear; pointer-events: none; }
        @keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }
      `}} />

      {/* CENTERED LOGO BLOCK (Pinned to Top of Entire Page with Glassmorphism) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          zIndex: 50,
          background: 'rgba(10, 14, 28, 0.65)',
          backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        <img 
          src="/rentalyze-logo.jpg" 
          alt="Rentalyze Logo" 
          className="mix-blend-screen"
          style={{ 
            width: '56px', 
            height: '56px',
            filter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.4))'
          }}
        />
        <span 
          style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: '46px', 
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.03em',
            paddingTop: '4px',
            textShadow: '0 4px 30px rgba(255,255,255,0.6)'
          }}
        >
          RENTALYZE
        </span>
        {/* Soft Ambient Glow below the header */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent shadow-[0_4px_20px_rgba(59,130,246,0.3)]" />
      </motion.div>

      {/* NEW LEFT HERO */}
      <LoginHero />

      {/* RIGHT SECTION (Untouched) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', position: 'relative', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isExiting ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
          transition={isExiting ? { duration: 0.7 } : { duration: 0.8, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '480px',
            height: '620px',
            padding: '32px',
            transform: `perspective(1000px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg)`,
            transition: 'transform 0.15s ease-out',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="rounded-[28px] relative overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        >
          <div className="absolute inset-0 bg-[rgba(16,20,38,0.7)] backdrop-blur-[32px] border border-[rgba(255,255,255,0.12)] rounded-[28px] -z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" />

          <div className="flex justify-center flex-shrink-0" style={{ marginTop: '16px' }}>
            <motion.div 
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-[64px] h-[64px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-[inset_0_2px_15px_rgba(59,130,246,0.3)] relative group cursor-pointer"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-xl animate-pulse" />
              <Lock size={28} className="text-white relative z-10 group-hover:scale-110 transition-transform" />
            </motion.div>
          </div>

          <div className="text-center flex-shrink-0" style={{ marginBottom: '16px' }}>
            <h2 className="font-[800] text-white tracking-tight mb-[4px]" style={{ fontSize: '28px' }}>Welcome Back</h2>
            <p className="text-[15px] text-slate-400 font-[400]">Sign in to continue to Rentalyze.</p>
          </div>

          <form onSubmit={handleLogin} className="flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.5 }}
              style={{ borderColor: emailFocused ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)', backgroundColor: emailFocused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', boxShadow: emailFocused ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}
              className="relative rounded-[16px] border border-white/10 overflow-hidden transition-all duration-300"
            >
              <div className="relative z-10 flex items-center" style={{ height: '52px' }}>
                <span className="absolute inset-y-0 left-0 pl-[16px] flex items-center pointer-events-none transition-colors duration-300" style={{ color: emailFocused ? '#60A5FA' : '#94A3B8' }}><Mail size={20} /></span>
                <input type="email" value={email} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} onChange={(e) => setEmail(e.target.value)} placeholder=" " className="peer pl-[48px] block w-full px-[16px] input-filled h-full border-none focus:outline-none focus:ring-0 bg-transparent text-white text-[16px] font-[500]" required />
                <span className="floating-label">Email Address</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.5 }}
              style={{ borderColor: passFocused ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.1)', backgroundColor: passFocused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', boxShadow: passFocused ? '0 0 20px rgba(59,130,246,0.2)' : 'none' }}
              className="relative rounded-[16px] border border-white/10 overflow-hidden transition-all duration-300"
            >
              <div className="relative z-10 flex items-center" style={{ height: '52px' }}>
                <span className="absolute inset-y-0 left-0 pl-[16px] flex items-center pointer-events-none transition-colors duration-300" style={{ color: passFocused ? '#60A5FA' : '#94A3B8' }}><Lock size={20} /></span>
                <input type={showPassword ? 'text' : 'password'} value={password} onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)} onChange={(e) => setPassword(e.target.value)} placeholder=" " className="peer pl-[48px] pr-[48px] block w-full px-[16px] input-filled h-full border-none focus:outline-none focus:ring-0 bg-transparent text-white text-[16px] font-[500]" required />
                <span className="floating-label">Password</span>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-[16px] top-0 h-full flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7, duration: 0.5 }}>
              <motion.div ref={buttonRef} onMouseMove={handleButtonMouseMove} onMouseLeave={handleButtonMouseLeave} animate={{ x: btnPos.x, y: btnPos.y }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}>
                <button type="submit" disabled={loading} className="group relative w-full flex items-center justify-center rounded-[16px] text-[16px] font-[700] text-white overflow-hidden disabled:opacity-50" style={{ height: '54px' }}
                  onClick={function(e) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
                    const ripple = document.createElement('span'); ripple.className = 'ripple'; ripple.style.left = `${x}px`; ripple.style.top = `${y}px`; ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`; ripple.style.transform = 'translate(-50%, -50%) scale(0)';
                    e.currentTarget.appendChild(ripple); setTimeout(() => ripple.remove(), 600);
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-[length:200%_auto] animate-gradient-text transition-all" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 mix-blend-overlay" />
                  <div className="relative z-10 flex items-center gap-[8px]">
                    {loading ? <><Loader2 size={20} className="animate-spin" /><span>Authenticating...</span></> : <><span>Secure Sign In</span><motion.div initial={{ x: 0, opacity: 0 }} whileHover={{ x: 4, opacity: 1 }} className="ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300"><ArrowRight size={20} /></motion.div></>}
                  </div>
                </button>
              </motion.div>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, duration: 0.5 }} className="border-t border-white/10 flex items-center justify-center gap-[8px] flex-shrink-0" style={{ paddingTop: '16px', marginTop: 'auto', paddingBottom: '16px' }}>
            <ShieldCheck size={16} className="text-slate-400" />
            <p className="text-[13px] font-[500] text-slate-400">Enterprise-grade AES-256 encryption.</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
