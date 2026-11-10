"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  History,
  Target,
  ChartNoAxesCombined,
  Settings,
  Trophy,
} from "lucide-react";

const items = [
  { href: "/", label: "홈", Icon: Home },
  { href: "/history", label: "기록", Icon: History },
  { href: "/goals", label: "목표", Icon: Target },
  { href: "/analytics", label: "분석", Icon: ChartNoAxesCombined },
  { href: "/achievements", label: "달성", Icon: Trophy },
  { href: "/settings", label: "설정", Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {items.map(({ href, label, Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={19} strokeWidth={2.1} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
