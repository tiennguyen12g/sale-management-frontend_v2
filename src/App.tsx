import "./App.css";

// Libraries
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Components
import MainPage from "./Pages/MainPage";
import Login from "./AuthPage/Login";
import Register from "./AuthPage/Register";
import ProtectedRoute from "./AuthPage/ProtectedRoute";
import UserPage from "./StaffPage/StaffPage";
import GlobalSocket from "./ultilitis/GlobalSocket";
import ProductTableForStaff from "./Pages/BodyComponent/ProductManage/ProductDetails/ProductTableForStaff";
import NoRoute from "./ultilitis/NoRoute";
import PageMessage from "./Pages/BodyComponent/FacebookAPI/PageMessage";
import { FacebookSDKLoader } from "./Pages/BodyComponent/FacebookAPI/FacebookSDKLoader";
import AdsAccountManagement from "./Pages/BodyComponent/Financial/AdsCosts/AdsAccountManagement";
import SettingPage from "./Pages/SettingPage/SettingPage";
import InitialPage from "./Pages/InitialPage/InitialPage";

//Hooks
import { useHydrateAuth } from "./zustand/hydrationHook";
// Layout
import Layout1 from "./Layout/Layout1";
import LayoutWithSubmenu from "./Layout/LayoutWithSubmenu";
import CreateShopModal from "./TestAPI/createShop";
function App() {
  const location = useLocation();
  // Routes where StaffMenu should NOT appear
  const hideStaffMenuOn = ["/login", "/register", "/home"];
  // Check if current path starts with any excluded route
  const shouldShowStaffMenu = !hideStaffMenuOn.some((path) => location.pathname.startsWith(path));

    const hydrated = useHydrateAuth();
  if (!hydrated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-main">
      {/* <InitialFetchData /> */}
      <GlobalSocket />

      <FacebookSDKLoader appId="2051002559051142" />

      {/* ✅ Only show StaffMenu when allowed */}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<CreateShopModal />} />

        {/* Initial Page - Shop Selection */}
        <Route
          path="/initial"
          element={
            <ProtectedRoute>
              <InitialPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/home/*"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quan-li-don-hang/*"
          element={
            <ProtectedRoute>
              <Layout1>
                <LayoutWithSubmenu />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ho-so-ca-nhan"
          element={
            <ProtectedRoute>
              <Layout1>
                <UserPage />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/danh-sach-san-pham"
          element={
            <ProtectedRoute>
              <Layout1>
                <ProductTableForStaff />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tin-nhan-page"
          element={
            <ProtectedRoute>
              <Layout1>
                <PageMessage />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tai-khoan-ads"
          element={
            <ProtectedRoute>
              <Layout1>
                <AdsAccountManagement />
              </Layout1>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cai-dat"
          element={
            <ProtectedRoute>
              <Layout1>
                <SettingPage />
              </Layout1>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NoRoute />} />
      </Routes>
    </div>
  );
}

export default App;
