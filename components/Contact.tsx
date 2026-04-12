import ContactForm from "@/components/ContactForm";
import { Locale } from "@/lib/i18n";

export default function Contact({ locale }: { locale: Locale }) {
  const t =
    locale === "en"
      ? {
          section: "Contact",
          heading: "Shall we build the future of bakeries together?",
          body: "From small local bakeries to growing chains, we propose practical solutions tailored to your operations.",
        }
      : {
          section: "お問い合わせ",
          heading: "一緒に、パン屋の未来をつくりませんか？",
          body: "小さなお店から地域に根ざしたベーカリーまで、現場に合わせた形で課題解決をご提案します。まずはお気軽にご相談ください。",
        };

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-amber-700 text-sm font-semibold tracking-widest mb-3">
          {t.section}
        </p>
        <h2 className="text-4xl font-extrabold text-amber-950 mb-6">
          {t.heading}
        </h2>
        <p className="text-amber-900/80 text-lg mb-10">
          {t.body}
        </p>
        <ContactForm locale={locale} />
      </div>

      <footer className="mt-24 text-center text-sm text-amber-800/70">
        © {new Date().getFullYear()} Bakerization. All rights reserved.
      </footer>
    </section>
  );
}
