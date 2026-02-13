const highlights = [
  { label: "AI-Powered", value: "Operations" },
  { label: "Data-Driven", value: "Growth" },
  { label: "Next-Gen", value: "Food Tech" },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Who We Are
          </p>
          <h2 className="text-4xl font-extrabold text-gray-950 mb-6 leading-tight">
            Reinventing how bakeries operate and grow.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Bakarization is at the intersection of food culture and cutting-edge
            technology. We partner with bakeries of all sizes to modernize their
            operations — from intelligent inventory management and demand
            forecasting to fully automated production workflows. Our mission is
            simple: help great bakers focus on what they love while we handle
            the rest.
          </p>
        </div>

        <div className="grid gap-6">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="flex items-center gap-6 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-amber-400 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl font-bold shrink-0">
                ✦
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{h.label}</p>
                <p className="text-xl font-bold text-gray-950">{h.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
