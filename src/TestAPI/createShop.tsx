import React, { useState } from "react";
import axios from "axios";
import { useAuthStore } from "../zustand/authStore";
const PLATFORM_LIST = ["facebook", "instagram", "zalo", "tiktok", "shopee"];

export default function CreateShopModal() {
  const [shop_name, setShopName] = useState("");
  const [platform_id, setPlatformId] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [loading, setLoading] = useState(false);
  const {getAuthHeader} = useAuthStore();

  const submit = async () => {
    if (!shop_name || !platform_id) return alert("Missing fields");
    setLoading(true);

    try {
      await axios.post("http://localhost:4000/api-v1/test", {
        shop_name,
        platform_id,
        platform,
        avatar_url: `https://picsum.photos/seed/${shop_name}/200`
      }, { headers: { ...getAuthHeader() } });

    } catch (err) {
        console.log('err', err);
      alert("Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: "#fff", borderRadius: 8 }}>
      <h3>Create Simulated Shop</h3>

      <div>
        <label>Shop Name</label>
        <input value={shop_name} onChange={e => setShopName(e.target.value)} />
      </div>

      <div>
        <label>Platform ID</label>
        <input value={platform_id} onChange={e => setPlatformId(e.target.value)} />
      </div>

      <div>
        <label>Platform</label>
        <select value={platform} onChange={e => setPlatform(e.target.value)}>
          {PLATFORM_LIST.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      <button onClick={submit} disabled={loading}>
        {loading ? "Saving..." : "Create Shop"}
      </button>
    </div>
  );
}
