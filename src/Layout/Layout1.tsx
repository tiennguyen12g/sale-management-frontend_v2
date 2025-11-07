import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./Layout1.module.scss";
const cx = classNames.bind(styles);
import { useMainMenuStore } from "../zustand/mainMenuCollapsed";
import MainMenu from "./MainMenu";
export default function Layout1({ children }: { children: React.ReactNode }) {
  const { menuCollapsed } = useMainMenuStore();
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={cx("main-new-layout")}>
      <div className={cx("left-menu")} style={{ width: menuCollapsed ? 65 : 165 }}>
        <MainMenu isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      <div className={cx("main-body")}>{children}</div>
    </div>
  );
}
