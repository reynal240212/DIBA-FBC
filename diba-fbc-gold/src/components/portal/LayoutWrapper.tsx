'use client';

import { usePathname } from 'next/navigation';
import PortalNavbar from "@/components/portal/PortalNavbar";
import PortalFooter from "@/components/portal/PortalFooter";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/perfil') || pathname?.startsWith('/login');

  return (
    <>
      {!isAdminPage && <PortalNavbar />}
      {children}
      {!isAdminPage && <PortalFooter />}
    </>
  );
}
