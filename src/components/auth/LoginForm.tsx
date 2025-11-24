import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Login_API } from "@/config/api";
import { useAuthStore } from "@/zustand/authStore";
import { Button, useToastSeri } from "@tnbt/react-favorit-style";
interface Props {
  setSwitchToSignUp?: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function LoginForm({ setSwitchToSignUp }: Props) {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(Login_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("logindata", data);
      if (!res.ok) {
        setError(data.message || t("auth.login.error.loginFailed", "Đăng nhập thất bại"));
        return;
      }

      // 🔑 store token + user
      login(data.token, data.user, data.company, data.branches, data.list_branch_management);

      // ✅ Redirect after login
      // Zustand updates are synchronous, so we can navigate immediately
      navigate("/initial");
    } catch (err) {
      console.log("err", err);
      setError(t("auth.login.error.somethingWentWrong", "Có lỗi, vui lòng thử lại"));
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("auth.login.title", "Đăng nhập")}</h2>
          <p className="text-sm text-gray-600">{t("auth.login.subtitle", "Chọn phương thức đăng nhập bên dưới")}</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">{error}</div>}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.email", "Email Address")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder={t("auth.login.emailPlaceholder", "Nhập email của bạn")}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.password", "Password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder={t("auth.login.passwordPlaceholder", "Nhập mật khẩu")}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          {t("auth.login.signIn", "Đăng nhập")}
        </button>

        <p className="text-center text-sm text-gray-600">
          {t("auth.login.noAccount", "Bạn chưa có tài khoản?")}{" "}
          {/* <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            {t("auth.login.registerLink", "Đăng kí")}
          </Link> */}
          <Button
            variant="link"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            onClick={() => {
              if (setSwitchToSignUp) {
                setSwitchToSignUp(false);
              }
            }}
          >
            {t("auth.login.registerLink", "Đăng kí")}
          </Button>
        </p>
      </form>
    </div>
  );
}
