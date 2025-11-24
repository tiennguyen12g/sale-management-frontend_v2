// CallPagePermission.tsx
import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./CallPagePermission.module.scss";
import { useFacebookStore } from "../../../zustand/facebookStore";

const cx = classNames.bind(styles);

declare global {
  interface Window {
    FB: any;
  }
}

export default function FacebookLoginButton() {
  const { user, setUser, setPages, clearFacebookData, saveFacebookUser, checkFacebookStatus } = useFacebookStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);

    window.FB.login(
      function (response: any) {
        if (response.authResponse) {
          const userAccessToken = response.authResponse.accessToken;

          window.FB.api("/me", { fields: "id,name,email,picture" }, async function (profile: any) {
            const userData = { ...profile, userAccessToken: userAccessToken };
            setUser(userData);
            console.log("👤 User:", userData);

            //✅ Fetch pages and save user using store methods
            // const pageRes = await fetchFacebookPages(userAccessToken);
            // if (pageRes.status === "success" && pageRes.data) {
            //   setPages(pageRes.data);
            // }

            await saveFacebookUser(userData);

            setLoading(false);
          });
        } else {
          console.log("❌ User cancelled login or did not fully authorize.");
          setLoading(false);
        }
      },
      { scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_messaging" }
    );
  };

  const handleLogout = () => {
    console.log('Logging out from Facebook...');
    clearFacebookData();
    // window.FB.logout(() => {
      
    //   console.log("👋 Đăng xuất Facebook");
    // });
  };

  return (
    <div className={cx("main")}>
      {!user ? (
        <button onClick={handleLogin} disabled={loading} className={cx("connectBtn")}>
          {loading ? "Đang đăng nhập..." : "Kết nối với Facebook"}
        </button>
      ) : (
        <div className={cx("userBox")}>
          <div className={cx("userInfo")}>
            <img src={user.picture?.data.url} alt={user.name} className={cx("avatar")} />
            <div>
              <strong>{user.name}</strong>
              <div>{user.email || "No email"}</div>
            </div>
          </div>
          <button onClick={handleLogout} className={cx("logoutBtn")}>
            Thoát
          </button>
        </div>
      )}
    </div>
  );
}
