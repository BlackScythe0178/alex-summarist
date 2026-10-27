"use client";

import Image from "next/image";
import { useHomeLogin } from "@/hooks/useHomeLogin";

export default function HomeNav() {
  const handleLogin = useHomeLogin();
  return (
    <nav className="nav">
      <div className="nav__wrapper">
        <figure className="nav__img--mask">
          <Image className="nav__img" src="/logo.png" alt="logo" width={495} height={114} preload />
        </figure>
        <ul className="nav__list--wrapper">
          <li className="nav__list nav__list--login" onClick={handleLogin}>
            Login
          </li>
          <li className="nav__list nav__list--mobile">About</li>
          <li className="nav__list nav__list--mobile">Contact</li>
          <li className="nav__list nav__list--mobile">Help</li>
        </ul>
      </div>
    </nav>
  );
}
