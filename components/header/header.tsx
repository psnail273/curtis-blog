import Navbar from './navbar/navbar';
import TopBar from './topBar/topBar';

export default function Header() {
  return (
    <header className="flex flex-col border-b border-border mb-6">
      <TopBar />
      <Navbar />
    </header>
  );
}