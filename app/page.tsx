"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function SellerLanding() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // scroll reveal
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("vis"); io.unobserve(e.target); } }),
      { threshold: 0.14 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const nav = document.getElementById("snav");
    const onScroll = () => nav?.classList.toggle("on", scrollY > 20);
    addEventListener("scroll", onScroll, { passive: true });

    if (rm) return;

    // tilt cards
    document.querySelectorAll<HTMLElement>(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateY(${(px - 0.5) * 6}deg) rotateX(${(0.5 - py) * 6}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
    // magnetic
    document.querySelectorAll<HTMLElement>(".mag").forEach((b) => {
      b.addEventListener("mousemove", (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.2}px, ${(e.clientY - (r.top + r.height / 2)) * 0.35}px)`; });
      b.addEventListener("mouseleave", () => (b.style.transform = ""));
    });

    // particle network
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let W = 0, H = 0;
    const host = canvas.parentElement as HTMLElement;
    function size() { W = canvas!.width = host.offsetWidth; H = canvas!.height = host.offsetHeight; }
    size(); addEventListener("resize", size);
    const M = { x: -9999, y: -9999 };
    host.addEventListener("mousemove", (e) => { const r = canvas!.getBoundingClientRect(); M.x = e.clientX - r.left; M.y = e.clientY - r.top; });
    host.addEventListener("mouseleave", () => { M.x = M.y = -9999; });
    const PN = Math.min(64, Math.floor(W / 20));
    const pts = Array.from({ length: PN }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: 1 + Math.random() * 1.6 }));
    let on = true;
    new IntersectionObserver((en) => (on = en[0].isIntersecting)).observe(host);
    (function loop() {
      requestAnimationFrame(loop); if (!on) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        const dx = M.x - p.x, dy = M.y - p.y, d = Math.hypot(dx, dy);
        if (d < 150 && d > 0.1) { p.vx -= (dx / d) * 0.03; p.vy -= (dy / d) * 0.03; }
        p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.fillStyle = "rgba(251,146,60,.55)"; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 0.5;
      for (let i = 0; i < PN; i++) for (let j = i + 1; j < PN; j++) {
        const a = pts[i], b = pts[j], d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d2 < 17000) { ctx.strokeStyle = `rgba(244,114,182,${0.13 * (1 - d2 / 17000)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
    })();
  }, []);

  return (
    <div className="land">
      <style>{`
        .land{ position:relative; overflow-x:hidden; }
        .mesh{ position:fixed; inset:-20%; z-index:-1; filter:blur(46px); opacity:.85; animation:meshmove 26s ease-in-out infinite alternate;
          background:radial-gradient(38% 32% at 20% 16%, rgba(251,146,60,.22), transparent 60%), radial-gradient(36% 30% at 82% 22%, rgba(244,114,182,.18), transparent 60%), radial-gradient(40% 36% at 60% 86%, rgba(139,92,246,.16), transparent 60%); }
        .wrap{ max-width:1180px; margin:0 auto; padding:0 26px; }
        .snav{ position:fixed; top:0; left:0; right:0; z-index:100; height:70px; display:flex; align-items:center; background:rgba(7,6,15,.55); backdrop-filter:blur(16px); border-bottom:1px solid transparent; transition:.3s; }
        .snav.on{ background:rgba(7,6,15,.86); border-bottom-color:var(--line); }
        .snav .in{ display:flex; align-items:center; justify-content:space-between; width:100%; }
        .logo{ font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:20px; }
        .logo b{ color:var(--orange); } .logo .pill{ font-size:11px; font-weight:700; color:#fdba74; background:rgba(251,146,60,.14); border-radius:100px; padding:3px 9px; margin-left:8px; }
        .nav-r{ display:flex; gap:12px; align-items:center; }
        .hero2{ position:relative; min-height:96vh; display:flex; align-items:center; padding:130px 0 70px; overflow:hidden; }
        #net{ position:absolute; inset:0; z-index:0; }
        .hero2 .in{ position:relative; z-index:2; max-width:780px; }
        .kick{ display:inline-flex; align-items:center; gap:9px; font-size:12.5px; color:var(--soft); padding:8px 15px; border:1px solid var(--line); border-radius:100px; background:var(--glass); }
        .kick .d{ width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 0 4px rgba(52,211,153,.2); }
        .hero2 h1{ font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:clamp(44px,7.5vw,92px); line-height:1.02; letter-spacing:-.03em; margin:24px 0 0; }
        .hero2 h1 .g{ background:linear-gradient(110deg,#fdba74,#fb923c 40%,#f472b6); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .hero2 p.sub{ font-size:clamp(16px,1.5vw,19px); color:var(--soft); max-width:560px; margin-top:24px; }
        .cta{ display:flex; gap:14px; margin-top:34px; flex-wrap:wrap; }
        .ticker{ display:flex; gap:30px; margin-top:42px; flex-wrap:wrap; }
        .ticker .n{ font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:28px; background:linear-gradient(120deg,#fdba74,#f472b6); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
        .ticker .l{ font-size:11.5px; color:var(--dim); text-transform:uppercase; letter-spacing:.06em; margin-top:2px; }
        section{ padding:100px 0; }
        .sh{ max-width:640px; margin:0 auto 54px; text-align:center; }
        .sh h2{ font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:clamp(30px,4.4vw,52px); margin-top:16px; }
        .sh p{ color:var(--soft); font-size:17px; margin-top:14px; }
        .steps3{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .step3{ position:relative; border:1px solid var(--line); border-radius:20px; padding:30px 26px; background:var(--glass); }
        .step3 .n{ width:42px;height:42px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:700;color:#1a0e03;background:linear-gradient(135deg,#fb923c,#ea580c); }
        .step3 h3{ font-size:19px; margin-top:18px; } .step3 p{ color:var(--soft); font-size:14px; margin-top:9px; }
        .vals{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .val{ border:1px solid var(--line); border-radius:20px; padding:26px; background:var(--glass); transition:transform .25s,border-color .25s,box-shadow .25s; will-change:transform; }
        .val:hover{ border-color:rgba(251,146,60,.45); box-shadow:0 24px 56px -28px rgba(234,88,12,.5); }
        .val .ic{ width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;background:linear-gradient(135deg,rgba(251,146,60,.2),rgba(244,114,182,.16));border:1px solid var(--line); }
        .val h3{ font-size:18px; margin-top:18px; } .val p{ color:var(--soft); font-size:14px; margin-top:9px; }
        .bigcta{ text-align:center; }
        .bigcta .box{ position:relative; max-width:760px; margin:0 auto; border:1px solid var(--line); border-radius:28px; padding:60px 40px; overflow:hidden; background:linear-gradient(180deg,rgba(30,18,38,.7),rgba(14,12,26,.7)); }
        .bigcta .halo{ position:absolute; width:420px;height:420px;border-radius:50%; top:-210px; left:50%; transform:translateX(-50%); background:radial-gradient(circle,rgba(251,146,60,.4),transparent 70%); filter:blur(46px); }
        .bigcta h2{ font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:clamp(30px,4.4vw,52px); position:relative; }
        .bigcta p{ color:var(--soft); margin-top:14px; position:relative; }
        .sfoot{ border-top:1px solid var(--line); padding:40px 0; text-align:center; color:var(--dim); font-size:13px; }
        @media(max-width:880px){ .steps3,.vals{ grid-template-columns:1fr; } }
      `}</style>

      <div className="mesh" />

      <nav className="snav" id="snav">
        <div className="wrap in">
          <span className="logo">Sky<b>quire</b><span className="pill">Sellers</span></span>
          <div className="nav-r">
            <Link href="/login" className="btn-ghost" style={{ padding: "10px 18px" }}>Sign in</Link>
            <Link href="/register" className="btn-brand mag" style={{ padding: "11px 20px" }}>List your business</Link>
          </div>
        </div>
      </nav>

      <header className="hero2">
        <canvas id="net" ref={canvasRef} />
        <div className="wrap in">
          <span className="kick"><span className="d" /> For business owners ready to sell</span>
          <h1>Sell your business<br />to India&apos;s <span className="g">serious buyers.</span></h1>
          <p className="sub">List your business on Skyquire. Our team verifies it, then puts it in front of vetted, AI-matched buyers across India — confidentially, and with you in control.</p>
          <div className="cta">
            <Link href="/register" className="btn-brand mag" style={{ padding: "16px 28px", fontSize: 16 }}>List your business →</Link>
            <a href="#how" className="btn-ghost" style={{ padding: "16px 28px", fontSize: 16 }}>How it works</a>
          </div>
          <div className="ticker">
            <div><div className="n">3 steps</div><div className="l">submit → verify → live</div></div>
            <div><div className="n">Verified</div><div className="l">buyers only</div></div>
            <div><div className="n">Free</div><div className="l">to list your business</div></div>
          </div>
        </div>
      </header>

      <section id="how"><div className="wrap">
        <div className="sh reveal"><span className="tag">How it works</span><h2>From listing to sold,<br />we do the heavy lifting.</h2></div>
        <div className="steps3">
          <div className="step3 reveal tilt"><div className="n">1</div><h3>Submit your business</h3><p>Share the details and upload your financials — privately. Takes about 10 minutes.</p></div>
          <div className="step3 reveal tilt"><div className="n">2</div><h3>We verify it</h3><p>Our team reviews your documents and checks the business is legit — so buyers trust your listing.</p></div>
          <div className="step3 reveal tilt"><div className="n">3</div><h3>Listed to buyers</h3><p>Once approved, your business goes live and our AI matches it to the right buyers across India.</p></div>
        </div>
      </div></section>

      <section><div className="wrap">
        <div className="sh reveal"><span className="tag">Why Skyquire</span><h2>Selling, without the headache.</h2><p>No brokers taking 5%. No tyre-kickers. Just verified buyers and a team that handles the process.</p></div>
        <div className="vals">
          <div className="val reveal"><div className="ic">🛡️</div><h3>Verified buyers only</h3><p>Every buyer is vetted. Your financials stay confidential until you choose to share.</p></div>
          <div className="val reveal"><div className="ic">🤖</div><h3>AI-matched</h3><p>Our AI surfaces your business to the buyers most likely to actually close — not the whole internet.</p></div>
          <div className="val reveal"><div className="ic">💸</div><h3>Free to list</h3><p>No upfront fees to list your business. We only win when you do.</p></div>
          <div className="val reveal"><div className="ic">🔒</div><h3>Confidential &amp; secure</h3><p>Documents live in a private, access-controlled vault only our verification team can see.</p></div>
          <div className="val reveal"><div className="ic">🤝</div><h3>We handle it</h3><p>From verification to buyer questions, our team guides every step to a clean close.</p></div>
          <div className="val reveal"><div className="ic">🏦</div><h3>Escrow-backed</h3><p>Money moves through RBI-regulated escrow, so both sides are protected at close.</p></div>
        </div>
      </div></section>

      <section className="bigcta"><div className="wrap">
        <div className="box reveal"><div className="halo" />
          <h2>Ready to sell your business?</h2>
          <p>List it in 10 minutes. We&apos;ll take it from there.</p>
          <div style={{ marginTop: 28, position: "relative" }}>
            <Link href="/register" className="btn-brand mag" style={{ padding: "16px 30px", fontSize: 16 }}>List your business →</Link>
          </div>
        </div>
      </div></section>

      <footer className="sfoot">© 2026 Skyquire Technologies Pvt. Ltd. · For sellers · Made in India 🇮🇳</footer>
    </div>
  );
}
