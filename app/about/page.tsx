import { getServerLocale } from "@/lib/i18n";

export const metadata = {
  title: "Our Information | Bakerization",
  description: "Bakerizationの団体情報ページ",
};

export default async function AboutPage() {
  const locale = await getServerLocale();

  const t =
    locale === "en"
      ? {
          tag: "OUR INFORMATION",
          title: "Bakerization Leadership & Statement",
          subtitle:
            "A clean and transparent profile of our founder and ethical commitments.",
          founder: "Founder",
          name: "Hiroaki Ikeda",
          role: "Founder, Bakerization",
          statementTitle: "Statement",
          statement:
            "Bakerization was founded to solve structural social challenges faced by bakeries. We believe that food, craft, and business ethics can coexist through practical systems and long-term responsibility.",
          principlesTitle: "Core Principles",
          p1: "Practical value for bakery operators and teams",
          p2: "Transparency in operations, data, and decision-making",
          p3: "Respect for local culture, craft, and ethical growth",
          profileImageAlt: "Portrait of Hiroaki Ikeda",
          note:
            "You can replace the placeholder portrait file in /public with your official asset.",
        }
      : {
          tag: "団体情報",
          title: "Bakerization 代表者情報とステートメント",
          subtitle:
            "創設者プロフィールと、私たちが大切にする高い倫理観を明確に示します。",
          founder: "創設者",
          name: "池田浩明",
          role: "Bakerization 代表",
          statementTitle: "ステートメント",
          statement:
            "Bakerizationは、パン屋が抱える構造的な社会課題を解決するために生まれました。食文化・職人性・経営倫理が共存できる仕組みを、現場と長期視点の両方から実装していきます。",
          principlesTitle: "行動原則",
          p1: "現場にとって実効性のある価値を提供する",
          p2: "運営・データ・意思決定の透明性を担保する",
          p3: "地域文化と職人性を尊重した持続的成長を目指す",
          profileImageAlt: "池田浩明のポートレート",
          note:
            "__",
        };

  return (
    <main className="min-h-screen bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 rounded-2xl border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">{t.tag}</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">{t.title}</h1>
          <p className="mt-4 text-slate-600">{t.subtitle}</p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-7">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-500">{t.founder}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{t.name}</h2>
            <p className="mt-1 text-slate-600">{t.role}</p>

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src="/ikeda.jpeg"
                alt={t.profileImageAlt}
                className="h-[320px] w-full object-cover"
              />
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-7">
            <h3 className="text-2xl font-bold text-slate-900">{t.statementTitle}</h3>
            <p className="mt-4 leading-8 text-slate-700">{t.statement}</p>

            <h4 className="mt-8 text-lg font-bold text-slate-900">{t.principlesTitle}</h4>
            <ul className="mt-3 space-y-3 text-slate-700">
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">{t.p1}</li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">{t.p2}</li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">{t.p3}</li>
            </ul>
            <p className="mt-6 text-xs text-slate-500">{t.note}</p>
          </article>
        </section>
      </div>
    </main>
  );
}
