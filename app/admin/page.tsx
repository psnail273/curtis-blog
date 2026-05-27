import type { Metadata } from 'next';
import { AdminPageContent } from './AdminPageContent';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Content management dashboard.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPageContent />;
}
