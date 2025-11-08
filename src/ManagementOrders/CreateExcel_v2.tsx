import React, { useState, useMemo } from "react";
import classNames from "classnames/bind";
import styles from "./CreateExcel_v2.module.scss";
import * as XLSX from "xlsx";
// import { type Order, type OrderItem } from "./ShopOrders";
import type { FinalOrder, OrderItem } from "../zustand/shopOrderStore";
import CustomSelectGlobal from "../ultilitis/CustomSelectGlobal";
import { useStaffMenuStore } from "../zustand/menuCollapsed";
const cx = classNames.bind(styles);
import { FaShippingFast } from "react-icons/fa";
import { FcFilledFilter } from "react-icons/fc";
interface Props {
  orders: FinalOrder[];
}

const CARRIERS = {
  VIETTEL: "Viettel Post",
  JNT: "J&T",
} as const;
const CarrierOptions = [
  {
    name: "Viettel Post",
    key: "viettelpost",
  },
  {
    name: "J&T",
    key: "j&t",
  },
];

const VIETTEL_HEADERS = [
  "STT",
  "Mã đơn hàng",
  "Tên người nhận (*)",
  "Số ĐT người nhận (*)",
  "Địa chỉ nhận (*)",
  "Tên hàng hóa (*)",
  "Số lượng",
  "Trọng lượng (gram)  (*)",
  "Giá trị hàng (VND) (*)",
  "Tiền thu hộ COD (VND)",
  "Loại hàng hóa (*)",
  "Tính chất hàng hóa đặc biệt",
  "Dịch vụ  (*)",
  "Dịch vụ cộng thêm",
  "Thu tiền xem hàng",
  "Dài (cm)",
  "Rộng (cm)",
  "Cao (cm)",
  "Người trả cước",
  "Yêu cầu khác",
  "Thời gian hẹn lấy",
  "Thời gian giao",
];

const JNT_HEADERS = [
  "STT",
  "Tên người nhận (*)",
  "Số điện thoại (*)",
  "Địa chỉ chi tiết (*)",
  "Mã đơn hàng riêng",
  "Loại dịch vụ (*)",
  "Gửi tại bưu cục ",
  "Phương thức thanh toán (*)",
  "Tên sản phẩm (*)",
  "Loại hàng (*)",
  "Trọng lượng (kg) (*)",
  "Chiều dài\n(cm)",
  "Chiều rộng\n(cm)",
  "Chiều cao\n(cm)",
  "Số kiện (*)",
  "Tiền thu hộ COD (VND)",
  "Giá trị hàng hóa ( Phí khai giá)",
  "Giao 1 phần",
  "Ghi chú",
];

const VIETTEL_SERVICE_OPTIONS = [
  "SCN - Chuyển phát nhanh",
  "STK - Chuyển phát tiết kiệm",
  "PTN - Nội tỉnh nhanh thỏa thuận",
  "NCOD - TMĐT nhanh thỏa thuận",
  "VHT - Hỏa tốc thỏa thuận",
];

const JNT_SERVICE_OPTIONS = ["EXPRESS", "FAST", "SUPPER"];
const JNT_PAYMENT_OPTIONS = ["PP_CASH", "CC_CASH", "PP_PM"];

function formatProducts(items: OrderItem[]) {
  return items.map((it) => `${it.name} (${it.size}, ${it.color}) x${it.quantity}`).join("; ");
}
function totalQuantity(items: OrderItem[]) {
  return items.reduce((s, it) => s + Number(it.quantity || 0), 0);
}

