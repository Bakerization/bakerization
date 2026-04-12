import { Locale } from "@/lib/i18n";

export default function Hero({ locale }: { locale: Locale }) {
  const subtitle =
    locale === "en"
      ? "Bakerization was founded to solve social challenges in the bakery industry."
      : "Bakerizationはパン屋の社会問題を解決するために生まれた団体です。";
  const aboutLabel = locale === "en" ? "Our Information" : "団体情報を見る";
  const servicesLabel = locale === "en" ? "See Services" : "活動を見る";

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
    >
      <img
        src="/top.jpeg"
        alt="Bakery hero background"
        className="absolute inset-0 h-full w-full object-cover grayscale"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative z-10 max-w-5xl">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
          We Bake the Future.
        </h1>
        <p className="mt-4 text-base sm:text-xl font-medium text-white/90">
          {subtitle}
        </p>
      </div>
      <div className="relative z-10 mt-10 flex flex-col sm:flex-row gap-4">
        <a
          href="/about"
          className="px-8 py-4 rounded-xl bg-white/90 text-amber-900 font-bold text-lg hover:bg-white transition-colors"
        >
          {aboutLabel}
        </a>
        <a
          href="#services"
          className="px-8 py-4 rounded-xl border border-white/70 text-white text-lg hover:bg-white/10 transition-colors"
        >
          {servicesLabel}
        </a>
      </div>
      <div className="relative z-10 mt-20 animate-bounce text-white/85 text-2xl select-none">
        ↓
      </div>
    </section>
  );
}
