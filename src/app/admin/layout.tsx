import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Studio | Sakshi Shukla Portfolio',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
