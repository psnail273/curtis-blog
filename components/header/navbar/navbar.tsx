import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex gap-8 md:gap-16 justify-center items-center w-full py-3 px-4">
      <Link
        href="/"
        className="nav-link uppercase text-sm tracking-wide font-medium text-secondary hover:text-accent relative transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
      >
        Home
      </Link>
      <Link
        href="/articles"
        className="nav-link uppercase text-sm tracking-wide font-medium text-secondary hover:text-accent relative transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
      >
        Articles
      </Link>
      <Link
        href="/about"
        className="nav-link uppercase text-sm tracking-wide font-medium text-secondary hover:text-accent relative transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
      >
        About
      </Link>
    </nav>
  );
}