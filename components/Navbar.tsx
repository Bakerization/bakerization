import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Locale } from "@/lib/i18n";

export default function Navbar({ locale }: { locale: Locale }) {
  const t = {
    home: locale === "en" ? "Home" : "トップ",
    services: locale === "en" ? "Services" : "活動内容",
    blog: locale === "en" ? "Blog" : "ブログ",
    about: locale === "en" ? "Our Information" : "団体情報",
    contact: locale === "en" ? "Contact" : "お問い合わせ",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-amber-100">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-amber-900 font-bold text-xl tracking-tight">
          Bakerization
        </Link>
        <ul className="flex items-center gap-6 text-sm text-amber-900/80">
          <li>
            <Link href="/" className="hover:text-amber-700 transition-colors">
              {t.home}
            </Link>
          </li>
          <li>
            <Link href="/#services" className="hover:text-amber-700 transition-colors">
              {t.services}
            </Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-amber-700 transition-colors">
              {t.blog}
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-amber-700 transition-colors">
              {t.about}
            </Link>
          </li>
          <li>
            <Link
              href="/#contact"
              className="px-4 py-2 rounded-lg bg-amber-200 text-amber-900 font-semibold hover:bg-amber-300 transition-colors"
            >
              {t.contact}
            </Link>
          </li>
          <li>
            <LanguageSwitcher locale={locale} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
