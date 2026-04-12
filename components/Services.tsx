import { Locale } from "@/lib/i18n";

export default function Services({ locale }: { locale: Locale }) {
  const services =
    locale === "en"
      ? [
          {
            icon: "🥐",
            title: "Store Operations Support",
            description:
              "We redesign prep planning, inventory control, and demand forecasting into sustainable daily workflows.",
          },
          {
            icon: "📊",
            title: "Data Visibility & Improvement",
            description:
              "We provide decision-ready visibility across sales, waste, and time-slot demand.",
          },
          {
            icon: "🍞",
            title: "Future of Bakery Culture",
            description:
              "We help preserve local craft while implementing systems that connect bakeries to the next generation.",
          },
        ]
      : [
          {
            icon: "🥐",
            title: "店舗オペレーション支援",
            description:
              "仕込み計画、在庫管理、販売予測を見直し、無理なく続く現場の運営フローを設計します。",
          },
          {
            icon: "📊",
            title: "データ可視化・改善提案",
            description:
              "売上や廃棄、時間帯別の需要を可視化し、毎日の判断をしやすくする仕組みを提供します。",
          },
          {
            icon: "🍞",
            title: "パン文化の未来づくり",
            description:
              "地域や職人の魅力を守りながら、次世代へつながるパン屋のあり方を企画・実装します。",
          },
        ];

  const title = locale === "en" ? "What We Do" : "活動内容";
  const subtitle =
    locale === "en"
      ? "Gentle implementation for bakeries."
      : "パン屋のための、やさしい実装。";

  return (
    <section id="services" className="py-24 px-6 bg-[#f8f1e6]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-amber-700 text-sm font-semibold tracking-widest mb-3">
            {title}
          </p>
          <h2 className="text-4xl font-extrabold text-amber-950">
            {subtitle}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s) => (
            <div
              key={s.title}
              className="p-8 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 transition-colors group"
            >
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="text-xl font-bold text-amber-950 mb-3 group-hover:text-amber-700 transition-colors">
                {s.title}
              </h3>
              <p className="text-amber-900/80 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
