import type { Metadata } from "next";
import Image from "next/image";
import Wordmark from "@/components/brand/Wordmark";
import JsonLd from "@/components/JsonLd";
import { HOME_VARIANTS, INTERNATIONAL_COPY, type InternationalLanguage } from "@/lib/international";
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { COMPANY } from "@/lib/company";
import styles from "./international.module.css";

export function internationalMetadata(language: InternationalLanguage): Metadata {
  const copy = INTERNATIONAL_COPY[language];
  const canonical = absoluteUrl(`/${language}`);
  return {
    title: { absolute: copy.title },
    description: copy.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: Object.fromEntries([
        ...HOME_VARIANTS.map((v) => [v.language, absoluteUrl(v.path)]),
        ["x-default", absoluteUrl("/")],
      ]),
    },
    openGraph: {
      type: "website", title: copy.title, description: copy.description,
      siteName: "Bakerization", url: canonical, locale: copy.ogLocale,
      alternateLocale: ["ja_JP", "en_US", language === "zh" ? "ko_KR" : "zh_CN"],
      images: [absoluteUrl(DEFAULT_OG_IMAGE)],
    },
    twitter: { card: "summary_large_image", title: copy.title, description: copy.description, images: [absoluteUrl(DEFAULT_OG_IMAGE)] },
  };
}

export default function InternationalLanding({ language }: { language: InternationalLanguage }) {
  const copy = INTERNATIONAL_COPY[language];
  const home = absoluteUrl("/");
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Organization", "@id": `${home}#organization`, name: "Bakerization", url: home, email: COMPANY.email, slogan: "We Bake the Future" },
        { "@context": "https://schema.org", "@type": "WebPage", "@id": absoluteUrl(`/${language}`), url: absoluteUrl(`/${language}`), name: copy.title, description: copy.description, inLanguage: copy.language, isPartOf: { "@id": `${home}#website` }, about: { "@id": `${home}#organization` } },
      ]} />
      <header className={styles.header}>
        <a href={`/${language}`} aria-label="Bakerization" className={styles.wordmark}><Wordmark height={18} /></a>
        <nav aria-label={language === "zh" ? "语言" : "언어"} className={styles.languages}>
          {HOME_VARIANTS.map((v) => (
            <a key={v.language} href={v.language === "ja" ? "/?lang=ja" : v.path} hrefLang={v.language} lang={v.language} aria-current={v.language === copy.language ? "page" : undefined}>{v.label}</a>
          ))}
        </nav>
      </header>
      <main>
        <section className={styles.hero}>
          <div className={styles.inner}>
            <p className={styles.eyebrow}>BAKERIZATION · WE BAKE THE FUTURE</p>
            <h1>{copy.heading}</h1>
            <p className={styles.intro}>{copy.intro}</p>
            <a className={styles.button} href="#activities">{copy.action}</a>
          </div>
        </section>
        <nav className={`${styles.inner} ${styles.sections}`} aria-label={language === "zh" ? "本页导航" : "페이지 목차"}>
          {["about", "activities", "resources", "contact"].map((id, i) => <a key={id} href={`#${id}`}>{copy.nav[i]}</a>)}
        </nav>
        <section id="about" className={`${styles.inner} ${styles.section} ${styles.about}`}>
          <div>
            <h2>{copy.aboutHeading}</h2>
            {copy.about.map((text) => <p key={text}>{text}</p>)}
            <a href="/about?lang=ja">{copy.aboutLink}</a>
          </div>
          <Image src="/illustrations/wheat-field.webp" alt={copy.imageAlt} width={1000} height={750} sizes="(max-width: 800px) 100vw, 40vw" className={styles.image} />
        </section>
        <section id="activities" className={`${styles.inner} ${styles.section}`}>
          <h2>{copy.servicesHeading}</h2>
          <div className={styles.grid}>
            {copy.services.map((s) => <article key={s.href} className={styles.card}><h3>{s.title}</h3><p>{s.text}</p><a href={s.href}>{copy.detailLink}</a></article>)}
          </div>
        </section>
        <section className={styles.product}>
          <div className={`${styles.inner} ${styles.section}`}>
            <p className={styles.eyebrow}>KIJI HUB</p>
            <h2>{copy.productHeading}</h2>
            <p>{copy.product}</p>
            <p className={styles.note}>{copy.productStatus}</p>
            <a className={styles.button} href="/app?lang=ja">{copy.productLink}</a>
          </div>
        </section>
        <section id="resources" className={`${styles.inner} ${styles.section}`}>
          <h2>{copy.resourcesHeading}</h2>
          <div className={styles.grid}>
            {copy.resources.map((r) => <article key={r.href} className={styles.card}><h3>{r.title}</h3><p>{r.text}</p><a href={r.href}>{r.label}</a></article>)}
          </div>
          <p className={styles.note}>{copy.languageNote}</p>
        </section>
        <section id="contact" className={styles.contact}>
          <div className={`${styles.inner} ${styles.section}`}>
            <h2>{copy.contactHeading}</h2>
            <p>{copy.contact}</p>
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            <p><a className={styles.button} href="/contact?lang=en">{copy.contactLink}</a></p>
          </div>
        </section>
      </main>
      <footer className={`${styles.inner} ${styles.footer}`}><span>© {new Date().getFullYear()} Bakerization</span><a href="/privacy?lang=ja">{copy.privacy}</a></footer>
    </>
  );
}
