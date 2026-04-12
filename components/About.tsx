import { Locale } from "@/lib/i18n";

export default function About({ locale }: { locale: Locale }) {
  const highlights =
    locale === "en"
      ? [
          { label: "Field Support", value: "Operational Optimization" },
          { label: "Data Usage", value: "Sustainable Growth" },
          { label: "Community", value: "Future Bakery Culture" },
        ]
      : [
          { label: "現場支援", value: "業務の最適化" },
          { label: "データ活用", value: "持続的な成長" },
          { label: "地域連携", value: "パン文化の未来" },
        ];

  const headingLabel = locale === "en" ? "About Us" : "私たちについて";
  const headingTitle =
    locale === "en"
      ? "Building kinder systems for bakery social challenges."
      : "パン屋の社会課題に、やさしい仕組みで向き合う。";
  const body =
    locale === "en"
      ? "Bakerization addresses labor shortages, food loss, and operational burden faced by bakeries. We combine technology with practical operations design so bakers can focus on what they do best: baking."
      : "Bakerizationは、パン屋さんが抱える人手不足、食品ロス、運営負担といった課題を解決するために活動しています。テクノロジーと現場目線の運用設計を組み合わせ、作り手が「焼くこと」に集中できる環境づくりを支援します。";

  return (
    <section id="about" className="py-24 px-6 bg-[#fffcf7]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-amber-700 text-sm font-semibold tracking-widest mb-3">
            {headingLabel}
          </p>
          <h2 className="text-4xl font-extrabold text-amber-950 mb-6 leading-tight">
            {headingTitle}
          </h2>
          <p className="text-amber-900/80 text-lg leading-relaxed">
            {body}
          </p>
        </div>

        <div className="grid gap-6">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="flex items-center gap-6 p-6 rounded-2xl border border-amber-100 bg-white hover:border-amber-300 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 text-2xl font-bold shrink-0">
                ✦
              </div>
              <div>
                <p className="text-xs text-amber-700/70 tracking-widest">{h.label}</p>
                <p className="text-xl font-bold text-amber-950">{h.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
