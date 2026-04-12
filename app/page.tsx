import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import { getServerLocale } from "@/lib/i18n";

export default async function Home() {
  const locale = await getServerLocale();

  return (
    <>
      <Hero locale={locale} />
      <Services locale={locale} />
      <Contact locale={locale} />
    </>
  );
}
