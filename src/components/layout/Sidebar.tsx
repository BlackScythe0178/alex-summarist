"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { BsBookmark } from "react-icons/bs";
import { RiBallPenLine } from "react-icons/ri";
import { FiSettings, FiHelpCircle, FiLogOut, FiLogIn } from "react-icons/fi";
import { RxLetterCaseCapitalize } from "react-icons/rx";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { openAuthModal } from "@/redux/modalSlice";
import { closeSidebar, setFontSize } from "@/redux/uiSlice";
import { logout } from "@/lib/auth";

const FONT_SIZES = [16, 18, 22, 26];

type Item = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  /** pathname prefix that marks this item active */
  match?: string;
};

const topItems: Item[] = [
  { label: "For you", icon: <AiOutlineHome />, href: "/for-you", match: "/for-you" },
  { label: "My Library", icon: <BsBookmark />, href: "/library", match: "/library" },
  { label: "Highlights", icon: <RiBallPenLine /> },
  { label: "Search", icon: <AiOutlineSearch /> },
];

function SidebarItem({ item, active }: { item: Item; active: boolean }) {
  const dispatch = useAppDispatch();
  const inner = (
    <>
      <div className={`sidebar__link--line ${active ? "active--tab" : ""}`} />
      <div className="sidebar__icon--wrapper">{item.icon}</div>
      <div className="sidebar__link--text">{item.label}</div>
    </>
  );
  if (!item.href) {
    return <div className="sidebar__link--wrapper sidebar__link--not-allowed">{inner}</div>;
  }
  return (
    <Link href={item.href} className="sidebar__link--wrapper" onClick={() => dispatch(closeSidebar())}>
      {inner}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const fontSize = useAppSelector((s) => s.ui.fontSize);
  const user = useAppSelector((s) => s.user.user);
  const isPlayer = pathname.startsWith("/player");

  // Close the mobile drawer on navigation
  useEffect(() => {
    dispatch(closeSidebar());
  }, [pathname, dispatch]);

  const handleAuth = () => {
    dispatch(closeSidebar());
    if (user) logout();
    else dispatch(openAuthModal("login"));
  };

  return (
    <>
      <div
        className={`sidebar__overlay ${open ? "" : "sidebar__overlay--hidden"}`}
        onClick={() => dispatch(closeSidebar())}
      />
      <aside className={`sidebar ${open ? "sidebar--opened" : ""}`}>
        <div className="sidebar__logo">
          <Link href="/for-you">
            <Image src="/logo.png" alt="Summarist logo" width={495} height={114} priority />
          </Link>
        </div>
        <div className={`sidebar__wrapper ${isPlayer ? "sidebar__wrapper--player" : ""}`}>
          <div className="sidebar__top">
            {topItems.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                active={!!item.match && pathname.startsWith(item.match)}
              />
            ))}
            {isPlayer && (
              <div className="sidebar__link--wrapper sidebar__font--size-wrapper">
                {FONT_SIZES.map((size, i) => (
                  <button
                    key={size}
                    className={`sidebar__font--size-icon ${fontSize === size ? "sidebar__font--size-icon--active" : ""}`}
                    onClick={() => dispatch(setFontSize(size))}
                    aria-label={`Font size ${size}px`}
                  >
                    <RxLetterCaseCapitalize style={{ width: 16 + i * 4, height: 16 + i * 4 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sidebar__bottom">
            <SidebarItem
              item={{ label: "Settings", icon: <FiSettings />, href: "/settings", match: "/settings" }}
              active={pathname.startsWith("/settings")}
            />
            <SidebarItem item={{ label: "Help & Support", icon: <FiHelpCircle /> }} active={false} />
            <button className="sidebar__link--wrapper" onClick={handleAuth}>
              <div className="sidebar__link--line" />
              <div className="sidebar__icon--wrapper">{user ? <FiLogOut /> : <FiLogIn />}</div>
              <div className="sidebar__link--text">{user ? "Logout" : "Login"}</div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
