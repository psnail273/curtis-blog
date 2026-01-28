import Link from 'next/link';

export default function TopBar() {
  return (
    <div className="flex justify-between items-center w-full py-4 px-4 md:px-8">
      <Link href="/" className="text-2xl font-bold text-foreground hover:text-accent transition-colors duration-200 cursor-pointer">
        Curtis Israel
      </Link>
      <div className="text-sm text-text-caption">
        Search
      </div>
    </div>
  );
}