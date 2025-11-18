import React from "react";
import classNames from "classnames/bind";
import styles from "./AuthLayout.module.scss";
import LanguageSwitcherGlobal from "@/i18n/LanguageSwitcherGlobal";

const cx = classNames.bind(styles);

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={cx("auth-layout")}>
      {/* Animated Background Shapes */}
      <div className={cx("background-shapes")}>
        <div className={cx("shape", "shape-1")}></div>
        <div className={cx("shape", "shape-2")}></div>
        <div className={cx("shape", "shape-3")}></div>
        <div className={cx("shape", "shape-4")}></div>
        <div className={cx("shape", "shape-5")}></div>
        <div className={cx("shape", "shape-6")}></div>
        <div className={cx("shape", "shape-7")}></div>
        <div className={cx("shape", "shape-8")}></div>
      </div>

      {/* Language Switcher - Top Right */}
      <div className={cx("language-switcher-container")}>
        <LanguageSwitcherGlobal />
      </div>

      {/* Content */}
      <div className={cx("content")}>
        {children}
      </div>
    </div>
  );
}

