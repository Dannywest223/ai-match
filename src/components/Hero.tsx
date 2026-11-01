import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const PHOTOS = {
  left: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
  center:
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80",
  right: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
};

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl ring-1 ring-black/5 dark:ring-white/10 shadow-2xl shadow-blue-900/20 bg-gradient-to-br from-blue-200 to-indigo-300 dark:from-blue-900 dark:to-indigo-900 ${className}`}
    >
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover hr-kenburns"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
    </div>
  );
}

export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const parallax = (depth: number) => ({
    transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)`,
  });

  return (
    <section className="relative isolate overflow-hidden px-6 pt-24 pb-20">
      <style>{`
        @keyframes hr-rise {
          from { opacity: 0; transform: translateY(22px); filter: blur(6px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        @keyframes hr-pop {
          from { opacity: 0; transform: translateY(60px) scale(.9); filter: blur(8px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        @keyframes hr-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes hr-blob {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50%      { transform: translate3d(30px,-24px,0) scale(1.12); }
        }
        @keyframes hr-shine {
          to { background-position: 200% center; }
        }
        @keyframes hr-ping {
          75%, 100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes hr-kenburns {
          from { transform: scale(1.08); }
          to   { transform: scale(1); }
        }
        .hr-rise { animation: hr-rise .8s cubic-bezier(.2,.7,.2,1) both; }
        .hr-pop  { animation: hr-pop 1.1s cubic-bezier(.2,.8,.2,1) both; }
        .hr-float { animation: hr-float 6s ease-in-out infinite; }
        .hr-blob { animation: hr-blob 14s ease-in-out infinite; }
        .hr-kenburns { animation: hr-kenburns 2.4s cubic-bezier(.2,.7,.2,1) both; }
        .hr-shine-text {
          background-image: linear-gradient(90deg, #2563eb 0%, #6366f1 25%, #06b6d4 50%, #2563eb 75%, #6366f1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: hr-shine 6s linear infinite;
        }
        .hr-ping { animation: hr-ping 1.8s cubic-bezier(0,0,.2,1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hr-rise, .hr-pop, .hr-float, .hr-blob, .hr-kenburns, .hr-shine-text, .hr-ping {
            animation: none !important;
          }
        }
      `}</style>

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hr-blob absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-[90%] rounded-full bg-blue-400/30 blur-3xl dark:bg-blue-600/25" />
        <div
          className="hr-blob absolute top-40 left-1/2 h-[26rem] w-[26rem] translate-x-[10%] rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-600/20"
          style={{ animationDelay: "-6s" }}
        />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(37,99,235,.12)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <span
          className="hr-rise inline-flex items-center gap-2 text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full mb-6 ring-1 ring-blue-200/70 dark:ring-blue-800/60"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="hr-ping absolute inline-flex h-full w-full rounded-full bg-blue-500/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          Powered by Arrows AI
        </span>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="hr-rise block" style={{ animationDelay: "0.15s" }}>
            Find your best-fit university abroad
          </span>
          <span className="hr-rise block mt-2" style={{ animationDelay: "0.3s" }}>
            <span className="hr-shine-text">powered by AI</span>
          </span>
        </h1>

        <p
          className="hr-rise mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          style={{ animationDelay: "0.45s" }}
        >
          Discover the right programs, improve your admission chances, and connect with trusted
          universities and recruitment partners — all in one intelligent platform.
        </p>

        <div
          className="hr-rise mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            to="/matches"
            className="group relative overflow-hidden rounded-full bg-blue-600 text-white px-6 py-3 font-medium shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/50"
          >
            <span className="relative z-10">Get Your Matches</span>
            <span
              aria-hidden
              className="absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-sm transition-transform duration-700 group-hover:translate-x-[420%]"
            />
          </Link>
          <Link
            to="/matches"
            className="rounded-full border border-gray-300 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 backdrop-blur px-6 py-3 font-medium transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-400/40"
          >
            Find My University
          </Link>
        </div>

        <p
          className="hr-rise mt-4 text-sm text-gray-500"
          style={{ animationDelay: "0.72s" }}
        >
          Matched in under 2 minutes · 100% free for students
        </p>
      </div>

      <div
        ref={stageRef}
        className="relative mx-auto mt-16 h-[250px] sm:h-[360px] md:h-[440px] max-w-5xl"
      >
        <div
          className="absolute left-[1%] top-[14%] w-[30%] aspect-[4/5] transition-transform duration-300 ease-out"
          style={parallax(10)}
        >
          <div style={{ rotate: "-7deg" }} className="h-full w-full">
            <div className="hr-pop h-full w-full" style={{ animationDelay: "0.85s" }}>
              <Photo src={PHOTOS.left} alt="Graduates celebrating on campus" className="h-full w-full" />
            </div>
          </div>
        </div>

        <div
          className="absolute right-[1%] top-[10%] w-[30%] aspect-[4/5] transition-transform duration-300 ease-out"
          style={parallax(-10)}
        >
          <div style={{ rotate: "6deg" }} className="h-full w-full">
            <div className="hr-pop h-full w-full" style={{ animationDelay: "1s" }}>
              <Photo src={PHOTOS.right} alt="Students studying together in a library" className="h-full w-full" />
            </div>
          </div>
        </div>

        <div
          className="absolute left-1/2 top-0 z-10 w-[40%] aspect-[4/5] -translate-x-1/2 transition-transform duration-300 ease-out"
          style={parallax(18)}
        >
          <div className="hr-pop h-full w-full" style={{ animationDelay: "0.7s" }}>
            <Photo src={PHOTOS.center} alt="Historic university building" className="h-full w-full" />
          </div>
        </div>

        <div
          className="absolute left-0 sm:left-[3%] bottom-[2%] z-20 transition-transform duration-300 ease-out"
          style={parallax(28)}
        >
          <div className="hr-pop" style={{ animationDelay: "1.35s" }}>
            <div className="hr-float" style={{ animationDelay: "-1s" }}>
              <div className="flex items-center gap-3 rounded-2xl bg-white/85 dark:bg-gray-900/80 backdrop-blur-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-blue-900/15 ring-1 ring-black/5 dark:ring-white/10">
                <div className="relative grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs sm:text-sm font-bold">
                  98%
                </div>
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Top match</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">MSc Computer Science</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute right-0 sm:right-[3%] top-[2%] z-20 transition-transform duration-300 ease-out"
          style={parallax(-24)}
        >
          <div className="hr-pop" style={{ animationDelay: "1.5s" }}>
            <div className="hr-float" style={{ animationDelay: "-3s" }}>
              <div className="rounded-2xl bg-white/85 dark:bg-gray-900/80 backdrop-blur-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-xl shadow-blue-900/15 ring-1 ring-black/5 dark:ring-white/10 text-left">
                <p className="text-xs text-gray-500 dark:text-gray-400">Admission chances</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+32%</span>
                  <div className="h-1.5 w-16 sm:w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute left-1/2 bottom-[-4%] z-20 -translate-x-1/2 transition-transform duration-300 ease-out"
          style={parallax(34)}
        >
          <div className="hr-pop" style={{ animationDelay: "1.65s" }}>
            <div className="hr-float" style={{ animationDelay: "-5s" }}>
              <div className="flex items-center gap-2 rounded-full bg-white/85 dark:bg-gray-900/80 backdrop-blur-xl px-4 py-2 shadow-xl shadow-blue-900/15 ring-1 ring-black/5 dark:ring-white/10 whitespace-nowrap">
                <span className="flex -space-x-1.5 text-base sm:text-lg" aria-hidden>
                  <span>🇩🇪</span>
                  <span>🇨🇦</span>
                  <span>🇬🇧</span>
                  <span>🇦🇺</span>
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                  Universities in 20+ countries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}