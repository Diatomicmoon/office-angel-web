"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function SidebarClientWrapper() {
  const pathname = usePathname();
  const publicRoutes = ["/", "/login", "/pricing", "/about", "/signup-secret", "/privacy-policy", "/terms"];
  const isPublicPage = publicRoutes.includes(pathname);

  if (isPublicPage) return null;
  return <Sidebar />;
}
