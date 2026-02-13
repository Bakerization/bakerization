export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-3">
          Get in Touch
        </p>
        <h2 className="text-4xl font-extrabold text-gray-950 mb-6">
          Ready to transform your bakery?
        </h2>
        <p className="text-gray-600 text-lg mb-10">
          Whether you run a single artisan shop or a growing chain, we&apos;d love
          to show you what&apos;s possible. Reach out and let&apos;s start baking the
          future together.
        </p>
        <a
          href="mailto:hello@bakarization.com"
          className="inline-block px-10 py-4 rounded-xl bg-amber-500 text-gray-950 font-bold text-lg hover:bg-amber-400 transition-colors"
        >
          hello@bakarization.com
        </a>
      </div>

      <footer className="mt-24 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Bakarization. All rights reserved.
      </footer>
    </section>
  );
}
