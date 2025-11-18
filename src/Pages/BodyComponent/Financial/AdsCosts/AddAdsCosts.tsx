import React, { useState } from "react";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./AddAdsCosts.module.scss";
const cx = classNames.bind(styles);
import { type AdsCostType, useAdsCostStore } from "../../../../zustand/adsCostStore";
import { UploadAdsCosts_API } from "../../../../config/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useAuthStore } from "../../../../zustand/authStore";

interface Props {
  setIsOpenAddForm: (open: boolean) => void;
}

export default function AddAdsCosts({ setIsOpenAddForm }: Props) {
  const [mode, setMode] = useState<"manual" | "excel">("manual");
  const { adsCosts, addAdsCost, updateAdsCost, updateUploadExcel } = useAdsCostStore();
  const { getAuthHeader } = useAuthStore();

  // Manual form state
  const [formData, setFormData] = useState<Omit<AdsCostType, "_id">>({
    platform: "TikTok",
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    spendActual: 0,
    ordersDelivered: 0,
    ordersReturned: 0,
    netRevenue: 0,
    platformFee: 0,
    returnFee: 0,
    targetProduct: "",
    idProduct: "",
  });

  // Excel file
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // await axios.post("http://localhost:6000/api-v1/ads-costs/type=add&action=manual", formData);
      if(formData.spendActual === 0 || formData.targetProduct === "") return alert("Please fill the fields");
     const res = await addAdsCost(formData);
     if(res?.status !== 'ok') throw new Error('Add failed');
      alert("✅ Data added successfully!");
      setIsOpenAddForm(false);
    } catch (err) {
      alert("❌ Failed to add data.");
      console.error(err);
    }
  };

  const handleExcelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return;
    const formDataExcel = new FormData();
    formDataExcel.append("file", excelFile);

    try {
      const res = await fetch(UploadAdsCosts_API, {
        method: "POST",
        body: formDataExcel,
        headers: { ...getAuthHeader() },
      });
      const data = await res.json();
      if (!res.ok) return alert("Upload failed: " + data.message);
      await updateUploadExcel(adsCosts, data.inserted); // Clear existing data and refetch
      alert("✅ Excel uploaded successfully!");
      setIsOpenAddForm(false);
    } catch (err) {
      alert("❌ Failed to upload excel.");
      console.error(err);
    }
  };

  return (
    <div className={cx("add-ads-costs-container")}>
      <div className={cx("add-ads-form")}>
        <div className={cx("form-header")}>
          <h4>Add Ads Costs</h4>
          <button onClick={() => setIsOpenAddForm(false)}>✖ Close</button>
        </div>

        {/* Mode Switch */}
        <div className={cx("mode-switch")}>
          <button className={mode === "manual" ? cx("active") : ""} onClick={() => setMode("manual")}>
            Manual Entry
          </button>
          <button className={mode === "excel" ? cx("active") : ""} onClick={() => setMode("excel")}>
            Upload Excel
          </button>
        </div>

        {mode === "manual" ? (
          <form onSubmit={handleManualSubmit} className={cx("form-body")}>
            <div>
              <label>
                Platform:
                <select name="platform" value={formData.platform} onChange={handleManualChange}>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Shopee">Shopee</option>
                </select>
              </label>
              <label>
                Date:
                <input type="date" name="date" value={formData.date} onChange={handleManualChange} />
              </label>
            </div>
            <div>
              <label>
                Target Product:
                <input type="text" name="targetProduct" value={formData.targetProduct} onChange={handleManualChange} />
              </label>
              <label>
                ID Product:
                <input type="text" name="idProduct" value={formData.idProduct} onChange={handleManualChange} />
              </label>
            </div>
            <div>
              <label>
                Spend Actual:
                <input type="number" name="spendActual" value={formData.spendActual} onChange={handleManualChange} />
              </label>
              <label>
                Orders Delivered:
                <input type="number" name="ordersDelivered" value={formData.ordersDelivered} onChange={handleManualChange} />
              </label>
            </div>

            <div>
              <label>
                Orders Returned:
                <input type="number" name="ordersReturned" value={formData.ordersReturned} onChange={handleManualChange} />
              </label>
              <label>
                Net Revenue:
                <input type="number" name="netRevenue" value={formData.netRevenue} onChange={handleManualChange} />
              </label>
            </div>
            <div>
              <label>
                Platform Fee:
                <input type="number" name="platformFee" value={formData.platformFee} onChange={handleManualChange} />
              </label>
              <label>
                Return Fee:
                <input type="number" name="returnFee" value={formData.returnFee} onChange={handleManualChange} />
              </label>
            </div>

            <button type="submit" className={cx("submit-btn")}>
              Save
            </button>
          </form>
        ) : (
          <form onSubmit={handleExcelSubmit} className={cx("form-body")}>
            <label>
              Upload Excel:
              <input type="file" accept=".xlsx" onChange={(e) => setExcelFile(e.target.files?.[0] || null)} />
            </label>
            <button type="submit" className={cx("submit-btn")}>
              Upload
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
