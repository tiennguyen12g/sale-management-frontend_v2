import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./OperatingCosts.module.scss";
const cx = classNames.bind(styles);

// import { operatingCostsData } from "../DataTest/DataForOperatingCost";
import type { OperatingCostsDataType, OperatingAcctionType } from "../DataTest/DataForOperatingCost";
import OperatingCostsChart from "../Charts/OperatingCostsChart";
import { AddOperatingCost_API, UploadOperatingCost_API } from "../../../../config/api";
import { useOperatingCostsStore } from "../../../../zustand/operatingCostsStore";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import UploadExcelBox from "../../../../utils/UploadExcelBox";
import { useAuthStore } from "../../../../zustand/authStore";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
export default function OperatingCosts() {
  const { costs, fetchCosts, addCost, updateCost, deleteCost, loading, updateUploadExcel } = useOperatingCostsStore();
  const { getAuthHeader } = useAuthStore();
  useEffect(() => {
    fetchCosts(getAuthHeader());
  }, [fetchCosts]);

  // const operatingCostsData = costs;
  console.log("costs", costs);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState("all");
  const [filterMode, setFilterMode] = useState<"month" | "year" | "all">("all");
  const [isShowAddBox, setIsShowAddBox] = useState(false);
  const [isShowEditBox, setIsShowEditBox] = useState(false);
  const [isShowUploadBox, setIsShowUploadBox] = useState(false);
  const [editData, setEditData] = useState<OperatingCostsDataType>({
    _id: "",
    action: "electric",
    date: new Date().toISOString().split("T")[0],
    value: 0,
    usedFor: "",
    note: "",
  });

  // Add New form state
  const [form, setForm] = useState({
    action: "electric" as OperatingAcctionType,
    date: new Date().toISOString().split("T")[0],
    value: 0,
    usedFor: "",
    note: "",
  });

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // const handleSubmit = async () => {
  //   try {
  //     const res = await fetch(AddOperatingCost_API, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...form,
  //         value: Number(form.value), // convert string to number
  //       }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message || "Failed to save");

  //     alert("Saved successfully ✅");
  //     setIsShowAddBox(false);

  //     // Reset form
  //     setForm({
  //       action: "electric",
  //       date: new Date().toISOString().split("T")[0],
  //       value: "",
  //       usedFor: "",
  //       note: "",
  //     });
  //   } catch (err) {
  //     alert("Error: " + err);
  //   }
  // };

  const handleSubmit = async () => {
    try {
      await addCost({
        action: form.action as OperatingAcctionType,
        date: form.date,
        value: Number(form.value),
        usedFor: form.usedFor,
        note: form.note,
      }, getAuthHeader());
      setIsShowAddBox(false);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cost?")) return;
    await deleteCost(id, getAuthHeader());
    // alert("Deleted successfully!");
  };
  function calculateTotals(data: OperatingCostsDataType[]) {
    return data.reduce(
      (totals, item) => {
        totals[item.action] += item.value;
        return totals;
      },
      { electric: 0, water: 0, internet: 0, phone: 0, software: 0, othercost: 0 }
    );
  }

  let filteredData: OperatingCostsDataType[] = [];

  if (filterMode === "month") {
    filteredData = costs.filter((item) => {
      const d = new Date(item.date);
      return (
        d.getMonth() + 1 === selectedMonth &&
        d.getFullYear() === selectedYear &&
        (filterType === "all" || item.action.toLowerCase() === filterType.toLowerCase())
      );
    });
  } else if (filterMode === "year") {
    filteredData = costs.filter((item) => {
      const d = new Date(item.date);
      return d.getFullYear() === selectedYear && (filterType === "all" || item.action.toLowerCase() === filterType.toLowerCase());
    });
  } else {
    filteredData = costs.filter((item) => (filterType === "all" ? true : item.action.toLowerCase() === filterType.toLowerCase()));
  }

  const totals = calculateTotals(filteredData);
  // Total of all fields
  const totalAllFields = Object.values(totals).reduce((sum, val) => sum + val, 0);

  const handleEditData = (item: OperatingCostsDataType) => {
    setIsShowEditBox(true);
    setEditData(item);
  };
  const handleUpdate = async (id: string) => {
    await updateCost(id, {
      ...editData,
    }, getAuthHeader());
    setIsShowEditBox(false);
    alert("Cost updated successfully!");
  };

  const handleUploadCosts = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(UploadOperatingCost_API, {
      method: "POST",
      body: formData,
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) return alert("Upload failed: " + data.message);
    console.log('data', data);
    await updateUploadExcel(costs, data.inserted)
    setIsShowUploadBox(false);
    alert(`✅ Uploaded ${data.count} costs`);
  };

    // -- Download table to excel
    const handleExportExcel = () => {
      // console.log("hihihi");
      // 1. Prepare worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(costs);
  
      // 2. Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "OperatingCosts");
  
      // 3. Write to buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
  
      // 4. Save to file
      const data = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(data, `OperatingCosts_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

  return (
    <div className={cx("operating-costs-main")}>
      <div className={cx("title")}>Operating Costs: {totalAllFields.toLocaleString()}</div>

      {/* Summary cards */}
      <div className={cx("summary-boxes")}>
        {Object.entries(totals).map(([key, val]) => (
          <div key={key} className={cx("summary-card")}>
            <span className={cx("label")}>{key.toUpperCase()}</span>
            <span className={cx("value")}>{val.toLocaleString()} ₫</span>
          </div>
        ))}
      </div>
      <OperatingCostsChart />
      <div className={cx("tabs-filter-box")}>
        {/* Tabs navigation */}
        <div className={cx("tabs")}>
          {/* <div className={cx("tab", { active: activeTab === "history" })} onClick={() => setActiveTab("history")}>
            History
          </div> */}
          <div className={cx("tab", "add")} onClick={() => setIsShowAddBox(true)}>
            Add New
          </div>
          <div className={cx("tab", "add")} onClick={() => setIsShowUploadBox(true)}>Upload Excel</div>
                    <div className={cx("tab", "add")} onClick={() => handleExportExcel()}>
            Download Excel
          </div>
        </div>

        {/* Date filter */}
        <div className={cx("filter-box")}>
          <label>Filter Mode:</label>
          <button onClick={() => setFilterMode("month")}>By Month</button>
          <button onClick={() => setFilterMode("year")}>By Year</button>
          <button onClick={() => setFilterMode("all")}>All Time</button>

          {filterMode === "month" && (
            <>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {Array.from({ length: 6 }, (_, i) => selectedYear - 3 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </>
          )}

          {filterMode === "year" && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {Array.from({ length: 6 }, (_, i) => selectedYear - 3 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className={cx("content")}>
        <div>
          <div className={cx("history-filter")}>
            <label>Show:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All</option>
              <option value="electric">Electric</option>
              <option value="water">Water</option>
              <option value="internet">Internet</option>
              <option value="phone">Phone</option>
              <option value="software">Software</option>
              <option value="othercost">Other Cost</option>
            </select>
          </div>

          <div className={cx("table-placeholder")}>
            📊 Showing {filterType} in{" "}
            <b>
              {selectedMonth}/{selectedYear}
            </b>{" "}
            — {filteredData.length} records
          </div>

          <div className={cx("history-list")}>
            <div className={cx("history-item")}>
              <div className={cx("col", "date", "header")}>Date</div>
              <div className={cx("col", "action", "header")}>Action</div>
              <div className={cx("col", "value", "header")}>Value</div>
              <div className={cx("col", "used", "header")}>Used For</div>
              <div className={cx("col", "note", "header")}>Note</div>
              <div className={cx("col", "used", "header")}>Edit</div>
              <div className={cx("col", "note", "header")}>Delete</div>
            </div>
            {filteredData.map((item: OperatingCostsDataType, i: number) => (
              <div key={i} className={cx("history-item", item.action)}>
                <div className={cx("col", "date")}>{item.date}</div>
                <div className={cx("col", "action")}>{item.action.toUpperCase()}</div>
                <div className={cx("col", "value")}>{item.value.toLocaleString()} ₫</div>
                <div className={cx("col", "used")}>{item.usedFor}</div>
                <div className={cx("col", "note")}>{item.note}</div>
                <div className={cx("col", "note")} onClick={() => handleEditData(item)}>
                  <MdModeEdit size={20} />
                </div>
                <div className={cx("col", "note")} onClick={() => handleDelete(item._id!)}>
                  <MdDelete size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {isShowAddBox && (
          <div className={cx("add-form")}>
            <h5>New Operating Cost</h5>
            <div className={cx("form-row")}>
              <label>Action:</label>
              <select value={form.action} onChange={(e) => handleFormChange("action", e.target.value)}>
                <option value="electric">Electric</option>
                <option value="water">Water</option>
                <option value="internet">Internet</option>
                <option value="phone">Phone</option>
                <option value="software">Software</option>
                <option value="othercost">Other Cost</option>
              </select>
            </div>
            <div className={cx("form-row")}>
              <label>Date:</label>
              <input type="date" value={form.date} onChange={(e) => handleFormChange("date", e.target.value)} />
            </div>
            <div className={cx("form-row")}>
              <label>Value:</label>
              <input type="number" placeholder="Enter amount" value={form.value} onChange={(e) => handleFormChange("value", e.target.value)} />
            </div>
            <div className={cx("form-row")}>
              <label>Used For:</label>
              <input
                type="text"
                placeholder="E.g. Internet bill, SMS plan..."
                value={form.usedFor}
                onChange={(e) => handleFormChange("usedFor", e.target.value)}
              />
            </div>
            <div className={cx("form-row")}>
              <label>Note:</label>
              <textarea placeholder="Optional note" value={form.note} onChange={(e) => handleFormChange("note", e.target.value)} />
            </div>
            <div className={cx("form-actions")}>
              <button className={cx("btn", "primary")} onClick={handleSubmit}>
                Add
              </button>
              <button className={cx("btn", "secondary")} onClick={() => setIsShowAddBox(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {isShowEditBox && (
          <div className={cx("add-form")}>
            <h5>New Operating Cost</h5>
            <div className={cx("form-row")}>
              <label>Action:</label>
              <select value={editData.action} onChange={(e) => handleEditChange("action", e.target.value)}>
                <option value="electric">Electric</option>
                <option value="water">Water</option>
                <option value="internet">Internet</option>
                <option value="phone">Phone</option>
                <option value="software">Software</option>
                <option value="othercost">Other Cost</option>
              </select>
            </div>
            <div className={cx("form-row")}>
              <label>Date:</label>
              <input type="date" value={editData.date} onChange={(e) => handleEditChange("date", e.target.value)} />
            </div>
            <div className={cx("form-row")}>
              <label>Value:</label>
              <input type="number" placeholder="Enter amount" value={editData.value} onChange={(e) => handleEditChange("value", e.target.value)} />
            </div>
            <div className={cx("form-row")}>
              <label>Used For:</label>
              <input
                type="text"
                placeholder="E.g. Internet bill, SMS plan..."
                value={editData.usedFor}
                onChange={(e) => handleEditChange("usedFor", e.target.value)}
              />
            </div>
            <div className={cx("form-row")}>
              <label>Note:</label>
              <textarea placeholder="Optional note" value={editData.note} onChange={(e) => handleEditChange("note", e.target.value)} />
            </div>
            <div className={cx("form-actions")}>
              <button className={cx("btn", "primary")} onClick={() => handleUpdate(editData._id)}>
                Update
              </button>
              <button className={cx("btn", "secondary")} onClick={() => setIsShowEditBox(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {isShowUploadBox && <UploadExcelBox onClose={() => setIsShowUploadBox(false)} onUpload={handleUploadCosts} />}
      </div>
    </div>
  );
}

export function OperatingCostsCards() {
  const { costs, fetchCosts, addCost, updateCost, deleteCost, loading } = useOperatingCostsStore();

  // useEffect(() => {
  //   fetchCosts();
  // }, [fetchCosts]);

  // Aggregate by action
  const totals: Record<string, number> = {};
  costs.forEach((item) => {
    totals[item.action] = (totals[item.action] || 0) + item.value;
  });

  return (
    <div className={cx("cards-grid")}>
      {Object.entries(totals).map(([action, total]) => (
        <div key={action} className={cx("card")}>
          <div>{action}</div>
          <div className={cx("value")}>{total.toLocaleString()} ₫</div>
        </div>
      ))}
    </div>
  );
}
