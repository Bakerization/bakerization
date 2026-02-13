const services = [
  {
    icon: "🤖",
    title: "AI Operations",
    description:
      "Automate daily bakery workflows with intelligent scheduling, demand forecasting, and smart inventory replenishment powered by machine learning.",
  },
  {
    icon: "📊",
    title: "Data Systems",
    description:
      "Real-time dashboards, sales analytics, and operational insights that give you full visibility into your business — from a single loaf to an entire chain.",
  },
  {
    icon: "🍞",
    title: "Food Technology",
    description:
      "Next-generation production tools that optimize recipes, reduce waste, and scale output without sacrificing the quality your customers love.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 px-6 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">
            What We Do
          </p>
          <h2 className="text-4xl font-extrabold text-white">
            Technology built for bakeries.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s) => (
            <div
              key={s.title}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-colors group"
            >
              <div className="text-4xl mb-5">{s.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                {s.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
