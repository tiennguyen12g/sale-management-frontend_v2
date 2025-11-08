import React from "react";
import MoneyInOut from "./MoneyInOut/MoneyInOut";
import AdsCosts from "./AdsCosts/AdsCosts";
import OperatingCosts from "./OperatingCosts/OperatingCosts";
import StaffSalery from "./Staff/StaffSalery";
import { useMenuStore } from "../../MenuComponent/MenuActiveState";
import { Routes, Route } from "react-router-dom";

export default function Finance() {
  const { openMenu, activeSubmenu, setOpenMenu, setActiveSubmenu } = useMenuStore();
  let contentShow: React.ReactNode = "";

  // activeSubmenu: import; delivery; money, costs, ads, salary
  switch (activeSubmenu) {
    case "money":
      contentShow = <MoneyInOut />;
      break;
    case "costs":
      contentShow = <OperatingCosts />;
      break;
    case "ads":
      contentShow = <AdsCosts />;
      break;
    case "salary":
      contentShow = <StaffSalery />;
      break;
    default:
      break;
  }
  return <div>{contentShow}</div>;
}

// export default function Finance() {
//   return (
//     <Routes>
//       <Route path="money" element={<MoneyInOut />} />
//       <Route path="costs" element={<OperatingCosts />} />
//       <Route path="salary" element={<StaffSalery />} />
//       <Route path="ads" element={<AdsCosts />} />
//       <Route index element={<MoneyInOut />} /> {/* default */}
//     </Routes>
//   );
// }