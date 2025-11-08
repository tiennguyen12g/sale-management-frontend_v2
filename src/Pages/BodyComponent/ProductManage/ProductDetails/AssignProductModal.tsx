import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./AssignProductModal.module.scss";
import { useProductStore } from "../../../../zustand/productStore";
import { useBranchStore } from "../../../../zustand/branchStore";

const cx = classNames.bind(styles);

interface AssignProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId?: string | null; // If provided, edit mode; if null, new assignment mode
  onSuccess?: () => void;
}

export default function AssignProductModal({ isOpen, onClose, branchId, onSuccess }: AssignProductModalProps) {
  const { products, fetchProducts, assignProductsToBranch, updateBranchProducts, getBranchProducts } = useProductStore();
  const { branches, fetchBranches } = useBranchStore();
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products and branches on mount
  useEffect(() => {
    if (isOpen) {
      fetchProducts(null); // Fetch all products
      fetchBranches();
      
      // If editing (branchId provided), load existing assignments
      if (branchId) {
        loadBranchProducts(branchId);
        setSelectedBranchId(branchId);
      } else {
        setSelectedBranchId("");
        setSelectedProductIds(new Set());
      }
    }
  }, [isOpen, branchId]);

  const loadBranchProducts = async (id: string) => {
    try {
      const result = await getBranchProducts(id);
      if (result?.status === "success" && result.products) {
        // Handle both ObjectId objects and string IDs
        const productIds = result.products.map((p: any) => {
          const productId = p.product_id;
          return typeof productId === 'string' ? productId : productId.toString();
        });
        setSelectedProductIds(new Set(productIds));
      }
    } catch (err: any) {
      console.error("Failed to load branch products:", err);
      setError("Không thể tải danh sách sản phẩm của chi nhánh");
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => p._id)));
    }
  };

  const handleSave = async () => {
    if (!selectedBranchId) {
      setError("Vui lòng chọn chi nhánh");
      return;
    }

    if (selectedProductIds.size === 0) {
      setError("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const productIdsArray = Array.from(selectedProductIds);
      console.log('productIdsArray', productIdsArray);
      
      let result;
      if (branchId) {
        // Update existing branch
        result = await updateBranchProducts(selectedBranchId, productIdsArray);
      } else {
        // Assign to new branch
        result = await assignProductsToBranch(selectedBranchId, productIdsArray);
      }

      if (result?.status === "success") {
        alert(result.message || "Gán sản phẩm thành công!");
        onSuccess?.();
        onClose();
      } else {
        setError(result?.message || "Gán sản phẩm thất bại");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cx("modal-overlay")} onClick={onClose}>
      <div className={cx("modal")} onClick={(e) => e.stopPropagation()}>
        <div className={cx("modal-header")}>
          <h2>{branchId ? "Chỉnh sửa sản phẩm cho chi nhánh" : "Gán sản phẩm cho chi nhánh"}</h2>
          <button className={cx("close-btn")} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={cx("modal-body")}>
          {error && <div className={cx("error-message")}>{error}</div>}

          {/* Part 1: Product Selection */}
          <div className={cx("section")}>
            <h3>1. Chọn sản phẩm</h3>
            <div className={cx("select-all")}>
              <button onClick={handleSelectAll} className={cx("btn-select-all")}>
                {selectedProductIds.size === products.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              </button>
              <span className={cx("selected-count")}>
                Đã chọn: {selectedProductIds.size} / {products.length}
              </span>
            </div>
            <div className={cx("product-list")}>
              {products.map((product) => (
                <div key={product._id} className={cx("product-item")}>
                  <label className={cx("checkbox-label")}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(product._id)}
                      onChange={() => handleProductToggle(product._id)}
                    />
                    <span className={cx("product-info")}>
                      <span className={cx("product-code")}>{product.product_code}</span>
                      <span className={cx("product-name")}> - {product.name}</span>
                    </span>
                  </label>
                </div>
              ))}
              {products.length === 0 && (
                <div className={cx("empty-message")}>Không có sản phẩm nào</div>
              )}
            </div>
          </div>

          {/* Part 2: Branch Selection */}
          <div className={cx("section")}>
            <h3>2. Chọn chi nhánh</h3>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className={cx("branch-select")}
              disabled={!!branchId} // Disable if editing
            >
              <option value="">-- Chọn chi nhánh --</option>
              {branches
                ?.filter((b) => !b.archived)
                .map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.display_name} ({branch.platform})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className={cx("modal-footer")}>
          <button className={cx("cancel-btn")} onClick={onClose} disabled={loading}>
            Hủy
          </button>
          <button className={cx("save-btn")} onClick={handleSave} disabled={loading || !selectedBranchId}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}

