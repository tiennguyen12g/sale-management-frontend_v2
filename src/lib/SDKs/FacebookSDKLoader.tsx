import { useEffect } from "react";

interface FacebookSDKLoaderProps {
  appId: string;
  version?: string;
}

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB: any;
  }
}

export const FacebookSDKLoader = ({
  appId,
  version = "v24.0",
}: FacebookSDKLoaderProps) => {
  useEffect(() => {
    // Avoid re-injecting if already loaded
    if (document.getElementById("facebook-jssdk")) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: true,
        version,
      });
      console.log("✅ Facebook SDK initialized");
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Optional cleanup if you ever remount with a different App ID
      const existingScript = document.getElementById("facebook-jssdk");
      if (existingScript) existingScript.remove();
      delete window.FB;
      delete window.fbAsyncInit;
    };
  }, [appId, version]);

  return null;
};
