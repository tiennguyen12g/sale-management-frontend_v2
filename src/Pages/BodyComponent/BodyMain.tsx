import React from "react";
import classNames from "classnames/bind";
import styles from "./BodyMain.module.scss";
const cx = classNames.bind(styles);

import Overview from "./Overview";
import Finance from "./Financial/Finance";
import ProductManage from "./ProductManage/ProductManage";
import { useMenuStore } from "../MenuComponent/MenuActiveState";
export default function BodyMain() {
  const { openMenu, activeSubmenu, setOpenMenu, setActiveSubmenu } = useMenuStore();

  let contentShow: React.ReactNode = "";
  switch (activeSubmenu) {
    case "money":
    case "costs":
    case "salary":
    case "ads":
      contentShow = <Finance />;
      break;
    case "dashboard":
      contentShow = <Overview />;
      break;
    case "import":
    case "delivery":
    case "product-detail":
    case "page-select":
      contentShow = <ProductManage />;
      break;
    default:
      break;
  }
  return <div className={cx("body-main")}>{contentShow}</div>;
}