export default function CreateExcel_v2({ orders }: Props) {
  // const [carrier, setCarrier] = useState<(typeof CARRIERS)[keyof typeof CARRIERS]>(CARRIERS.VIETTEL);
  const [carrier, setCarrier] = useState<string>("viettelpost");
  const [viettelService, setViettelService] = useState(VIETTEL_SERVICE_OPTIONS[1]);
  const [jntService, setJntService] = useState(JNT_SERVICE_OPTIONS[0]);
  const [jntPayment, setJntPayment] = useState(JNT_PAYMENT_OPTIONS[0]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("All");
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const { menuCollapsed } = useStaffMenuStore();

  // Get the orders that are "Chốt" and "Chưa gửi hàng"
  const filterConfirmOrdersAndNotDelivery = orders.filter((o) => o.status === "Chốt" && o.deliveryStatus === "Chưa gửi hàng");

  // Extract all product IDs (prefix before "-")
  function getProductId(order: FinalOrder) {
    return (order.orderCode || "").split("-")[0];
  }

  const productIds = Array.from(new Set(orders.map((o) => getProductId(o)))).sort();

  // --- paste/replace this block where you currently compute `sorted` in CreateExcel.tsx ---

  /**
   * Helpers to parse product key and order number from order id
   * e.g. "vay001-5868" => { raw: "vay001", alpha: "vay", numSuffix: 1, orderNum: 5868 }
   */
  function parseProductKey(id: string) {
    const parts = (id || "").split("-");
    const raw = (parts[0] || "").trim();
    const orderNum = parts[1] ? parseInt(parts[1].replace(/\D/g, ""), 10) || 0 : 0;

    // Extract "alpha" + numeric suffix, e.g. vay001 → {alpha: "vay", numSuffix: 1}
    const m = raw.match(/^([a-zA-Z\u00C0-\u017F]+)(\d+)$/i);
    const alpha = m ? m[1] : raw;
    const numSuffix = m ? parseInt(m[2], 10) || 0 : 0;

    return { raw, alpha: alpha.toLowerCase(), numSuffix, orderNum };
  }

  function normalizeColor(color: string) {
    if (!color) return "__nocolor__";
    return color.trim().toLowerCase();
  }

  const sorted = useMemo(() => {
    // filter first
    const visibleOrders =
      selectedProductId === "All" ? filterConfirmOrdersAndNotDelivery : filterConfirmOrdersAndNotDelivery.filter((o) => getProductId(o) === selectedProductId);

    // then apply the same partition + sort logic on visibleOrders
    const singles = visibleOrders.filter((o) => {
      const totalQty = (o.orderInfo ?? []).reduce((s, it) => s + Number(it.quantity || 0), 0);
      return totalQty === 1;
    });
    const multis = visibleOrders.filter((o) => {
      const totalQty = (o.orderInfo ?? []).reduce((s, it) => s + Number(it.quantity || 0), 0);
      return totalQty > 1;
    });

    // Group singles by productId -> color
    const productMap = new Map<string, Map<string, FinalOrder[]>>();
    for (const o of singles) {
      const { raw } = parseProductKey(o.orderCode || "");
      const color = normalizeColor(o.orderInfo?.[0]?.color ?? "");
      if (!productMap.has(raw)) productMap.set(raw, new Map());
      const colorMap = productMap.get(raw)!;
      if (!colorMap.has(color)) colorMap.set(color, []);
      colorMap.get(color)!.push(o);
    }

    // Sort product groups
    const productKeys = Array.from(productMap.keys()).sort((a, b) => {
      const pa = parseProductKey(a);
      const pb = parseProductKey(b);
      const cmpAlpha = pa.alpha.localeCompare(pb.alpha, undefined, { sensitivity: "base" });
      if (cmpAlpha !== 0) return cmpAlpha;
      return pa.numSuffix - pb.numSuffix;
    });

    // Flatten singles
    const sortedSingles: FinalOrder[] = [];
    for (const pk of productKeys) {
      const colorMap = productMap.get(pk)!;
      const colorKeys = Array.from(colorMap.keys()).sort((a, b) => {
        if (a === "__nocolor__") return 1;
        if (b === "__nocolor__") return -1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      });
      for (const ck of colorKeys) {
        const list = colorMap.get(ck)!;
        list.sort((a, b) => parseProductKey(a.orderCode).orderNum - parseProductKey(b.orderCode).orderNum);
        sortedSingles.push(...list);
      }
    }

    // Sort multis by total quantity, keep them at the end
    const sortedMultis = [...multis].sort((a, b) => {
      const qa = a.orderInfo.reduce((s, it) => s + (it.quantity || 0), 0);
      const qb = b.orderInfo.reduce((s, it) => s + (it.quantity || 0), 0);
      return qa - qb;
    });
    setTotalOrders(sortedSingles.length + sortedMultis.length);
    return [...sortedSingles, ...sortedMultis];
  }, [orders, selectedProductId]);

  const activeOrders = selected.length ? sorted.filter((o) => selected.includes(o.orderCode)) : sorted;

  // Build rows with full headers
  const { headers, rows } = useMemo(() => {
    if (carrier === "viettelpost") {
      const data = activeOrders.map((o, i) => {
        // const weight = calcWeight(o.orderInfo, productWeights);
        const base: Record<string, any> = {};
        VIETTEL_HEADERS.forEach((h) => (base[h] = "")); // init all
        base["STT"] = i + 1;
        base["Mã đơn hàng"] = o.orderCode;
        base["Tên người nhận (*)"] = o.customerName;
        base["Số ĐT người nhận (*)"] = o.phone;
        base["Địa chỉ nhận (*)"] = o.address;
        base["Tên hàng hóa (*)"] = formatProducts(o.orderInfo);
        base["Số lượng"] = totalQuantity(o.orderInfo);
        base["Trọng lượng (gram)  (*)"] = o.totalWeight;
        base["Giá trị hàng (VND) (*)"] = o.total;
        base["Tiền thu hộ COD (VND)"] = o.total;
        base["Loại hàng hóa (*)"] = "Bưu kiện";
        base["Dịch vụ  (*)"] = viettelService;
        base["Yêu cầu khác"] = o.note ?? "";
        return base;
      });
      return { headers: VIETTEL_HEADERS, rows: data };
    } else {
      const data = activeOrders.map((o, i) => {
        const weightGram = o.totalWeight;
        const weightKg = Math.max(1, Math.ceil(weightGram / 1000));
        const base: Record<string, any> = {};
        JNT_HEADERS.forEach((h) => (base[h] = ""));
        base["STT"] = i + 1;
        base["Tên người nhận (*)"] = o.customerName;
        base["Số điện thoại (*)"] = o.phone;
        base["Địa chỉ chi tiết (*)"] = o.address;
        base["Mã đơn hàng riêng"] = o.orderCode;
        base["Loại dịch vụ (*)"] = jntService;
        base["Gửi tại bưu cục "] = "Không";
        base["Phương thức thanh toán (*)"] = jntPayment;
        base["Tên sản phẩm (*)"] = formatProducts(o.orderInfo);
        base["Loại hàng (*)"] = "HÀNG HÓA";
        base["Trọng lượng (kg) (*)"] = weightKg;
        base["Số kiện (*)"] = totalQuantity(o.orderInfo);
        base["Tiền thu hộ COD (VND)"] = o.total;
        base["Giá trị hàng hóa ( Phí khai giá)"] = o.total;
        base["Ghi chú"] = o.note ?? "";
        return base;
      });
      return { headers: JNT_HEADERS, rows: data };
    }
  }, [carrier, activeOrders, viettelService, jntService, jntPayment]);

  const toggleSelect = (id: string) => setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const downloadExcelJNT = () => {
    // build header row
    const header = JNT_HEADERS;

    // numbering row 1–19
    const numbering = Array.from({ length: header.length }, (_, i) => i + 1);

    // data rows
    const dataRows = rows.map((r) => header.map((h) => r[h] ?? ""));

    // combine with padding
    const aoa = [
      ...Array(11).fill(Array(header.length).fill("")), // rows 1–11 empty
      header, // row 12 header
      numbering, // row 13 numbering
      ...dataRows, // row 14+ data
    ];

    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "J&T");
    XLSX.writeFile(wb, `JNT-export.xlsx`);
  };

  const downloadExcel = () => {
    if (carrier === CARRIERS.JNT) {
      downloadExcelJNT();
    } else {
      // Viettel (normal, no padding)
      const aoa = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ""))];
      const sheet = XLSX.utils.aoa_to_sheet(aoa);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "ViettelPost");
      XLSX.writeFile(wb, `ViettelPost-export.xlsx`);
    }
  };

  return (
    <div className={cx("create-excel-main")}>
      <div className={cx("header")}>
        <div className={cx("header-left")}>
          <div className={cx("header-tabs")}>
            <div className={cx("title-total")}>
              Tổng đơn in: <span>{totalOrders}</span>
            </div>
            <div className={cx("filters")}>
              <div className={cx("filter-title")}>Lọc theo sản phẩm: </div>
              <div className={cx("filter-content")}>
                <FcFilledFilter size={24} />
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                  <option value="All">Tất cả</option>
                  {productIds.map((pid) => (
                    <option key={pid} value={pid}>
                      {pid}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={cx("wrap-carrier-select")}>
              <div className={cx("carrier-title")}>Đơn vị vận chuyển: </div>
              <div className={cx("carrier-select")}>
                <FaShippingFast size={20} color="#006af5" />
                <CustomSelectGlobal options={CarrierOptions} onChange={(key) => setCarrier(key)} />
              </div>
            </div>
            {/* {carrier === "viettelpost" && (
              <div className={cx("carrier-select")}>
                <label>
                  Dịch vụ:
                  <select value={viettelService} onChange={(e) => setViettelService(e.target.value)}>
                    {VIETTEL_SERVICE_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {carrier === "j&t" && (
              <div className={cx("carrier-select")}>
                <label>
                  Loại dịch vụ:
                  <select value={jntService} onChange={(e) => setJntService(e.target.value)}>
                    {JNT_SERVICE_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Thanh toán:
                  <select value={jntPayment} onChange={(e) => setJntPayment(e.target.value)}>
                    {JNT_PAYMENT_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
              </div>
            )} */}
          </div>
        </div>
        <div className={cx("header-right")}>
          <div className={cx("header-actions")}></div>
        </div>
      </div>
      <div className={cx("content")}>
        <div className={cx("table-scroll")}>
          <div className={cx("table-container")}>
            <div className={cx("table-body")}>
              <table className={cx("preview-table")}>
                <thead>
                  <tr>
                    <th>Chọn</th>
                    {headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td></td>
                      {headers.map((h, i) => (
                        <td key={i}></td>
                      ))}
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selected.includes(activeOrders[idx].orderCode)}
                            onChange={() => toggleSelect(activeOrders[idx].orderCode)}
                          />
                        </td>
                        {headers.map((h, i) => (
                          <td key={i}>{row[h]}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className={cx("footer")}>
        <button onClick={downloadExcel} className={cx("btn-decor")}>
          Download Excel
        </button>
      </div>
    </div>
  );
}
