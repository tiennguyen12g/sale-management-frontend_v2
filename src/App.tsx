import "./App.css";

// Libraries
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "@i18n/i18next";
import { I18nProvider } from "@/i18n";
// Components
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./AuthPage/ProtectedRoute";
import UserPage from "./StaffPage/StaffPage";
import GlobalSocket from "./ultilitis/GlobalSocket";
import ProductTableForStaff from "./pages/BodyComponent/ProductManage/ProductDetails/ProductTableForStaff";
import Error404 from "@/components/common/Error404";
import PageMessage from "./pages/BodyComponent/FacebookAPI/PageMessage";
import { FacebookSDKLoader } from "./pages/BodyComponent/FacebookAPI/FacebookSDKLoader";
import AdsAccountManagement from "./pages/BodyComponent/Financial/AdsCosts/AdsAccountManagement";
import SettingPage from "./pages/SettingPage/SettingPage";
import InitialPage from "./pages/InitialPage/InitialPage";

//Hooks
import { useHydrateAuth } from "./zustand/hydrationHook";
// Layout
import Layout1 from "./layout/Layout1";
import LayoutWithSubmenu from "./layout/LayoutWithSubmenu";
import CreateShopModal from "./TestAPI/createShop";

import LoginSignUpPage from "@/pages/auth/LoginSignUpPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignUpPage from "@/pages/auth/SignUpPage";
function AppContent() {
  const location = useLocation();
  // Routes where StaffMenu should NOT appear
  const hideStaffMenuOn = ["/login", "/register", "/auth", "/home"];
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
        <Route path="/auth" element={<LoginSignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />

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
        <Route path="*" element={<Error404 />} />
      </Routes>
    </div>
  );
}
function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
