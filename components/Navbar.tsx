export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-sm border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-white font-bold text-xl tracking-tight">
          Bakarization
        </span>
        <ul className="flex items-center gap-8 text-sm text-gray-400">
          <li>
            <a href="#about" className="hover:text-amber-400 transition-colors">
              About
            </a>
          </li>
          <li>
            <a href="#services" className="hover:text-amber-400 transition-colors">
              Services
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="px-4 py-2 rounded-lg bg-amber-500 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
            >
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
