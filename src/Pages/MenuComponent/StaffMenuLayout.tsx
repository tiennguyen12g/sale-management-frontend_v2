import React from "react";
import { useStaffMenuStore } from "../../zustand/menuCollapsed";
import classNames from "classnames/bind";
import styles from "./StaffMenuLayout.module.scss";

const cx = classNames.bind(styles);

export default function StaffMenuLayout({ children }: { children: React.ReactNode }) {
  const { menuCollapsed } = useStaffMenuStore();

  return (
    <div className={cx("staff-layout")}>
      {/* Left menu */}
      <div className={cx("menu-wrapper", { collapsed: menuCollapsed })}>
        {/* <StaffMenu /> */}
      </div>

      {/* Main content */}
      <div className={cx("content", { collapsed: menuCollapsed })}>
        {children}
      </div>
    </div>
  );
}
