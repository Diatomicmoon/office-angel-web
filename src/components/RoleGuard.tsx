"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const publicRoutes = ["/", "/login", "/pricing", "/about", "/signup-secret", "/privacy-policy", "/terms"];
const fieldRepAllowedRoutes = ["/field-app", "/canvassing", "/timesheets"];

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (publicRoutes.includes(pathname) || pathname.startsWith("/portal")) {
      setLoading(false);
      return;
    }

    // NOTE: Auth protection is handled by server-side middleware.
    // RoleGuard only needs to enforce field_rep route restrictions.
    async function checkRole() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );
        const { data: sessionRes } = await supabase.auth.getSession();
        const user = sessionRes?.session?.user;

        // No session yet — middleware will handle redirect if needed. Just render.
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("company_memberships")
          .select("role")
          .eq("user_id", user.id)
          .limit(1);

        if (data && data.length > 0) {
          const userRole = data[0].role;
          setRole(userRole);

          if (userRole === "field_rep") {
            const isAllowed = fieldRepAllowedRoutes.some(route => pathname.startsWith(route));
            if (!isAllowed) {
              router.push("/field-app");
            }
          }
        }
      } catch (err) {
        console.error("Role check failed", err);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [pathname, router]);

  if (loading && !publicRoutes.includes(pathname) && !pathname.startsWith("/portal")) {
    return <div className="p-12 text-center text-gray-500">Loading...</div>;
  }

  // Double check render block just in case
  if (role === "field_rep" && !fieldRepAllowedRoutes.some(r => pathname.startsWith(r))) {
    return <div className="p-12 text-center text-gray-500">Redirecting to Field App...</div>;
  }

  return <>{children}</>;
}
