import React, { useState, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./ImportExportInventort.module.scss";
const cx = classNames.bind(styles);
import { FaArrowDownLong } from "react-icons/fa6";
import { FaArrowUpLong } from "react-icons/fa6";
import { MdEdit, MdDelete } from "react-icons/md";

// import type { ImportType, ExportType, InventoryType, OtherFeesType } from "./Dataset/ImportExportInventoryType";
import { imports, exports, inventory } from "./Dataset/ImportExportInventoryType";
import useFilterAndPagination from "./useFilterAndPagination";
import UploadExcelBox from "../../../../utils/UploadExcelBox";
import AddManualForm from "./AddManualForm";

import EditExportForm from "./EditExportForm";
import EditImportForm from "./EditImportForm";
import AddImportModal from "./AddImportModal";
export interface OtherFeesType {
  value: number;        // amount of the fee
  usedFor: string;      // description (invoice, translate, customs, etc.)
  date: string;         // when the fee was applied
  note?: string;
}

export interface ImportType {
  ownerID?: string;
  time: string;         // when goods were imported
  idProduct: string;    // product unique ID
  productName: string;  // product name
  importQuantity: number; 
  brokenQuantity: number; 
  pricePerUnit: number;        // unit price (or total cost if per shipment)
  breakEvenPrice?: number;
  supplier?: string;    // optional: supplier name/id
  batchCode?: string;   // optional: batch/lot code
  shippingFee: {
    externalChinaToVietnam: number;
    internalVietnamToWarehouse: number;
  };
  otherFees: OtherFeesType[]; 
  totalCost: number;   // convenience field: (importQuantity * value + fees)
  note?: string;
  shipmentStatus?: "On Importing" | "On Selling" | "Sold Out";
  revenue?:number;
  profit?: number;
  estimateSellingPrice?: number;
}

export interface BatchTrackingType{
  batchCode: string; 
  breakEvenPrice: number;
}

export interface ExportType {
  time: string;         // when exported/sold
  idProduct: string;    // product unique ID
  productName: string;
  exportQuantity: number; 
  receiver: string; // export from warehouse to manager for wrapping and delivery.
  breakEvenPrice?: number;
  note?: string;
  batchCode?: string;
}

export interface InventoryType {
  idProduct: string;
  productName: string;
  currentStock: number;    // real-time stock in warehouse
  averageCost: number;    // weighted avg cost per unit. calculate (total fee + total value of goods) => averageCost per unit
  totalValue: number;     // currentStock * averageCost
  warehouseLocation?: string; // optional: where stored
  note?: string;
}
export default function ImportExportInventory() {
  const [showExcelBox, setShowExcelBox] = useState<"import" | "export" | "inventory" | null>(null);
  const [showManualForm, setShowManualForm] = useState<"import" | "export" | "inventory" | null>(null);
const [isAddModelOpen, setAddModelOpen] = useState(false);
  const handleUpload = async (file: File, type: "import" | "export" | "inventory") => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`http://localhost:3000/api-v1/import-export-inventory?action=add&type=excel&target=${type}`, { method: "POST", body: formData });
      if (res.ok) {
        alert(`✅ ${type} Excel uploaded successfully`);
      } else {
        alert(`❌ Upload failed for ${type}`);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Error uploading ${type}`);
    }
    setShowExcelBox(null);
  };

  const handleManualSave = async (data: any, type: "import" | "export" | "inventory") => {
    try {
      const res = await fetch(`http://localhost:3000/api-v1/import-export-inventory?action=add&type=manual&target=${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert(`✅ ${type} added successfully`);
      } else {
        alert(`❌ Manual add failed for ${type}`);
      }
    } catch (err) {
      console.error(err);
      alert(`❌ Error adding ${type}`);
    }
    setShowManualForm(null);
  };

  // --- Totals for cards ---
  const totalImportValue = useMemo(() => imports.reduce((sum, item) => sum + item.totalCost, 0), []);
  const totalInventoryValue = useMemo(() => inventory.reduce((sum, item) => sum + item.totalValue, 0), []);

  // --- Summary tables ---
  const importSummary = useMemo(() => {
    const map = new Map<string, { productName: string; quantity: number; broken: number; total: number; breakEvenPrice: number }>();
    imports.forEach((imp) => {
      if (!map.has(imp.idProduct)) {
        map.set(imp.idProduct, {
          productName: imp.productName,
          quantity: 0,
          broken: 0,
          total: 0,
          breakEvenPrice: 0,
        });
      }
      const entry = map.get(imp.idProduct)!;
      entry.quantity += imp.importQuantity;
      entry.broken += imp.brokenQuantity;
      entry.total += imp.totalCost;

      let shippingFee = imp.shippingFee.externalChinaToVietnam + imp.shippingFee.internalVietnamToWarehouse;
      let otherFee = imp.otherFees.reduce((acc: number, feeInfo: OtherFeesType) => {
        acc += feeInfo.value;
        return acc;
      }, 0);
      let totalCost = shippingFee + otherFee + imp.importQuantity * imp.pricePerUnit;
      let breakEvenPrice = totalCost / (imp.importQuantity - imp.brokenQuantity);
      entry.breakEvenPrice = breakEvenPrice;
    });
    return Array.from(map.values());
  }, []);

  const exportSummary = useMemo(() => {
    const map = new Map<string, { productName: string; quantity: number }>();
    exports.forEach((exp) => {
      if (!map.has(exp.idProduct)) {
        map.set(exp.idProduct, {
          productName: exp.productName,
          quantity: 0,
        });
      }
      const entry = map.get(exp.idProduct)!;
      entry.quantity += exp.exportQuantity;
    });
    return Array.from(map.values());
  }, []);
  return (
    <div className={cx("import-export-inventory-main")}>
      {/* --- Cards --- */}
      <div className={cx("cards")}>
        <div className={cx("card")}>
          <h3>Total Import Value</h3>
          <p>{totalImportValue.toLocaleString()} VND</p>
        </div>
        <div className={cx("card")}>
          <h3>Total Inventory Value</h3>
          <p>{totalInventoryValue.toLocaleString()} VND</p>
        </div>
      </div>

      {/* --- Import/Export summary --- */}
      <div className={cx("summary-section")}>
        <h2>Import/Export Summary</h2>
        <div className={cx("summary-table-container")}>
          <table className={cx("table")}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Total Quantity</th>
                <th>Total Broken</th>
                <th>Total Import Value</th>
                <th>Total Export Quantity</th>
                <th>Total Export Value</th>
                <th>Inventory Quantity</th>
              </tr>
            </thead>
            <tbody>
              {importSummary.map((row, idx) => {
                const exportData = exportSummary.find((productInfo) => productInfo.productName === row.productName) || { productName: "", quantity: 0 };
                const inventoryQuantity = row.quantity - row.broken - exportData.quantity;
                const totalExportValue = exportData.quantity * row.breakEvenPrice;
                return (
                  <tr key={idx}>
                    <td>{row.productName}</td>
                    <td>{row.quantity}</td>
                    <td>{row.broken}</td>
                    <td>{row.total.toLocaleString()} VND</td>
                    <td>{exportData.quantity}</td>
                    <td>{totalExportValue.toLocaleString("vi-VN")}</td>
                    <td>{inventoryQuantity}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Export summary --- */}

      <div className={cx("actions")}>
        <h2>📦 Inventory</h2>
        {/* <button onClick={() => setShowManualForm("import")}>➕ Add Manual</button>
        <button onClick={() => setShowExcelBox("import")}>⬆️ Upload Excel</button> */}
      </div>
      {/* ✅ Show Excel Upload */}
      {showExcelBox === "import" && <UploadExcelBox onUpload={(f) => handleUpload(f, "import")} onClose={() => setShowExcelBox(null)} />}
      {/* ✅ Show Manual Form */}
      {showManualForm === "import" && <AddManualForm type="import" onClose={() => setShowManualForm(null)} onSave={handleManualSave} />}
      <InventoryTable data={inventory} />

      <div className={cx("actions")}>
        <h2>⬇️ Imports</h2>
        <button onClick={() => setShowManualForm("inventory")}>➕ Add Manual</button>
        <button onClick={() => setShowExcelBox("inventory")}>⬆️ Upload Excel</button>
        <button onClick={() => setAddModelOpen(true)} className={cx('btn-primary')}>Add Import</button>
      </div>
      {showExcelBox === "inventory" && <UploadExcelBox onUpload={(f) => handleUpload(f, "inventory")} onClose={() => setShowExcelBox(null)} />}
      {showManualForm === "inventory" && <AddManualForm type="inventory" onClose={() => setShowManualForm(null)} onSave={handleManualSave} />}
      
      <ImportExportTable data={imports} type="import" />
      <AddImportModal open={isAddModelOpen} onClose={() => setAddModelOpen(false)} />

      <div className={cx("actions")}>
        <h2>⬆️ Exports</h2>
        <button onClick={() => setShowManualForm("export")}>➕ Add Manual</button>
        <button onClick={() => setShowExcelBox("export")}>⬆️ Upload Excel</button>
      </div>
      {showExcelBox === "export" && <UploadExcelBox onUpload={(f) => handleUpload(f, "export")} onClose={() => setShowExcelBox(null)} />}
      {showManualForm === "export" && <AddManualForm type="export" onClose={() => setShowManualForm(null)} onSave={handleManualSave} />}
      <ImportExportTable data={exports} type="export" />
      <div>
        <div>** A batch product have believed to be sold out when the next batch is being distributed</div>
        <div>** FInd the way to calculate Batch-Product profit</div>
      </div>
    </div>
  );
}

/* ---------------- Inventory Table ---------------- */
function InventoryTable({ data }: { data: InventoryType[] }) {
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
            <tr key={item.idProduct}>
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

/* ---------------- Imports & Exports ---------------- */
interface Props {
  data: ImportType | ExportType | InventoryType;
  onClose: () => void;
  onSave: (updatedRow: ImportType | ExportType | InventoryType) => void;
}
function ImportExportTable({ data, type }: { data: ImportType[] | ExportType[]; type: "import" | "export" }) {
  const [editImportData, setEditImportData] = useState<ImportType | null>(null);
  const [editExportData, setEditExportData] = useState<ExportType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "import" | "export"; id: string } | null>(null);

  const handleEditImport = (data: ImportType) => {
    setEditImportData(data);
  };

  const handleSaveImport = (updated: ImportType) => {
    console.log("Saving import:", updated);
    // TODO: call API:
    // fetch("http://localhost:6000/api-v1/import-export-inventory?action=edit&type=import", { method: "POST", body: JSON.stringify(updated) })
    setEditImportData(null);
  };

  const handleEditExport = (data: ExportType) => {
    setEditExportData(data);
  };

  const handleSaveExport = (updated: ExportType) => {
    console.log("Saving export:", updated);
    // TODO: call API:
    // fetch("http://localhost:6000/api-v1/import-export-inventory?action=edit&type=export", { method: "POST", body: JSON.stringify(updated) })
    setEditExportData(null);
  };

  const handleDelete = async (type: "import" | "export", id: string) => {
    console.log(`Deleting ${type} with id:`, id);
    // TODO: call API:
    // fetch(`http://localhost:6000/api-v1/import-export-inventory?action=delete&type=${type}`, { method: "POST", body: JSON.stringify({ id }) })
    setConfirmDelete(null);
  };

  const {
    filterMode,
    setFilterMode,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    years,
    productName,
    setProductName,
    batchCode,
    setBatchCode,
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
  } = useFilterAndPagination<ImportType | ExportType>(data);

  return (
    <section>
      {/* Filters */}
      <div className={cx("filter-group")}>
        <label>Filter Mode:</label>
        <button onClick={() => setFilterMode("month")}>By Month</button>
        <button onClick={() => setFilterMode("year")}>By Year</button>
        <button onClick={() => setFilterMode("all")}>All Time</button>

        {filterMode === "month" && (
          <>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </>
        )}

        {filterMode === "year" && (
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}

        {/* Product search */}
        <input type="text" placeholder="Filter by product..." value={productName} onChange={(e) => setProductName(e.target.value)} />
        <input type="text" placeholder="Filter by Batch Code" value={batchCode} onChange={(e) => setBatchCode(e.target.value)} />
      </div>

      {/* Table */}
      <table className={cx("table")}>
        <thead>
          <tr>
            {type === "import" ? (
              <>
                <th>Time</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Broken</th>
                <th>Add Warehouse</th>
                <th>Price/Unit</th>
                <th>Shipment Value</th>
                <th>Shipping Fee</th>
                <th>Other Fees</th>
                <th>Total Cost</th>
                <th>Break-even Price</th>
                <th>Batch Code</th>
                <th>Supplier</th>
                <th>Edit</th>
                <th>Delete</th>

                {/* <th>Batch</th> */}
              </>
            ) : (
              <>
                <th>Time</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Receiver</th>
                <th>Edit</th>
                <th>Delete</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item: any, i: number) => {
            let shippingFee = 0;
            let otherFee = 0;
            let totalCost = 0;
            let breakEvenPrice = 0;
            if (type === "import") {
              shippingFee = item.shippingFee.externalChinaToVietnam + item.shippingFee.internalVietnamToWarehouse;
              otherFee = item.otherFees.reduce((acc: number, feeInfo: OtherFeesType) => {
                acc += feeInfo.value;
                return acc;
              }, 0);
              totalCost = shippingFee + otherFee + item.importQuantity * item.pricePerUnit;
              breakEvenPrice = totalCost / (item.importQuantity - item.brokenQuantity);
            }

            return type === "import" ? (
              <tr key={i}>
                <td>{new Date(item.time).toLocaleDateString()}</td>
                <td>{item.productName}</td>
                <td>{item.importQuantity}</td>
                <td>{item.brokenQuantity}</td>
                <td>{item.importQuantity - item.brokenQuantity}</td>
                <td>${item.pricePerUnit}</td>
                <td>${(item.pricePerUnit *  item.importQuantity).toLocaleString("vi-VN")}</td>
                <td>${shippingFee.toLocaleString("vi-VN")}</td>
                <td>${otherFee.toLocaleString("vi-VN")}</td>
                <td>${totalCost.toLocaleString("vi-VN")}</td>
                <td>${breakEvenPrice.toLocaleString("vi-VN")}</td>
                <td>{item.batchCode || "-"}</td>
                <td>{item.supplier || "-"}</td>
                <td>
                  <button onClick={() => handleEditImport(item)}>
                    <MdEdit size={20} />
                  </button>
                </td>
                <td>
                  <button onClick={() => setConfirmDelete({ type: "import", id: item.idProduct })}>
                    <MdDelete size={20} color="red" />
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={i}>
                <td>{new Date(item.time).toLocaleDateString()}</td>
                <td>{item.productName}</td>
                <td>{item.exportQuantity}</td>
                <td>{item.receiver}</td>
                <td>
                  <button onClick={() => handleEditExport(item)}>
                    <MdEdit size={20} />
                  </button>
                </td>
                <td>
                  <button onClick={() => setConfirmDelete({ type: "export", id: item.idProduct })}>
                    <MdDelete size={20} color="red" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className={cx("pagination")}>
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {editImportData && <EditImportForm data={editImportData} onClose={() => setEditImportData(null)} onSave={handleSaveImport} />}

      {editExportData && <EditExportForm data={editExportData} onClose={() => setEditExportData(null)} onSave={handleSaveExport} />}

      {confirmDelete && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <p>
              Are you sure you want to delete <strong>{confirmDelete.type}</strong> record ID: {confirmDelete.id}?
            </p>
            <div className={cx("actions")}>
              <button onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.type, confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
