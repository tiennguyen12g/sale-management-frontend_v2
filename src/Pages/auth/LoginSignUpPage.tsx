import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames/bind";
import styles from "./LoginSignUpPage.module.scss";
import AuthLayout from "@/layout/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";

const cx = classNames.bind(styles);

export default function LoginSignUpPage() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthLayout>
      <div className={cx("login-signup-container")}>
        {/* Toggle Buttons */}
        <div className={cx("toggle-buttons")}>
          <button
            onClick={() => setIsLogin(true)}
            className={cx("toggle-btn", { active: isLogin })}
          >
            {t("auth.login.title", "Đăng nhập")}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={cx("toggle-btn", { active: !isLogin })}
          >
            {t("auth.signup.title", "Đăng ký")}
          </button>
        </div>

        {/* Form Container */}
        <div className={cx("form-container")}>
          {isLogin ? <LoginForm /> : <SignUpForm />}
        </div>
      </div>
    </AuthLayout>
  );
}
