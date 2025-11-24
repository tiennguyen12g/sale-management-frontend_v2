import React, { useState, useEffect, memo } from "react";
import classNames from "classnames/bind";
import styles from "./ProductTableForStaff.module.scss";
const cx = classNames.bind(styles);

import { useProductStore } from "../../../../zustand/productStore";
import { useBranchStore } from "../../../../zustand/branchStore";
import NotificationBox_v2 from "../../../../utils/NotificationBox_v2";

interface Props {}

function ProductTableForStaff() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { products, fetchProducts } = useProductStore();
  const { selectedBranch } = useBranchStore();
  // const startAutoFetch = useProductStore((s) => s.startAutoFetch);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Fetch products when selectedBranch changes
  useEffect(() => {
    if (!selectedBranch?._id) {
      return; // Don't fetch if no branch is selected
    }

    async function GetData() {
      if (!selectedBranch) return;
      const res = await fetchProducts(selectedBranch._id);
      if (res && res.status === "No valid token") {
        setStatusMsg(res.message);
        setShowNotification(true);
      }
      if (res && res.status === "failed") {
        setStatusMsg(res.message);
        setShowNotification(true);
      }
    }
    GetData();
  }, [fetchProducts, selectedBranch?._id]);

  useEffect(() => {
    if (selectedBranch?._id) {
      fetchProducts(selectedBranch._id);
      console.log("fetch products for branch:", selectedBranch._id);
    }
  }, [fetchProducts, selectedBranch?._id]);

  return (
    <div className={cx("product-table")}>
      {showNotification && statusMsg && <NotificationBox_v2 message={statusMsg} onClose={() => setShowNotification(false)} />}

      <h3 className="mb-4">Danh sách sản phẩm đang bán{selectedBranch ? ` - ${selectedBranch.display_name}` : ""}</h3>
      {!selectedBranch && <div style={{ padding: "1rem", color: "#999", textAlign: "center" }}>Vui lòng chọn một chi nhánh để xem danh sách sản phẩm</div>}
      {selectedBranch && products.length === 0 && !statusMsg && (
        <div style={{ padding: "1rem", color: "#999", textAlign: "center" }}>Không có sản phẩm nào được gán cho chi nhánh này</div>
      )}
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Mã SP</th>
            <th>Tên SP</th>
            <th>Loại</th>
            <th>Hàng trong kho</th>
            <th>Size có sẵn</th>
            <th>Màu có sẵn</th>
            <th>Ảnh</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 &&
            products.map((p, i) => {
              const totalItem = p.productDetailed.reduce((acc, item) => {
                acc += item.stock;
                return acc;
              }, 0);
              return (
                <React.Fragment key={p._id}>
                  <tr onClick={() => toggleExpand(p._id)}>
                    <td>{i + 1}</td>
                    <td>{p.product_code}</td>
                    <td>{p.name}</td>
                    <td>{p.typeProduct || "-"}</td>
                    <td>{totalItem}</td>
                    <td>{p.sizeAvailable.join(", ") || "-"}</td>
                    <td>{p.colorAvailable.join(", ") || "-"}</td>
                    <td className="flex gap-2">
                      {p.imageUrl && p.imageUrl.length > 0 ? (
                        p.imageUrl.map((img, i) => (
                          <img key={i} src={img.url} alt={img.name} style={{ width: "40px", height: "40px", marginRight: "4px", objectFit: "cover" }} />
                        ))
                      ) : (
                        <span style={{ color: "#999" }}>No image</span>
                      )}
                    </td>
                  </tr>
                  {expandedId === p._id && (
                    <tr className={cx("details-row")}>
                      <td colSpan={8}>
                        <div className={cx("details-box")}>
                          <h4>Chi tiết sản phẩm</h4>
                          <table className={cx("details-table")}>
                            <thead>
                              <tr>
                                <th>No</th>
                                <th>Tên</th>
                                <th>Màu</th>
                                <th>Size</th>
                                <th>Số lượng</th>
                                <th>Giá (VND)</th>
                                <th>Trọng lượng (g)</th>
                                <th>Giá vốn (VND)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.productDetailed.map((d, idx) => (
                                <tr key={idx}>
                                  <td>{idx + 1}</td>
                                  <td>{d.name}</td>
                                  <td>{d.color}</td>
                                  <td>{d.size}</td>
                                  <td>{d.stock}</td>
                                  <td>{d.price.toLocaleString()}</td>
                                  <td>{d.weight}</td>
                                  <td>{d.breakEvenPrice.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTableForStaff;
