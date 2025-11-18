import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Login.module.scss";

const cx = classNames.bind(styles);
import { Login_API } from "../config/api";
import { useAuthStore } from "../zustand/authStore";
export default function Login() {
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

      console.log('logindata', data);
      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }
      
      // 🔑 store token + user
      login(data.token, data.user, data.company, data.branches, data.list_branch_management);
      
      // ✅ Redirect after login
      // Zustand updates are synchronous, so we can navigate immediately
      navigate("/initial");

    } catch (err) {
      console.log('err', err);
      setError("Có lỗi, vui lòng thử lại");
    }
  };


  return (
    <div className={cx("login-main")}>
      <form onSubmit={handleLogin} className={cx("login-form")}>
        <h2>Đăng nhập</h2>

        {error && <div className={cx("error")}>{error}</div>}

        <div className={cx("form-group")}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className={cx("form-group")}>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"/>
        </div>

        <button type="submit" className={cx("btn")}>
          Đăng nhập
        </button>

        <p className={cx("switch-auth")}>
          Bạn chưa có tài khoản? <a href="/register">Đăng kí</a>
        </p>
      </form>
    </div>
  );
}
