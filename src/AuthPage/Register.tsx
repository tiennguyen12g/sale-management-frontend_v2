import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./Register.module.scss";

const cx = classNames.bind(styles);
import { Register_API } from "../configs/api";
import type { StaffRole } from "../zustand/staffStore";
import { SalaryByPosition } from "../zustand/staffStore";
export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [existedEmail, setExistedEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorNotify, setErrorNotify] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("Sale-Staff");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotify("");
    if (repeatPassword !== password) {
      // setError("Mật khẩu nhập lại không khớp!")
      return;
    }

    try {

      const userInfos = {
        email, 
        password, 

        username,
        isCreateProfile: false, 
        registeredDate: new Date().toISOString().split("T")[0],
      }
      const res = await fetch(Register_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfos),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "User already exists") {
          setErrorNotify("Email đã đăng kí");
          setExistedEmail(email)
          return;
        }

        setErrorNotify("Đăng kí lỗi");
        return;
      }

      alert("Đăng kí thành công! Hãy đăng nhập.");
      navigate("/login"); // ✅ redirect to login page
    } catch (err) {
      setErrorNotify("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (repeatPassword !== password) {
      setErrorNotify("Mật khẩu nhập lại không khớp!");
    } else {
      setErrorNotify("");
    }
  }, [password, repeatPassword]);

  useEffect(()=>{
if(email !== existedEmail){
  setErrorNotify("");
}
  },[email, existedEmail])
  const initialForm = {
    role: staffRole,
    staffID: "",
    salary: SalaryByPosition[staffRole],
    joinedDate: new Date().toISOString().split("T")[0],
    staffInfo: {
      name: "",
      birthday: "",
      address: "",
      phone: "",
      relationshipStatus: "",
      religion: "",
      description: "",
      identityId: "",
      accountLogin: "",
    },
    diligenceCount: 0,
    bankInfos: {
      bankAccountNumber: "",
      bankOwnerName: "",
    },
    salaryHistory: [],
    attendance: [],
  };

  return (
    <div className={cx("register-main")}>
      <form onSubmit={handleRegister} className={cx("register-form")}>
        <h2>Đăng kí tài khoản</h2>

        {errorNotify && <div className={cx("error")}>{errorNotify}</div>}

        <div className={cx("form-group")}>
          <label>Tên hiển thị:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ví dụ: tiennguyen12g, hung95 ..."
            required
          />
        </div>

        <div className={cx("form-group")}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className={cx("form-group")}>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className={cx("form-group")}>
          <label>Nhập lại Password:</label>
          <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} required />
        </div>

        <button type="submit" className={cx("btn")} disabled={errorNotify !== "" ? true : false} style={{cursor: errorNotify !== "" ? "not-allowed" : "pointer"}}>
          Đăng kí
        </button>

        <p className={cx("switch-auth")}>
          Bạn đã có tài khoản? <a href="/login">Đăng nhập</a>
        </p>
      </form>
    </div>
  );
}
