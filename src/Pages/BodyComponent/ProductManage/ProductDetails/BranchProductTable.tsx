import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./BranchProductTable.module.scss";
import { useBranchStore } from "../../../../zustand/branchStore";
import AssignProductModal from "./AssignProductModal";

const cx = classNames.bind(styles);

export default function BranchProductTable() {
  const { branches, fetchBranches } = useBranchStore();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignBranchId, setAssignBranchId] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleEdit = (branchId: string) => {
    setAssignBranchId(branchId);
    setIsAssignModalOpen(true);
  };

  const handleAssignNew = () => {
    setAssignBranchId(null);
    setIsAssignModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAssignModalOpen(false);
    setAssignBranchId(null);
  };

  const handleSuccess = () => {
    fetchBranches(); // Refresh branches after assignment
  };

  return (
    <div className={cx("branch-product-table")}>
      <div className={cx("header")}>
        <h3>Danh sách chi nhánh và sản phẩm được gán</h3>
        <button className={cx("btn-assign")} onClick={handleAssignNew}>
          + Gán sản phẩm cho chi nhánh
        </button>
      </div>

      <div className={cx("table-container")}>
        <table className={cx("table")}>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên chi nhánh</th>
              <th>Platform</th>
              <th>Số lượng sản phẩm</th>
              <th>Danh sách sản phẩm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {branches
              ?.filter((b) => !b.archived)
              .map((branch, index) => {
                const productCount = branch.list_product_selling?.length || 0;
                const products = branch.list_product_selling || [];

                return (
                  <tr key={branch._id}>
                    <td>{index + 1}</td>
                    <td>{branch.display_name}</td>
                    <td>
                      <span className={cx("platform-badge", branch.platform)}>
                        {branch.platform}
                      </span>
                    </td>
                    <td>
                      <span className={cx("product-count")}>{productCount}</span>
                    </td>
                    <td>
                      <div className={cx("product-list")}>
                        {products.length > 0 ? (
                          <div className={cx("product-tags")}>
                            {products.slice(0, 3).map((product, idx) => (
                              <span key={idx} className={cx("product-tag")}>
                                {product.product_code} - {product.name}
                              </span>
                            ))}
                            {products.length > 3 && (
                              <span className={cx("product-tag", "more")}>
                                +{products.length - 3} sản phẩm khác
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={cx("no-products")}>Chưa có sản phẩm</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className={cx("btn-edit")}
                        onClick={() => handleEdit(branch._id)}
                      >
                        ✏️ Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                );
              })}
            {(!branches || branches.filter((b) => !b.archived).length === 0) && (
              <tr>
                <td colSpan={6} className={cx("empty-row")}>
                  Không có chi nhánh nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AssignProductModal
        isOpen={isAssignModalOpen}
        onClose={handleModalClose}
        branchId={assignBranchId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

