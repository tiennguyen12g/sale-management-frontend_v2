import React, { useState, useMemo, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./AdsCosts.module.scss";
const cx = classNames.bind(styles);

// import { adsCostsData } from "../DataTest/AdsCostsData";
import type { AdsCostType, PlatformName } from "../DataTest/AdsCostsData";
import { AiFillTikTok } from "react-icons/ai";
import { FaSquareFacebook } from "react-icons/fa6";
import { SiShopee } from "react-icons/si";
import AddAdsCosts from "./AddAdsCosts";
import AdsCostsCharts from "../Charts/AdsCostsCharts";
import AdsCostFeeChart from "../Charts/AdsCostFeeChart";
import PlatformFeeChart from "../Charts/PlatformFeeChart";
import ReturnFeeChart from "../Charts/ReturnFeeChart";
import DeliveriedReturnedChart from "../Charts/DeliveriedReturnedChart";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import UploadExcelBox from "../../../../ultilitis/UploadExcelBox";
import { AddAdsCosts_API, GetAdsCosts_API, UploadAdsCosts_API } from "../../../../config/api";
import { useAuthStore } from "../../../../zustand/authStore";
import { useAdsCostStore } from "../../../../zustand/adsCostStore";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
const summaryConfig = [
  {
    key: "all",
    label: "Total",
    icon: null,
    color: "black",
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: <AiFillTikTok color="black" size={20} />,
    color: "black",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: <FaSquareFacebook color="#0074c2" size={20} />,
    color: "#0074c2",
  },
  {
    key: "shopee",
    label: "Shopee",
    icon: <SiShopee color="#ff7220" size={20} />,
    color: "#ff7220",
  },
];

export default function AdsCosts() {
  const { adsCosts, fetchAdsCosts, updateUploadExcel, updateAdsCost, deleteAdsCost } = useAdsCostStore();
  const { getAuthHeader } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterMode, setFilterMode] = useState<"month" | "year" | "all">("all");
  const [filterPlatform, setFilterPlatform] = useState<PlatformName | "all">("all");
  const [filterProduct, setFilterProduct] = useState("all");

  const [isOpenAddForm, setIsOpenAddForm] = useState(false);
  const [isShowUploadBox, setIsShowUploadBox] = useState(false);
  const [isShowEditBox, setIsShowEditBox] = useState(false);
  const [isShowMoreChart, setIsShowMoreChart] = useState(false);

  const [formData, setFormData] = useState<AdsCostType>({
    _id: "",
    platform: "TikTok",
    date: "",
    spendActual: 0,
    ordersDelivered: 0,
    ordersReturned: 0,
    netRevenue: 0,
    platformFee: 0,
    returnFee: 0,
    targetProduct: "",
    idProduct: "",
  });
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  useEffect(() => {
    fetchAdsCosts();
  }, [fetchAdsCosts]);
  // Calculate totals
  function calculateTotals(data: AdsCostType[]) {
    return data.reduce(
      (totals, item) => {
        totals.all.spend += item.spendActual;
        totals.all.revenue += item.netRevenue;
        totals.all.deliveried += item.ordersDelivered;
        totals.all.returned += item.ordersReturned;
        totals.all.platformFee += item.platformFee || 0;
        totals.all.returnFee += item.returnFee || 0;

        if (item.platform === "TikTok") {
          totals.tiktok.spend += item.spendActual;
          totals.tiktok.revenue += item.netRevenue;
          totals.tiktok.deliveried += item.ordersDelivered;
          totals.tiktok.returned += item.ordersReturned;
          totals.tiktok.platformFee += item.platformFee || 0;
          totals.tiktok.returnFee += item.returnFee || 0;
        }
        if (item.platform === "Facebook") {
          totals.facebook.spend += item.spendActual;
          totals.facebook.revenue += item.netRevenue;
          totals.facebook.deliveried += item.ordersDelivered;
          totals.facebook.returned += item.ordersReturned;
          totals.facebook.platformFee += item.platformFee || 0;
          totals.facebook.returnFee += item.returnFee || 0;
        }
        if (item.platform === "Shopee") {
          totals.shopee.spend += item.spendActual;
          totals.shopee.revenue += item.netRevenue;
          totals.shopee.deliveried += item.ordersDelivered;
          totals.shopee.returned += item.ordersReturned;
          totals.shopee.platformFee += item.platformFee || 0;
          totals.shopee.returnFee += item.returnFee || 0;
        }

        return totals;
      },
      {
        all: { spend: 0, revenue: 0, deliveried: 0, returned: 0, platformFee: 0, returnFee: 0 },
        tiktok: { spend: 0, revenue: 0, deliveried: 0, returned: 0, platformFee: 0, returnFee: 0 },
        facebook: { spend: 0, revenue: 0, deliveried: 0, returned: 0, platformFee: 0, returnFee: 0 },
        shopee: { spend: 0, revenue: 0, deliveried: 0, returned: 0, platformFee: 0, returnFee: 0 },
      }
    );
  }

  // Filter data by mode
  let filteredData: AdsCostType[] = [];

  if (filterMode === "month") {
    filteredData = adsCosts.filter((item) => {
      const d = new Date(item.date);
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });
  } else if (filterMode === "year") {
    filteredData = adsCosts.filter((item) => {
      const d = new Date(item.date);
      return d.getFullYear() === selectedYear;
    });
  } else {
    filteredData = adsCosts;
  }

  // ✅ Apply extra filters (platform + product)
  if (filterPlatform !== "all") {
    filteredData = filteredData.filter((item) => item.platform === filterPlatform);
  }

  if (filterProduct !== "all") {
    filteredData = filteredData.filter((item) => item.targetProduct === filterProduct);
  }

  const totals = calculateTotals(filteredData);

  // -- Download table to excel
  const handleExportExcel = () => {
    // console.log("hihihi");
    // 1. Prepare worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(adsCosts);

    // 2. Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AdsSpending");

    // 3. Write to buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // 4. Save to file
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, `AdsSpending_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  const handleUploadCosts = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(UploadAdsCosts_API, {
      method: "POST",
      body: formData,
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) return alert("Upload failed: " + data.message);
    console.log("data", data);
    await updateUploadExcel(adsCosts, data.inserted);
    setIsShowUploadBox(false);
    alert(`✅ Uploaded ${data.count} costs`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cost?")) return;
    await deleteAdsCost(id);
    // alert("Deleted successfully!");
  };
  const handleEditData = (item: AdsCostType) => {
    setIsShowEditBox(true);
    setFormData(item);
  };

  const handleUpdate = async (id: string) => {
    await updateAdsCost(id, {
      ...formData,
    });
    setIsShowEditBox(false);
    alert("Cost updated successfully!");
  };
  return (
    <div className={cx("ads-costs-main")}>
      <h4 className={cx("title")}>Advertising Costs</h4>

      {/* Summary cards */}
      <div className={cx("summary-boxes")}>
        {summaryConfig.map(({ key, label, icon }) => {
          const data = totals[key as keyof typeof totals];
          const netRevenue = data.revenue - data.spend - (data.platformFee + data.returnFee);
          return (
            <div key={key} className={cx("summary-card")}>
              <span className={cx("label")}>
                {icon && <>{icon} &nbsp;</>} {label} Spent
              </span>
              <span className={cx("value")}>{data.spend.toLocaleString()}&nbsp;₫</span>

              <span className={cx("label")}>
                {icon && <>{icon} &nbsp;</>} {label} Revenue
              </span>
              <span className={cx("value")}>{data.revenue.toLocaleString()}&nbsp;₫</span>

              <div className={cx("delivery-return")}>
                <div>
                  <span className={cx("label")}>Delivered</span>
                  <span className={cx("value")}>{data.deliveried}</span>
                </div>
                <div>
                  <span className={cx("label")}>Returned</span>
                  <span className={cx("value")}>{data.returned}</span>
                </div>
                <div>
                  <span className={cx("label")}>Rate</span>
                  <span className={cx("value")}>{data.deliveried > 0 ? ((1 - data.returned / data.deliveried) * 100).toFixed(1) + "%" : "0%"}</span>
                </div>
              </div>

              <div className={cx("fees")}>
                <div>
                  <span className={cx("label")}>Platform Fee</span>
                  <span className={cx("value")}>{(data.platformFee / 1_000_000).toFixed(1)} M</span>
                </div>
                <div>
                  <span className={cx("label")}>Return Fee</span>
                  <span className={cx("value")}>{(data.returnFee / 1_000_000).toFixed(1)} M</span>
                </div>
                <div>
                  <span className={cx("label")}>Total</span>
                  <span className={cx("value")}>{((data.platformFee + data.returnFee) / 1_000_000).toFixed(1)} M</span>
                </div>
              </div>
              <div className={cx("gray-line")}></div>
              <div className={cx("net-revenue")}>
                <span className={cx("text1")}>Net-Revenue: &nbsp;</span>
                <span className={cx("text2")}> {netRevenue.toLocaleString("vi-VN")}</span>&nbsp;₫
              </div>
            </div>
          );
        })}
      </div>

      {isOpenAddForm && (
        <div className={cx("add-ads-costs-container")}>
          <AddAdsCosts setIsOpenAddForm={setIsOpenAddForm} />
        </div>
      )}
      <div className={cx("tabs-filter-box")}>
        {/* Tabs navigation */}
        <div className={cx("tabs")}>
          <div>
            {" "}
            <button className={cx("add-btn")} onClick={() => setIsOpenAddForm(true)}>
              ➕ Add Ads Data
            </button>
          </div>
          {/* <div className={cx("tab", "add")} onClick={() => setIsShowUploadBox(true)}>
            Upload Excel
          </div> */}
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

          <div className={cx("filters-option")}>
            <div>
              <label>Platform:&nbsp;</label>
              <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value as PlatformName | "all")}>
                <option value="all">All</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="Shopee">Shopee</option>
              </select>
            </div>

            <div>
              <label>Product:&nbsp;</label>
              <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)}>
                <option value="all">All</option>
                {Array.from(new Set(adsCosts.map((item) => item.targetProduct))).map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <AdsCostsCharts data={filteredData} />
      <div
        onClick={() => setIsShowMoreChart(!isShowMoreChart)}
        style={{ cursor: "pointer", color: "blue", textAlign: "center", margin: "10px 0px", textDecoration: "underline", fontSize: "18px", fontWeight: "550" }}
      >
        {!isShowMoreChart ? "Show more chart" : "Hide chart"}
      </div>
      {/* Fee Charts */}
      {/* <AdsCostFeeChart /> */}
      {/* <PlatformFeeChart /> */}
      {isShowMoreChart && (
        <React.Fragment>
          <ReturnFeeChart />
          <DeliveriedReturnedChart />
        </React.Fragment>
      )}
      {/* Content area */}
      <div className={cx("content")}>
        <div className={cx("history-list")}>
          <div className={cx("history-item", "header")}>
            <div>Date</div>
            <div>Platform</div>
            <div>Target Product</div>
            <div>Spend</div>
            <div>Delivered</div>
            <div>Returned</div>
            <div>Revenue</div>
            <div>Fee</div>
            <div>Return Fee</div>
            <div>Edit</div>
            <div>Delete</div>
          </div>
          <div className={cx("history-container")}>
            {filteredData.map((item, i) => (
              <div key={i} className={cx("history-item")}>
                <div>{item.date}</div>
                <div className={cx("platform")}>
                  {item.platform === "Facebook" && <FaSquareFacebook color="#0074c2" size={16} />}
                  {item.platform === "TikTok" && <AiFillTikTok color="black" size={16} />}
                  {item.platform === "Shopee" && <SiShopee color="#ff7220" size={16} />}
                  &nbsp;{item.platform}
                </div>
                <div>{item.targetProduct || "None"}</div>
                <div>₫{item.spendActual.toLocaleString()}</div>
                <div>{item.ordersDelivered}</div>
                <div>{item.ordersReturned}</div>
                <div>₫{item.netRevenue.toLocaleString()}</div>
                <div>{item.platformFee ? `₫${item.platformFee.toLocaleString()}` : "-"}</div>
                <div>{item.returnFee ? `₫${item.returnFee.toLocaleString()}` : "-"}</div>
                <div className={cx("col", "edit")} onClick={() => handleEditData(item)}>
                  <MdModeEdit size={20} />
                </div>
                <div className={cx("col", "delete")} onClick={() => handleDelete(item._id!)}>
                  <MdDelete size={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isShowEditBox && (
        <div className={cx("edit-box")}>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // stop page reload
              handleUpdate(formData._id);
            }}
            className={cx("form-body")}
          >
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
                <div>Spend Actual: {Number(formData.spendActual).toLocaleString()}</div>
                <input type="number" name="spendActual" value={formData.spendActual} onChange={handleManualChange} />
              </label>
              <label>
                Orders Delivered:
                <input type="number" name="ordersDelivered" value={formData.ordersDelivered} onChange={handleManualChange} />
              </label>
            </div>
            <div>
              <label>
                <div>Orders Returned: {Number(formData.ordersReturned).toLocaleString()}</div>
                <input type="number" name="ordersReturned" value={formData.ordersReturned} onChange={handleManualChange} />
              </label>
              <label>
                <div>Net Revenue: {Number(formData.netRevenue).toLocaleString()}</div>
                <input type="number" name="netRevenue" value={formData.netRevenue} onChange={handleManualChange} />
              </label>
            </div>
            <div>
              <label>
                <div>Platform Fee: {Number(formData.platformFee).toLocaleString()}</div>
                <input type="number" name="platformFee" value={formData.platformFee} onChange={handleManualChange} />
              </label>
              <label>
                <div>Return Fee: {Number(formData.returnFee).toLocaleString()}</div>
                <input type="number" name="returnFee" value={formData.returnFee} onChange={handleManualChange} />
              </label>
            </div>

            <div className={cx("group-btn")}>
              <button type="submit" className={cx("submit-btn")}>
                Save
              </button>
              <button
                className={cx("submit-btn")}
                onClick={(e) => {
                  e.preventDefault();
                  setIsShowEditBox(false);
                }}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}
      {isShowUploadBox && <UploadExcelBox onClose={() => setIsShowUploadBox(false)} onUpload={handleUploadCosts} />}
    </div>
  );
}

export function AdsCostsCards() {
  const { adsCosts, fetchAdsCosts, updateUploadExcel } = useAdsCostStore();
  const aggregated = useMemo(() => {
    const result: Record<
      string,
      {
        platform: string;
        spent: number;
        revenue: number;
        delivered: number;
        returned: number;
        platformFee: number;
        returnFee: number;
      }
    > = {};

    adsCosts.forEach((item) => {
      if (!result[item.platform]) {
        result[item.platform] = {
          platform: item.platform,
          spent: 0,
          revenue: 0,
          delivered: 0,
          returned: 0,
          platformFee: 0,
          returnFee: 0,
        };
      }
      result[item.platform].spent += item.spendActual;
      result[item.platform].revenue += item.netRevenue;
      result[item.platform].delivered += item.ordersDelivered;
      result[item.platform].returned += item.ordersReturned;
      result[item.platform].platformFee += item.platformFee || 0;
      result[item.platform].returnFee += item.returnFee || 0;
    });

    // Add "Total" summary
    const total = Object.values(result).reduce(
      (acc, cur) => {
        acc.spent += cur.spent;
        acc.revenue += cur.revenue;
        acc.delivered += cur.delivered;
        acc.returned += cur.returned;
        acc.platformFee += cur.platformFee;
        acc.returnFee += cur.returnFee;
        return acc;
      },
      {
        platform: "Total",
        spent: 0,
        revenue: 0,
        delivered: 0,
        returned: 0,
        platformFee: 0,
        returnFee: 0,
      }
    );

    return [total, ...Object.values(result)];
  }, []);

  return (
    <div style={{}}>
      <div className={cx("cards-grid")}>
        {aggregated.map((item) => {
          const totalFee = item.platformFee + item.returnFee;
          const rate = item.delivered > 0 ? ((item.delivered - item.returned) / item.delivered) * 100 : 0;
          const netRevenue = item.revenue - totalFee;

          const iconPlatform = summaryConfig.find((config) => config.label === item.platform);

          return (
            <div key={item.platform} className={cx("card")}>
              {item.platform === "Total" ? (
                <>
                  <div>Total Spent</div>
                  <div className={cx("value")}>{item.spent.toLocaleString("vi-VN")} ₫</div>
                  <div>Total Revenue</div>
                  <div className={cx("value")}>{item.revenue.toLocaleString("vi-VN")} ₫</div>
                </>
              ) : (
                <>
                  <div className={cx("platform-name")}>
                    {iconPlatform?.icon} &nbsp; {item.platform} Spent
                  </div>
                  <div className={cx("value")}>{item.spent.toLocaleString("vi-VN")} ₫</div>
                  <div className={cx("platform-name")}>
                    {iconPlatform?.icon} &nbsp; {item.platform} Revenue
                  </div>
                  <div className={cx("value")}>{item.revenue.toLocaleString("vi-VN")} ₫</div>
                </>
              )}

              <div className={cx("stats")}>
                <span>Delivered: {item.delivered}</span>
                <span>Returned: {item.returned}</span>
                <span>Rate: {rate.toFixed(1)}%</span>
              </div>

              <div className={cx("fees")}>
                <div>
                  Platform Fee: <strong>{(item.platformFee / 1_000_000).toFixed(1)} M</strong>
                </div>
                <div>
                  Return Fee: <strong>{(item.returnFee / 1_000_000).toFixed(1)} M</strong>
                </div>
                <div>
                  Total: <strong>{(totalFee / 1_000_000).toFixed(1)} M</strong>
                </div>
              </div>
              <div className={cx("gray-line")}></div>
              <div>
                Net-Revenue: <strong>{netRevenue.toLocaleString("vi-VN")} ₫</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
