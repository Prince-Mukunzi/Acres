export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-acres-blue/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <h1 className="font-bricolage text-9xl font-bold text-charcoal-black mb-4 tracking-tighter">
          404
        </h1>
        <div className="landing-glass-panel bg-white/40 px-6 py-2 rounded-full mb-8 inline-block select-none pointer-events-none">
          <span className="font-syne text-sm font-semibold text-acres-blue uppercase">
            Page not found
          </span>
        </div>

        <h2 className="font-bricolage text-3xl md:text-4xl font-medium text-charcoal-black mb-6">
          Looks like you're completely lost.
        </h2>

        <p className="font-syne text-charcoal-black/70 mb-10 leading-relaxed max-w-md">
          The page you are looking for has been moved, deleted, or possibly
          never existed. Let's get you back on the lease.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-acres-blue px-8 py-4 font-bricolage text-[1.05rem] font-medium text-off-white transition-all shadow-xl hover:shadow-2xl hover:bg-acres-blue/90 hover:-translate-y-1 duration-300"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
