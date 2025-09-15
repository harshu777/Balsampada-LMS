'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Dashboard routes that should not have header/footer
  const isDashboardRoute = 
    pathname?.startsWith('/admin') || 
    pathname?.startsWith('/teacher') || 
    pathname?.startsWith('/student');
  
  // Auth routes that should not have footer (but keep header for navigation back)
  const isAuthRoute = 
    pathname?.startsWith('/login') || 
    pathname?.startsWith('/register');

  return (
    <>
      {!isDashboardRoute && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!isDashboardRoute && !isAuthRoute && <Footer />}
    </>
  );
}