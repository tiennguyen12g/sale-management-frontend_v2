import React, { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Register_API } from "@/config/api";
import type { StaffRole } from "@/zustand/staffStore";
import { SalaryByPosition } from "@/zustand/staffStore";
import { useToastSeri, SuccessProcessing, Button } from "@tnbt/react-favorit-style";

interface Props {
  setSwitchToLogin?: Dispatch<SetStateAction<boolean>>;
}
export default function SignUpForm({ setSwitchToLogin }: Props) {
  const { t } = useTranslation();
  // const { notificationToasts, successToast, errorToast, warningToast, infoToast, loadingToast, removeToast, setNotificationToasts, addToast } = useToastSeri();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [existedEmail, setExistedEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorNotify, setErrorNotify] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("Sale-Staff");
  const navigate = useNavigate();
  const [notificationBox, setNotificationBox] = useState({
    isProcessing: false,
    isSuccess: false,
    isShowNotification: false,
  });
  const handleChangeNotificationBoxState = (datas: { field: "process" | "show" | "success"; value: any }[]) => {
    for (const data of datas) {
      const field = data.field;
      const value = data.value;
      if (field === "process") {
        setNotificationBox((prev) => {
          return { ...prev, isProcessing: value };
        });
      } else if (field === "show") {
        setNotificationBox((prev) => {
          return { ...prev, isShowNotification: value };
        });
      } else if (field === "success") {
        setNotificationBox((prev) => {
          return { ...prev, isSuccess: value };
        });
      }
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotify("");
    if (repeatPassword !== password) {
      // setError("Mật khẩu nhập lại không khớp!")
      return;
    }

    try {
      // const loadingId = addToast("loading", t("auth.signup.processing", "Đang xử lí..."), "Xin chờ...");
      handleChangeNotificationBoxState([
        { field: "process", value: true },
        { field: "show", value: true },
        { field: "success", value: false },
      ]);
      const userInfos = {
        email,
        password,

        username,
        isCreateProfile: false,
        registeredDate: new Date().toISOString().split("T")[0],
      };
      // await new Promise((resolve) => setTimeout(resolve, 3000));
      const res = await fetch(Register_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInfos),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "User already exists") {
          setErrorNotify(t("auth.signup.error.emailExists", "Email đã đăng kí"));
          setExistedEmail(email);
          // Stop processing and hide box on known error
          handleChangeNotificationBoxState([
            { field: "process", value: false },
            { field: "show", value: false },
            { field: "success", value: false },
          ]);
          return;
        }
        // Generic error - stop and hide processing box
        handleChangeNotificationBoxState([
          { field: "process", value: false },
          { field: "show", value: false },
          { field: "success", value: false },
        ]);
        setErrorNotify(t("auth.signup.error.registrationFailed", "Đăng kí lỗi"));
        return;
      }
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      // setNotificationToasts((prev) =>
      //   prev.map((toast) => (toast.id === loadingId ? { ...toast, type: "success", title: "Payment Successful!", duration: 4000 } : toast))
      // );

      // alert(t("auth.signup.success.registrationSuccess", "Đăng kí thành công! Hãy đăng nhập."));
      // Show success state (processing finished)
      handleChangeNotificationBoxState([
        { field: "process", value: false },
        { field: "success", value: true },
      ]);
      //navigate("/login"); // ✅ redirect to login page
    } catch (err) {
      // Stop and hide processing box on unexpected error
      handleChangeNotificationBoxState([
        { field: "process", value: false },
        { field: "show", value: false },
        { field: "success", value: false },
      ]);
      setErrorNotify(t("auth.signup.error.somethingWentWrong", "Something went wrong. Please try again."));
    }
  };

  useEffect(() => {
    if (repeatPassword !== password && repeatPassword !== "") {
      setErrorNotify(t("auth.signup.error.passwordsNotMatch", "Mật khẩu nhập lại không khớp!"));
    } else if (repeatPassword === password && repeatPassword !== "") {
      setErrorNotify("");
    }
  }, [password, repeatPassword, t]);

  useEffect(() => {
    if (email !== existedEmail) {
      setErrorNotify("");
    }
  }, [email, existedEmail]);
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
    <div className="flex items-center justify-center w-full px-4">
      <form onSubmit={handleRegister} className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("auth.signup.title", "Đăng ký")}</h2>
          <p className="text-sm text-gray-600">{t("auth.signup.subtitle", "Vui lòng điền thông tin bên dưới")}</p>
        </div>

        {errorNotify && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">{errorNotify}</div>}

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.signup.name", "Tên hiển thị")}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("auth.signup.namePlaceholder", "Ví dụ: tiennguyen12g, hung95 ...")}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
            />
          </div>

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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              placeholder={t("auth.signup.emailPlaceholder", "Nhập email của bạn")}
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              placeholder={t("auth.signup.passwordPlaceholder", "Nhập mật khẩu")}
            />
          </div>

          <div>
            <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.confirmPassword", "Confirm Password")}
            </label>
            <input
              id="repeatPassword"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
              placeholder={t("auth.signup.confirmPasswordPlaceholder", "Nhập lại mật khẩu")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={errorNotify !== ""}
          className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${
            errorNotify !== "" ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {t("auth.signup.createAccount", "Đăng kí")}
        </button>

        <p className="text-center text-sm text-gray-600">
          {t("auth.signup.haveAccount", "Bạn đã có tài khoản?")}{" "}
          {/* <Link to="/login" className="text-green-600 hover:text-green-700 font-medium hover:underline">
            {t("auth.signup.loginLink", "Đăng nhập")}
          </Link> */}
          <Button
            variant="link"
            className="text-green-600 hover:text-green-700 font-medium hover:underline"
            onClick={() => {
              if (setSwitchToLogin) {
                setSwitchToLogin(true);
              }
            }}
          >
            {t("auth.signup.loginLink", "Đăng nhập")}
          </Button>
        </p>
      </form>
      {notificationBox.isShowNotification && (
        <SuccessProcessing
          isProcessing={notificationBox.isProcessing}
          statusSuccess={notificationBox.isSuccess}
          onCloseBox={() =>
            setNotificationBox((prev) => {
              return { ...prev, isShowNotification: false };
            })
          }
          size="sm"
          successText="Successful!"
          errorText="Failed!"
          waitingText="Creating account..."
          messageText={t("auth.signup.success.registrationSuccess", "Đăng kí thành công! Hãy đăng nhập.")}
          newButtonText="Login now"
          isNewButton={true}
          newButtonOnClick={() => {
            console.log("Go to login page");
            if (setSwitchToLogin) {
              setSwitchToLogin(true);
            }
          }}
          isAutoNavigate={true}
          navigateDelaySeconds={5} // 3 seconds
          autoNavigateFunction={() => {
            console.log("navigate");
            if (setSwitchToLogin) {
              setSwitchToLogin(true);
            }
          }}
        />
      )}
    </div>
  );
}
