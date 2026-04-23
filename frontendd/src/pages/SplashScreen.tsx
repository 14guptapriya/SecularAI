import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      r: number;
      a: number;
      da: number;
      speed: number;
      colorRGB: string;
      vx: number;
      vy: number;
    }> = [];
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const init = (n: number) => {
      particles = [];
      for (let i = 0; i < n; i++) {
        const rand = Math.random();
        let colorRGB: string;
        if (rand < 0.3) {
          colorRGB = '138, 43, 226'; // Deep violet
        } else if (rand < 0.6) {
          colorRGB = '64, 224, 208'; // Turquoise
        } else if (rand < 0.75) {
          colorRGB = '255, 20, 147'; // Deep pink
        } else if (rand < 0.9) {
          colorRGB = '65, 105, 225'; // Royal blue
        } else {
          colorRGB = '100, 149, 237'; // Cornflower
        }
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 3.5 + 0.3,
          a: Math.random() * 0.6,
          da: (Math.random() * 0.002 + 0.0005) * (Math.random() < 0.5 ? 1 : -1),
          speed: Math.random() * 0.02 + 0.002,
          colorRGB: colorRGB,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
    };

    const drawNebula = () => {
      // Create nebula gradient layers
      const nebGrad1 = ctx.createRadialGradient(W * 0.3, H * 0.2, 0, W * 0.3, H * 0.2, W * 0.7);
      nebGrad1.addColorStop(0, 'rgba(138, 43, 226, 0.15)');
      nebGrad1.addColorStop(0.5, 'rgba(138, 43, 226, 0.08)');
      nebGrad1.addColorStop(1, 'rgba(138, 43, 226, 0)');

      const nebGrad2 = ctx.createRadialGradient(W * 0.7, H * 0.6, 0, W * 0.7, H * 0.6, W * 0.6);
      nebGrad2.addColorStop(0, 'rgba(64, 224, 208, 0.12)');
      nebGrad2.addColorStop(0.5, 'rgba(64, 224, 208, 0.06)');
      nebGrad2.addColorStop(1, 'rgba(64, 224, 208, 0)');

      const nebGrad3 = ctx.createRadialGradient(W * 0.2, H * 0.7, 0, W * 0.2, H * 0.7, W * 0.5);
      nebGrad3.addColorStop(0, 'rgba(255, 20, 147, 0.1)');
      nebGrad3.addColorStop(0.5, 'rgba(255, 20, 147, 0.05)');
      nebGrad3.addColorStop(1, 'rgba(255, 20, 147, 0)');

      ctx.fillStyle = nebGrad1;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = nebGrad2;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = nebGrad3;
      ctx.fillRect(0, 0, W, H);
    };

    const draw = () => {
      // Background with subtle dark gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#0a0612');
      bgGrad.addColorStop(0.5, '#1a0e2e');
      bgGrad.addColorStop(1, '#0d0416');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Draw nebula layers
      drawNebula();

      // Draw particles
      for (const p of particles) {
        p.a += p.da;
        if (p.a < 0.1 || p.a > 0.8) p.da *= -1;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Draw glowing particle
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        glow.addColorStop(0, `rgba(${p.colorRGB}, ${p.a * 0.6})`);
        glow.addColorStop(1, `rgba(${p.colorRGB}, 0)`);

        ctx.fillStyle = glow;
        ctx.fillRect(p.x - p.r * 3, p.y - p.r * 3, p.r * 6, p.r * 6);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRGB}, ${p.a})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    resize();
    init(320);
    draw();

    const handleResize = () => {
      resize();
      init(320);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBeginJourney = () => {
    navigate('/home');
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="w-full min-h-screen bg-[#09070d] font-outfit text-[#f5ead8] overflow-x-hidden m-0 p-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Outfit:wght@300;400;500;600&display=swap');
        
        #stars { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .ambient { position: fixed; width: 620px; height: 620px; border-radius: 50%; background: radial-gradient(circle, rgba(138,43,226,0.12) 0%, rgba(64,224,208,0.06) 40%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-62%); pointer-events: none; z-index: 0; filter: blur(60px); }
        .ambient-floor { position: fixed; width: 480px; height: 200px; border-radius: 50%; background: radial-gradient(ellipse, rgba(255,20,147,0.08) 0%, transparent 70%); bottom: 0; left: 50%; transform: translateX(-50%); pointer-events: none; z-index: 0; filter: blur(50px); }
        
        .orbit-scene { position: relative; width: 340px; height: 340px; margin-bottom: 2.6rem; opacity: 0; animation: fadeUp 1s ease 0.3s forwards; }
        .ring { position: absolute; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }
        .ring-1 { width: 272px; height: 272px; border: 2px solid rgba(255,235,59,0.35); animation: spin 26s linear infinite; }
        .ring-2 { width: 210px; height: 210px; border: 2px solid rgba(255,235,59,0.25); animation: spin 18s linear infinite reverse; }
        .ring-3 { width: 336px; height: 336px; border: 2px solid rgba(255,235,59,0.15); animation: spin 44s linear infinite; }
        
        @keyframes spin { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        
        .orb-wrap { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); z-index: 10; }
        .orb { width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #ffeb3b 0%, #fdd835 20%, #f5c842 40%, #f39c12 65%, #e67e22 100%); box-shadow: 0 0 40px rgba(255,235,59,0.8), 0 0 80px rgba(245,200,66,0.5), 0 0 120px rgba(230,126,34,0.3), inset -20px -20px 40px rgba(139,62,0,0.4); animation: sunPulse 4s ease-in-out infinite; }
        .orb-rim { position: absolute; inset: -15px; border-radius: 50%; border: 2px solid rgba(255,235,59,0.4); animation: sunPulse 4s ease-in-out infinite 0.8s; }
        .orb-rim2 { position: absolute; inset: -35px; border-radius: 50%; border: 1px solid rgba(255,235,59,0.2); animation: sunPulse 4s ease-in-out infinite 1.6s; }
        
        @keyframes sunPulse { 0%,100% { box-shadow: 0 0 40px rgba(255,235,59,0.8),0 0 80px rgba(245,200,66,0.5),0 0 120px rgba(230,126,34,0.3),inset -20px -20px 40px rgba(139,62,0,0.4); } 50% { box-shadow: 0 0 60px rgba(255,235,59,1),0 0 120px rgba(245,200,66,0.7),0 0 180px rgba(230,126,34,0.5),inset -20px -20px 60px rgba(139,62,0,0.6); } }
        
        .faith-node { position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 0 12px rgba(245,200,66,0.3); transition: filter 0.25s, transform 0.25s, box-shadow 0.25s; }
        .faith-node:hover { filter: brightness(1.3); transform: scale(1.15); box-shadow: 0 0 25px rgba(245,200,66,0.6), 0 0 40px rgba(245,200,66,0.3); z-index: 20; }
        .faith-planet { width: 100%; height: 100%; border-radius: 50%; background-size: cover; background-position: center; position: relative; display: flex; align-items: center; justify-content: center; }
        .faith-planet::before { content: ''; position: absolute; inset: 0; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%); }
        .faith-planet svg { position: relative; z-index: 2; }
        .faith-node svg { width: 16px; height: 16px; }
        .faith-node.planet-1 { width: 36px; height: 36px; background: linear-gradient(135deg, #d66a28 0%, #e89020 50%, #f5a942 100%); transform: translate(-18px, -18px); }
        .faith-node.planet-2 { width: 42px; height: 42px; background: linear-gradient(135deg, #2c3e50 0%, #34495e 40%, #7f8c8d 100%); transform: translate(-21px, -21px); }
        .faith-node.planet-3 { width: 39px; height: 39px; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 50%, #16a085 100%); transform: translate(-20px, -20px); }
        .faith-node.planet-4 { width: 38px; height: 38px; background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 50%, #af7ac5 100%); transform: translate(-19px, -19px); }
        .faith-node.planet-5 { width: 40px; height: 40px; background: linear-gradient(135deg, #c0392b 0%, #e74c3c 50%, #f5745f 100%); transform: translate(-20px, -20px); }
        .faith-node.planet-6 { width: 35px; height: 35px; background: linear-gradient(135deg, #16a085 0%, #48c9b0 50%, #1abc9c 100%); transform: translate(-18px, -18px); }
        .tip { position: absolute; bottom: calc(100% + 12px); left: 50%; transform: translateX(-50%); background: rgba(9,7,13,0.95); border: 1px solid rgba(245,200,66,0.4); color: #ffd700; font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; padding: 6px 13px; border-radius: 999px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.18s; }
        .faith-node:hover .tip { opacity: 1; }
        
        .orbit-arm { position: absolute; top: 50%; left: 50%; transform-origin: 0 0; }
        .a1 { animation: o1 22s linear infinite; } .a1 .faith-node { animation: c1 22s linear infinite; }
        .a2 { animation: o2 28s linear infinite; } .a2 .faith-node { animation: c2 28s linear infinite; }
        .a3 { animation: o3 19s linear infinite; } .a3 .faith-node { animation: c3 19s linear infinite; }
        .a4 { animation: o4 32s linear infinite; } .a4 .faith-node { animation: c4 32s linear infinite; }
        .a5 { animation: o5 24s linear infinite; } .a5 .faith-node { animation: c5 24s linear infinite; }
        .a6 { animation: o6 30s linear infinite; } .a6 .faith-node { animation: c6 30s linear infinite; }
        
        @keyframes o1 { from { transform: rotate(0deg) translateX(120px) translateY(-20px); } to { transform: rotate(360deg) translateX(120px) translateY(-20px); } }
        @keyframes o2 { from { transform: rotate(60deg) translateX(160px) translateY(-25px); } to { transform: rotate(420deg) translateX(160px) translateY(-25px); } }
        @keyframes o3 { from { transform: rotate(120deg) translateX(95px) translateY(-15px); } to { transform: rotate(480deg) translateX(95px) translateY(-15px); } }
        @keyframes o4 { from { transform: rotate(180deg) translateX(180px) translateY(-28px); } to { transform: rotate(540deg) translateX(180px) translateY(-28px); } }
        @keyframes o5 { from { transform: rotate(240deg) translateX(140px) translateY(-22px); } to { transform: rotate(600deg) translateX(140px) translateY(-22px); } }
        @keyframes o6 { from { transform: rotate(300deg) translateX(110px) translateY(-18px); } to { transform: rotate(660deg) translateX(110px) translateY(-18px); } }
        @keyframes c1 { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes c2 { from { transform: rotate(-60deg); } to { transform: rotate(-420deg); } }
        @keyframes c3 { from { transform: rotate(-120deg); } to { transform: rotate(-480deg); } }
        @keyframes c4 { from { transform: rotate(-180deg); } to { transform: rotate(-540deg); } }
        @keyframes c5 { from { transform: rotate(-240deg); } to { transform: rotate(-600deg); } }
        @keyframes c6 { from { transform: rotate(-300deg); } to { transform: rotate(-660deg); } }
        
        .text-block { text-align: center; opacity: 0; animation: fadeUp 1s ease 0.65s forwards; margin-bottom: 0.5rem; }
        .logo { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem, 8vw, 3.8rem); font-weight: 300; letter-spacing: -0.01em; line-height: 1; color: #f5ead8; margin-bottom: 0.6rem; }
        .logo span { font-weight: 600; background: linear-gradient(135deg, #ffe08a 0%, #f5c842 40%, #e07b1a 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tagline { font-size: clamp(0.78rem, 2.2vw, 0.92rem); font-weight: 300; color: rgba(245,200,66,0.52); letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 2.2rem; }
        .divider { width: 80px; height: 1px; background: linear-gradient(90deg, transparent, rgba(245,200,66,0.38), transparent); margin: 0 auto 2.2rem; opacity: 0; animation: fadeUp 1s ease 0.85s forwards; }
        
        .faith-pills { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 2.8rem; opacity: 0; animation: fadeUp 1s ease 0.95s forwards; }
        .pill { display: flex; align-items: center; gap: 6px; padding: 5px 13px 5px 9px; border: 1px solid rgba(245,200,66,0.14); border-radius: 999px; background: rgba(245,200,66,0.04); font-size: 11px; font-weight: 400; color: rgba(245,234,216,0.48); letter-spacing: 0.04em; cursor: default; transition: border-color 0.2s, background 0.2s, color 0.2s; }
        .pill:hover { border-color: rgba(245,200,66,0.45); background: rgba(245,200,66,0.1); color: #f5ead8; }
        .pill-dot { width: 5px; height: 5px; border-radius: 50%; background: linear-gradient(135deg, #f5c842, #e07b1a); flex-shrink: 0; display: inline-block; }
        
        .cta-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; opacity: 0; animation: fadeUp 1s ease 1.05s forwards; }
        .btn-primary { display: inline-flex; align-items: center; gap: 12px; padding: 15px 38px; border-radius: 50px; background: linear-gradient(135deg, #c96a00 0%, #e89020 35%, #f5c842 70%, #ffe48a 100%); color: #1a0d00; font-family: 'Outfit', sans-serif; font-size: 0.95rem; font-weight: 600; letter-spacing: 0.05em; border: none; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(240,161,48,0.42), 0 1px 0 rgba(255,240,180,0.28) inset; transition: transform 0.2s, box-shadow 0.2s; text-decoration: none; }
        .btn-primary::before { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent); transition: left 0.45s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 34px rgba(240,161,48,0.56), 0 0 0 4px rgba(245,200,66,0.14), 0 1px 0 rgba(255,240,180,0.28) inset; }
        .btn-primary:hover::before { left: 150%; }
        .btn-primary:active { transform: translateY(0); }
        .btn-arrow { width: 20px; height: 20px; border-radius: 50%; background: rgba(26,13,0,0.18); display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .btn-skip { background: none; border: none; color: rgba(245,234,216,0.32); font-family: 'Outfit', sans-serif; font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; padding: 4px 14px; transition: color 0.2s; }
        .btn-skip:hover { color: rgba(245,200,66,0.65); }
        
        .bottom-note { position: fixed; bottom: 1.8rem; left: 0; right: 0; text-align: center; font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(245,200,66,0.17); z-index: 1; animation: fadeUp 1s ease 1.4s both; margin: 0; padding: 0; }
        
        .star-deco { position: absolute; pointer-events: none; }
        .star-svg { width: 20px; height: 20px; filter: drop-shadow(0 0 6px rgba(245,200,66,0.6)); }
        .star-deco.s1 { top: 12%; left: 8%; animation: twinkle 3s ease-in-out infinite, float1 6s ease-in-out infinite; }
        .star-deco.s2 { top: 18%; right: 10%; animation: twinkle 3.5s ease-in-out infinite 0.5s, float2 7s ease-in-out infinite; }
        .star-deco.s3 { top: 35%; left: 5%; animation: twinkle 2.8s ease-in-out infinite 0.3s, float1 8s ease-in-out infinite; }
        .star-deco.s4 { bottom: 20%; right: 6%; animation: twinkle 3.2s ease-in-out infinite 0.8s, float2 6.5s ease-in-out infinite; }
        .star-deco.s5 { top: 45%; right: 4%; animation: twinkle 3.8s ease-in-out infinite 0.2s, float1 7.5s ease-in-out infinite; }
        .star-deco.s6 { bottom: 30%; left: 7%; animation: twinkle 2.9s ease-in-out infinite 0.6s, float2 8.5s ease-in-out infinite; }
        
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes float1 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes float2 { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(10px); } }
        
        @keyframes fadeUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 420px) {
          .orbit-scene { width: 280px; height: 280px; }
          .ring-1 { width: 224px; height: 224px; }
          .ring-2 { width: 172px; height: 172px; }
          .ring-3 { width: 276px; height: 276px; }
        }

        /* Vignette overlay for depth */
        main::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%); pointer-events: none; z-index: 1; }
      `}</style>

      <canvas ref={canvasRef} id="stars"></canvas>
      <div className="ambient"></div>
      <div className="ambient-floor"></div>

      {/* Decorative Stars */}
      {/* <div className="star-deco s1">
        <svg className="star-svg" viewBox="0 0 24 24" fill="#f5c842">
          <polygon points="12,2 15.09,10.26 24,10.26 17.55,15.74 19.64,24 12,18.52 4.36,24 6.45,15.74 0,10.26 8.91,10.26"/>
        </svg>
      </div>
      <div className="star-deco s2">
        <svg className="star-svg" viewBox="0 0 24 24" fill="#f5c842">
          <polygon points="12,2 15.09,10.26 24,10.26 17.55,15.74 19.64,24 12,18.52 4.36,24 6.45,15.74 0,10.26 8.91,10.26"/>
        </svg>
      </div>
      <div className="star-deco s3">
        <svg className="star-svg" viewBox="0 0 24 24" fill="#ffe08a">
          <polygon points="12,2 15.09,10.26 24,10.26 17.55,15.74 19.64,24 12,18.52 4.36,24 6.45,15.74 0,10.26 8.91,10.26"/>
        </svg>
      </div>
      <div className="star-deco s4">
        <svg className="star-svg" viewBox="0 0 24 24" fill="#f0a130">
          <polygon points="12,2 15.09,10.26 24,10.26 17.55,15.74 19.64,24 12,18.52 4.36,24 6.45,15.74 0,10.26 8.91,10.26"/>
        </svg>
      </div>
      <div className="star-deco s5">
        <svg className="star-svg" viewBox="0 0 24 24" fill="#f5c842">
          <polygon points="12,2 15.09,10.26 24,10.26 17.55,15.74 19.64,24 12,18.52 4.36,24 6.45,15.74 0,10.26 8.91,10.26"/>
        </svg>
      </div>
      <div className="star-deco s6">
        <svg className="star-svg" viewBox="0 0 24 24" fill="#ffe08a">
          <polygon points="12,2 15.09,10.26 24,10.26 17.55,15.74 19.64,24 12,18.52 4.36,24 6.45,15.74 0,10.26 8.91,10.26"/>
        </svg>
      </div> */}

      <main className="relative z-1 flex flex-col items-center justify-center min-h-screen p-[2rem_1.5rem_3rem]">
        <div className="orbit-scene">
          <div className="ring ring-1"></div>
          <div className="ring ring-2"></div>
          <div className="ring ring-3"></div>

          <div className="orb-wrap">
            <div className="orb-rim2"></div>
            <div className="orb-rim"></div>
            <div className="orb"></div>
          </div>

          {/* Faith Nodes - Solar System Planets */}
          <div className="orbit-arm a1">
            <div className="faith-node planet-1">
              <span className="tip">Hinduism</span>
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M24 5c0 0 3.5 5.5 3.5 11c0 3.5-2 5.5-3.5 7c-1.5-1.5-3.5-3.5-3.5-7c0-5.5 3.5-11 3.5-11z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 18c3 0 8 2 11 5c2 2 2 5 2 5s0-3 2-5c3-3 8-5 11-5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 37c1.5-5.5 4.5-10 7-12.5c2-2 2-2 2-2s0 0 2 2c2.5 2.5 5.5 7 7 12.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="24" cy="23" r="2.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2"/><path d="M24 39v4M21 42h6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="orbit-arm a2">
            <div className="faith-node planet-2">
              <span className="tip">Islam</span>
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M20 9c-5.5 3.5-9 9.5-9 16c0 8.5 6 16 13 16s14-7.5 14-16c0-3-1-6-3-8c-2 3-6 5-9.5 5c-4 0-8-3-9-7c-.5-2.5 1-4.5 3.5-6z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M32 9l1.2 4.5H37.5l-3.5 2.7 1.2 4.5L32 17.8l-3.2 2.9 1.2-4.5L26.5 13.5h4.3z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="orbit-arm a3">
            <div className="faith-node planet-3">
              <span className="tip">Christianity</span>
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M24 8v34" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M15 20h18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="13" r="3.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
          </div>

          <div className="orbit-arm a4">
            <div className="faith-node planet-4">
              <span className="tip">Buddhism</span>
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="15" stroke="#fff" strokeWidth="1.4"/><circle cx="24" cy="24" r="5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/><path d="M24 9v10M24 29v10M9 24h10M29 24h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/><path d="M13.4 13.4L19.8 19.8M28.2 28.2L34.6 34.6M34.6 13.4L28.2 19.8M19.8 28.2L13.4 34.6" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="orbit-arm a5">
            <div className="faith-node planet-5">
              <span className="tip">Sikhism</span>
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="15" stroke="#fff" strokeWidth="1.4"/><circle cx="24" cy="24" r="6.5" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/><path d="M14 11l20 26M34 11L14 37" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          <div className="orbit-arm a6">
            <div className="faith-node planet-6">
              <span className="tip">Judaism</span>
              <svg viewBox="0 0 48 48" fill="none">
                <polygon points="24,7 40,31 8,31" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" fill="none"/><polygon points="24,41 8,17 40,17" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="text-block">
          <h1 className="logo">
            Secular<span>AI</span>
          </h1>
          <p className="tagline">A Universe of Spiritual Wisdom</p>
        </div>

        <div className="divider"></div>

        <div className="faith-pills">
          <div className="pill"><span className="pill-dot"></span>Hinduism</div>
          <div className="pill"><span className="pill-dot"></span>Islam</div>
          <div className="pill"><span className="pill-dot"></span>Christianity</div>
          <div className="pill"><span className="pill-dot"></span>Buddhism</div>
          <div className="pill"><span className="pill-dot"></span>Sikhism</div>
          <div className="pill"><span className="pill-dot"></span>Judaism</div>
        </div>

        <div className="cta-wrap">
          <button className="btn-primary" onClick={handleBeginJourney}>
            Begin Your Journey <span className="btn-arrow">›</span>
          </button>
          <button className="btn-skip" onClick={handleSkip}>
            Skip
          </button>
        </div>
      </main>

      <p className="bottom-note">Wisdom Without Borders</p>
    </div>
  );
}
