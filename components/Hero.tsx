export default function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-6 pt-16"
    >
      <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-4">
        The Future of Bakery
      </p>
      <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight max-w-4xl">
        We Bake{" "}
        <span className="text-amber-400">the Future.</span>
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl">
        Bakarization reinvents how bakeries operate and grow. We combine AI,
        data systems, and next-generation food technology to transform
        traditional bakeries into scalable, tech-enabled businesses.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <a
          href="#contact"
          className="px-8 py-4 rounded-xl bg-amber-500 text-gray-950 font-bold text-lg hover:bg-amber-400 transition-colors"
        >
          Get in Touch
        </a>
        <a
          href="#services"
          className="px-8 py-4 rounded-xl border border-white/20 text-white text-lg hover:border-amber-500 hover:text-amber-400 transition-colors"
        >
          Our Services
        </a>
      </div>
      <div className="mt-20 animate-bounce text-gray-600 text-2xl select-none">
        ↓
      </div>
    </section>
  );
}
