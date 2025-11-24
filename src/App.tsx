import "./App.css";

// Libraries
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "@i18n/i18next";
import { I18nProvider } from "@/i18n";
// Components
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import StaffPage from "@/pages/StaffPage/StaffPage";
import GlobalSocket from "./utils/GlobalSocket";
import ProductTableForStaff from "./pages/BodyComponent/ProductManage/ProductDetails/ProductTableForStaff";
import Error404 from "@/components/common/Error404";
import PageMessage from "./pages/BodyComponent/MessagePage/PageMessage";
import { FacebookSDKLoader } from "./lib/SDKs/FacebookSDKLoader";
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
import { ToastContainer } from "@tnbt/react-favorit-style";
import ToastExample from "@/playground/examples/TestToast";
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
        <Route path="/test" element={<ToastExample />} />

        {/* //-- Initial Page - Shop Selection */}
        <Route
          path="/initial"
          element={
            <ProtectedRoute>
              <InitialPage />
            </ProtectedRoute>
          }
        />

        {/* //-- Protected routes */}
        <Route
          path="/home/*"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-management/*"
          element={
            <ProtectedRoute>
              <Layout1>
                <LayoutWithSubmenu />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile-in-company"
          element={
            <ProtectedRoute>
              <Layout1>
                <StaffPage />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/product-list"
          element={
            <ProtectedRoute>
              <Layout1>
                <ProductTableForStaff />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Layout1>
                <PageMessage />
              </Layout1>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ads-account"
          element={
            <ProtectedRoute>
              <Layout1>
                <AdsAccountManagement />
              </Layout1>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
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
      <ToastContainer />
    </I18nProvider>
  );
}

export default App;
