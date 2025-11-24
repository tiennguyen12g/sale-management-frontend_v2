import React, { useState, useMemo, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./ImportExportInventort_v2.module.scss";
const cx = classNames.bind(styles);
import { FaArrowDownLong } from "react-icons/fa6";
import { FaArrowUpLong } from "react-icons/fa6";
import { MdEdit, MdDelete } from "react-icons/md";

import useFilterAndPagination from "./useFilterAndPagination";
import UploadExcelBox from "../../../../utils/UploadExcelBox";
import AddManualForm from "./AddManualForm";

import EditExportForm from "./EditExportForm";
import EditImportForm from "./EditImportForm";
import AddImportModal from "./AddImportModal";
import ImportTable from "./ImportTable";
import ExportTable from "./ExportTable";
import type { ImportRecord, ExportRecord, OtherFeesType, BatchTrackingType, InventoryRecord } from "../../../../zustand/importExportStore";
import { useImportExportStore } from "../../../../zustand/importExportStore";
import ImportSection from "./ImportSection";
import ExportSection from "./ExportSection";
import InventorySection from "./InventorySection";
export default function ImportExportInventory_v2() {
  const { fetchAll, imports, exports, inventory } = useImportExportStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- Totals for top cards ---
  const totalImportValue = useMemo(() => imports.reduce((sum, item) => sum + item.totalCost, 0), [imports]);
  const totalInventoryValue = useMemo(() => inventory.reduce((sum, item) => sum + item.totalValue, 0), [inventory]);

  return (
    <div className={cx("import-export-inventory-main")}>
      {/* --- Summary Cards --- */}
      <div className={cx("cards")}>
        <div className={cx("card")}>
          <h3>Total Import Value</h3>
          <p>{totalImportValue.toLocaleString()} ₫</p>
        </div>
        <div className={cx("card")}>
          <h3>Total Inventory Value</h3>
          <p>{totalInventoryValue.toLocaleString()} ₫</p>
        </div>
      </div>

      {/* --- Each Section --- */}
      <InventorySection data={inventory} onEdit={(item) => console.log("edit inventory", item)} onDelete={(id) => console.log("delete inventory", id)} />
      <ImportSection data={imports}  />
      <ExportSection data={exports} importData={imports}/>
    </div>
  );
}

/* ---------------- Inventory Table ---------------- */
function InventoryTable({ data }: { data: InventoryRecord[] }) {
  const [sortField, setSortField] = useState<"totalValue" | "currentStock">("totalValue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortDir === "asc" ? valA - valB : valB - valA;
    });
  }, [data, sortField, sortDir]);

  return (
    <section>
      <div className={cx("btn-group")}>
        <button
          onClick={() => {
            setSortField("totalValue");
            setSortDir(sortDir === "asc" ? "desc" : "asc");
          }}
        >
          Sort by Value {sortDir === "desc" ? <FaArrowDownLong /> : <FaArrowUpLong />}
        </button>
        <button
          onClick={() => {
            setSortField("currentStock");
            setSortDir(sortDir === "asc" ? "desc" : "asc");
          }}
        >
          Sort by Stock {sortDir === "desc" ? <FaArrowDownLong /> : <FaArrowUpLong />}
        </button>
      </div>

      <table className={cx("table")}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
            <th>Avg. Cost</th>
            <th>Total Value</th>
            <th>Warehouse</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.productId}>
              <td>{item.productName}</td>
              <td>{item.currentStock}</td>
              <td>${item.averageCost}</td>
              <td>${item.totalValue}</td>
              <td>{item.warehouseLocation || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
