import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./ProductDetailsForOwner.module.scss";

const cx = classNames.bind(styles);
import { FaRegClone } from "react-icons/fa6";
import ProductTable from "./ProductTableForOwner";
import BranchProductTable from "./BranchProductTable";
import { type ProductType, type ProductDetailsType } from "../../../../zustand/productStore";
import { useProductStore } from "../../../../zustand/productStore";
import { useBranchStore } from "../../../../zustand/branchStore";
import { UploadProductImage_API } from "../../../../config/api";
const ProductTypeName = ["Quần/áo", "Thiết bị điện tử", "Đồ gia dụng", "Đồ ăn", "Tranh ảnh"];
const templateProduct: Omit<ProductType, "_id" | "company_id"> = {
  product_code: "",
  name: "",
  typeProduct: "",
  sizeAvailable: [],
  colorAvailable: [],
  productDetailed: [],
  imageUrl: [],
};
export default function ProductDetailsForOwner() {
  const { products, fetchProducts, updateProduct, addProduct, deleteProduct } = useProductStore();
  const { selectedBranch } = useBranchStore();
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [product, setProduct] = useState<Omit<ProductType, "_id" | "company_id">>({ ...templateProduct });
  const [editProduct, setEditProduct] = useState<ProductType>({ ...templateProduct, _id: "", company_id: "" });

  // Fetch products when component mounts or selectedBranch changes
  // For owner: fetch all company products (no branch_id filter)
  // For staff: fetch products assigned to selectedBranch
  useEffect(() => {
    // Owner sees all company products, staff sees branch products
    // For now, fetch all products (branch_id will be null/undefined)
    // Later, you can add logic to filter by branch if needed
    fetchProducts(null); // Fetch all products for the company
  }, [fetchProducts, selectedBranch]);

  // ---- IMAGE HANDLING ----
  const handleAddImage = (whatBox: "new-form" | "edit-form") => {
    if (whatBox === "new-form") {
      setProduct((prev) => ({
        ...prev,
        imageUrl: [...prev.imageUrl, { name: "", color: "", url: "" }],
      }));
    } else if (whatBox === "edit-form") {
      setEditProduct((prev) => ({
        ...prev,
        imageUrl: [...prev.imageUrl, { name: "", color: "", url: "" }],
      }));
    }
  };

  const handleImageChange = (whatBox: "new-form" | "edit-form", index: number, field: keyof ProductType["imageUrl"][0], value: string) => {
    if (whatBox === "new-form") {
      const newImgs = [...product.imageUrl];
      newImgs[index][field] = value;
      setProduct({ ...product, imageUrl: newImgs });
    } else if (whatBox === "edit-form") {
      const newImgs = [...editProduct.imageUrl];
      newImgs[index][field] = value;
      setEditProduct({ ...editProduct, imageUrl: newImgs });
    }
  };

  const handleRemoveImage = (whatBox: "new-form" | "edit-form", index: number) => {
    if (whatBox === "new-form") {
      const newImgs = [...product.imageUrl];
      newImgs.splice(index, 1);
      setProduct({ ...product, imageUrl: newImgs });
    } else if (whatBox === "edit-form") {
      const newImgs = [...editProduct.imageUrl];
      newImgs.splice(index, 1);
      setEditProduct({ ...editProduct, imageUrl: newImgs });
    }
  };

  const handleFileUpload = async (whatBox: "new-form" | "edit-form", index: number, file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(UploadProductImage_API, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (whatBox === "new-form") {
        const newImgs = [...product.imageUrl];
        newImgs[index].url = data.url; // ✅ backend URL instead of blob
        newImgs[index].name = data.name;
        setProduct({ ...product, imageUrl: newImgs });
      } else if (whatBox === "edit-form") {
        const newImgs = [...editProduct.imageUrl];
        newImgs[index].url = data.url;
        newImgs[index].name = data.name;
        setEditProduct({ ...editProduct, imageUrl: newImgs });
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  // ---- PRODUCT DETAIL HANDLING ----
  const handleAddDetail = (whatBox: "new-form" | "edit-form") => {
    if (whatBox === "new-form") {
      setProduct((prev) => ({
        ...prev,
        productDetailed: [...prev.productDetailed, { name: "", stock: 0, color: "", size: "", price: 0, weight: 0,breakEvenPrice: 0 }],
      }));
    } else if (whatBox === "edit-form") {
      setEditProduct((prev) => ({
        ...prev,
        productDetailed: [...prev.productDetailed, { name: "", stock: 0, color: "", size: "", price: 0, weight: 0, breakEvenPrice: 0 }],
      }));
    }
  };

  const handleDetailChange = (whatBox: "new-form" | "edit-form", index: number, field: keyof ProductDetailsType, value: any) => {
    // if(field === "sizeAvailable" as keyof ProductDetailsType){

    // }

    if (whatBox === "new-form") {
      const newDetails = [...product.productDetailed];
      (newDetails[index] as any)[field] = value;
      setProduct({ ...product, productDetailed: newDetails });
    } else if (whatBox === "edit-form") {
      const newDetails = [...editProduct.productDetailed];
      (newDetails[index] as any)[field] = value;
      setEditProduct({ ...editProduct, productDetailed: newDetails, _id: editProduct._id });
    }
  };

  // clone handler
  const handleCloneDetail = (whatBox: "new-form" | "edit-form", idx: number) => {
    if (whatBox === "new-form") {
      setProduct((prev) => {
        const copyDetails = [...prev.productDetailed];
        const clonedItem = { ...copyDetails[idx] };
        copyDetails.splice(idx + 1, 0, clonedItem);
        return { ...prev, productDetailed: copyDetails };
      });
    } else if (whatBox === "edit-form") {
      setEditProduct((prev) => {
        const copyDetails = [...prev.productDetailed];
        const clonedItem = { ...copyDetails[idx] };
        copyDetails.splice(idx + 1, 0, clonedItem);
        return { ...prev, productDetailed: copyDetails };
      });
    }
  };

  const handleRemoveDetail = (whatBox: "new-form" | "edit-form", index: number) => {
    if (whatBox === "new-form") {
      const newDetails = [...product.productDetailed];
      newDetails.splice(index, 1);
      setProduct({ ...product, productDetailed: newDetails });
    } else if (whatBox === "edit-form") {
      const newDetails = [...editProduct.productDetailed];
      newDetails.splice(index, 1);
      setEditProduct({ ...editProduct, productDetailed: newDetails, _id: editProduct._id });
    }
  };

  const handleSubmit = async () => {
    console.log("product", product);
    try {
      // company_id is automatically set by backend from authenticated user
      // We don't need to include it in the request
      const res = await addProduct(product);
      if (res?.status === "failed") {
        alert(res.message || "Failed to add product");
        return;
      }
      alert("Product added successfully!");
      setProduct({ ...templateProduct });
      setShowForm(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error adding product");
    }
  };

  const handleEdit = (p: ProductType) => {
    setShowEditForm(true);
    setEditProduct(p);
  };

  const handleUpdateEditProduct = async () => {
    const res = await updateProduct(editProduct._id, {
      ...editProduct,
    });
    if (res?.status === "success") {
      alert("Update success");
      setShowEditForm(false);
      // setEditProduct({ ...templateProduct, _id: "" });
    } else {
      alert("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteProduct(id);
    if (res?.status === "success") {
      alert("Delete success");
    } else {
      alert("Delete failed");
    }
  };

  return (
    <div className={cx("product-details")}>

      {/* // -- Create New Product */}
      {showForm && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <h2>Thêm sản phẩm mới</h2>

            {/* Basic product info */}
            <div className={cx("form-group")}>
              <div className={cx("field")}>
                <label>Mã sản phẩm (không dấu):</label>
                <input value={product.product_code} onChange={(e) => setProduct({ ...product, product_code: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>Tên sản phẩm:</label>
                <input value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>Loại sản phẩm:</label>
                {/* <input value={product.typeProduct} onChange={(e) => setProduct({ ...product, typeProduct: e.target.value })} /> */}
                <select value={product.typeProduct} onChange={(e) => setProduct({ ...product, typeProduct: e.target.value })}>
                  <option value="Không xác định">Không xác định</option>
                  {ProductTypeName.map((type, i) => {
                    return <option key={i}>{type}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className={cx("form-group")}>
              <div className={cx("field")}>
                <label>
                  Size Available: &nbsp;
                  {product.sizeAvailable.map((size, i) => {
                    return (
                      <span key={i} style={{ color: "red" }}>
                        {size} &nbsp;
                      </span>
                    );
                  })}
                </label>
                <input
                  value={product.sizeAvailable}
                  onChange={(e) => setProduct({ ...product, sizeAvailable: e.target.value.split(",").map((item) => item.trim()) })}
                />
                <div style={{ color: "gray" }}>Ví dụ: M, S, L, XL, XXL, XXXL or 20*30*40cm, 20*20*20cm ... cách nhau bằng dấu phẩy ","</div>
              </div>
            </div>
            <div className={cx("form-group")}>
              <div className={cx("field")}>
                <label>
                  Color Available: &nbsp;
                  {product.colorAvailable.map((color, i) => {
                    return (
                      <span key={i} style={{ color: "red" }}>
                        {color} &nbsp;
                      </span>
                    );
                  })}
                </label>
                <input
                  value={product.colorAvailable}
                  onChange={(e) => setProduct({ ...product, colorAvailable: e.target.value.split(",").map((item) => item.trim()) })}
                />
                <div style={{ color: "gray" }}>Ví dụ: đỏ, xanh dương, xám, vàng, nâu, tím, mận đỏ ... cách nhau bằng dấu phẩy ","</div>
              </div>
            </div>
            <div className={cx("image-group")}>
              <div className={cx("field")}>
                <label>Upload image:</label>
                {product.imageUrl.map((img, idx) => (
                  <div key={idx} className={cx("image-row")}>
                    <input placeholder="Tên ảnh" value={img.name} onChange={(e) => handleImageChange("new-form", idx, "name", e.target.value)} />
                    <input placeholder="Màu" value={img.color} onChange={(e) => handleImageChange("new-form", idx, "color", e.target.value)} />
                    <input type="file" onChange={(e) => handleFileUpload("new-form", idx, e.target.files?.[0] || null)} />
                    {img.url && <img src={img.url} alt={img.name} style={{ width: "60px", height: "60px", objectFit: "cover" }} />}
                    <button className={cx("btn-decor", "btn-delete")} onClick={() => handleRemoveImage("new-form", idx)}>
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <button className={cx("btn-decor", "btn-add")} onClick={() => handleAddImage("new-form")}>
                  + Thêm ảnh
                </button>
              </div>
            </div>
            <div className={cx("form-group")}></div>

            {/* Product details list */}
            <h3>Chi tiết sản phẩm</h3>
            <div className={cx("detail-row")}>
              <div>Name</div>
              <div>Color</div>
              <div>Size</div>
              <div>Stock</div>
              <div>Price</div>
              <div>Weight(gram)</div>
              {/* <div>Break Even Price</div> */}
              <div>Clone</div>
              <div>Delete</div>
            </div>
            {product.productDetailed.map((detail, idx) => (
              <div key={idx} className={cx("detail-row")}>
                <input
                  className={cx("input-name")}
                  placeholder="Tên"
                  value={detail.name}
                  onChange={(e) => handleDetailChange("new-form", idx, "name", e.target.value)}
                />

                <select value={detail.color} onChange={(e) => handleDetailChange("new-form", idx, "color", e.target.value)}>
                  <option value="None">None</option>
                  {product.colorAvailable.map((color, i) => {
                    return (
                      <option key={i} value={color}>
                        {color}
                      </option>
                    );
                  })}
                </select>
                <select value={detail.size} onChange={(e) => handleDetailChange("new-form", idx, "size", e.target.value)}>
                  <option value="None">None</option>
                  {product.sizeAvailable.map((size, i) => {
                    return (
                      <option key={i} value={size}>
                        {size}
                      </option>
                    );
                  })}
                </select>
                <input
                  className={cx("input-quantity")}
                  type="number"
                  placeholder="Số lượng"
                  value={detail.stock}
                  onChange={(e) => handleDetailChange("new-form", idx, "stock", Number(e.target.value))}
                />
                <input
                  className={cx("input-price")}
                  type="number"
                  placeholder="Giá (VND)"
                  value={detail.price}
                  onChange={(e) => handleDetailChange("new-form", idx, "price", Number(e.target.value))}
                />
                <input
                  className={cx("input-weight")}
                  type="number"
                  placeholder="Cân nặng (gram)"
                  value={detail.weight}
                  onChange={(e) => handleDetailChange("new-form", idx, "weight", Number(e.target.value))}
                />
                {/* <input
                  className={cx("input-breakeven")}
                  type="number"
                  placeholder="Giá vốn (VND)"
                  value={detail.breakEvenPrice}
                  onChange={(e) => handleDetailChange("new-form", idx, "breakEvenPrice", Number(e.target.value))}
                /> */}
                <button className={cx("btn-clone")} onClick={() => handleCloneDetail("new-form", idx)}>
                  <FaRegClone size={20} />
                </button>
                <button className={cx("btn-delete")} onClick={() => handleRemoveDetail("new-form", idx)}>
                  Xóa
                </button>
              </div>
            ))}

            <button className={cx("btn-decor", "btn-add")} onClick={() => handleAddDetail("new-form")}>
              + Thêm chi tiết
            </button>

            <div className={cx("actions")}>
              <button className={cx("cancel-btn")} onClick={() => setShowForm(false)}>
                Đóng
              </button>
              <button className={cx("save-btn")} onClick={handleSubmit}>
                Lưu sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}



      {/* // -- Editing Product */}
      {showEditForm && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <h2>Chỉnh sửa sản phẩm</h2>

            {/* Basic product info */}
            <div className={cx("form-group")}>
              <div className={cx("field")}>
                <label>Mã sản phẩm (không dấu):</label>
                <input value={editProduct.product_code} onChange={(e) => setEditProduct({ ...editProduct, product_code: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>Tên sản phẩm:</label>
                <input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
              </div>
              <div className={cx("field")}>
                <label>Loại sản phẩm:</label>
                {/* <input value={editProduct.typeProduct} onChange={(e) => setEditProduct({ ...editProduct, typeProduct: e.target.value })} /> */}
                <select value={editProduct.typeProduct} onChange={(e) => setEditProduct({ ...editProduct, typeProduct: e.target.value })}>
                  <option value="Không xác định">Không xác định</option>
                  {ProductTypeName.map((type, i) => {
                    return <option key={i}>{type}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className={cx("form-group")}>
              <div className={cx("field")}>
                <label>
                  Size Available: &nbsp;
                  {editProduct.sizeAvailable.map((size, i) => {
                    return (
                      <span key={i} style={{ color: "red" }}>
                        {size} &nbsp;
                      </span>
                    );
                  })}
                </label>
                <input
                  value={editProduct.sizeAvailable}
                  onChange={(e) => setEditProduct({ ...editProduct, sizeAvailable: e.target.value.split(",").map((item) => item.trim()) })}
                />
                <div style={{ color: "gray" }}>Ví dụ: M, S, L, XL, XXL, XXXL or 20*30*40cm, 20*20*20cm ... cách nhau bằng dấu phẩy ","</div>
              </div>
            </div>
            <div className={cx("form-group")}>
              <div className={cx("field")}>
                <label>
                  Color Available: &nbsp;
                  {editProduct.colorAvailable.map((color, i) => {
                    return (
                      <span key={i} style={{ color: "red" }}>
                        {color} &nbsp;
                      </span>
                    );
                  })}
                </label>
                <input
                  value={editProduct.colorAvailable}
                  onChange={(e) => setEditProduct({ ...editProduct, colorAvailable: e.target.value.split(",").map((item) => item.trim()) })}
                />
                <div style={{ color: "gray" }}>Ví dụ: đỏ, xanh dương, xám, vàng, nâu, tím, mận đỏ ... cách nhau bằng dấu phẩy ","</div>
              </div>
            </div>
            <div className={cx("image-group")}>
              <div className={cx("field")}>
                <label>Upload image:</label>
                {editProduct.imageUrl.map((img, idx) => (
                  <div key={idx} className={cx("image-row")}>
                    <input placeholder="Tên ảnh" value={img.name} onChange={(e) => handleImageChange("edit-form", idx, "name", e.target.value)} />
                    <input placeholder="Màu" value={img.color} onChange={(e) => handleImageChange("edit-form", idx, "color", e.target.value)} />
                    <input type="file" onChange={(e) => handleFileUpload("edit-form", idx, e.target.files?.[0] || null)} />
                    {img.url && <img src={img.url} alt={img.name} style={{ width: "60px", height: "60px", objectFit: "cover" }} />}
                    <button className={cx("btn-decor", "btn-delete")} onClick={() => handleRemoveImage("edit-form", idx)}>
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <button className={cx("btn-decor", "btn-add")} onClick={() => handleAddImage("edit-form")}>
                  + Thêm ảnh
                </button>
              </div>
            </div>
            <div className={cx("form-group")}></div>

            {/* Product details list */}
            <h3>Chi tiết sản phẩm</h3>
            <div className={cx("detail-row")}>
              <div>Name</div>
              <div>Color</div>
              <div>Size</div>
              <div>Stock</div>
              <div>Price</div>
              <div>Weight(gram)</div>
              {/* <div>Break Even Price</div> */}
              <div>Clone</div>
              <div>Delete</div>
            </div>
            {editProduct.productDetailed.map((detail, idx) => (
              <div key={idx} className={cx("detail-row")}>
                <input
                  className={cx("input-name")}
                  placeholder="Tên"
                  value={detail.name}
                  onChange={(e) => handleDetailChange("edit-form", idx, "name", e.target.value)}
                />
                {/* <input
                  className={cx("input-color")}
                  placeholder="Màu"
                  value={detail.color}
                  onChange={(e) => handleDetailChange("edit-form", idx, "color", e.target.value)}
                />
                <input
                  className={cx("input-size")}
                  placeholder="Size"
                  value={detail.size}
                  onChange={(e) => handleDetailChange("edit-form", idx, "size", e.target.value)}
                /> */}
                <select value={detail.color} onChange={(e) => handleDetailChange("edit-form", idx, "color", e.target.value)}>
                  <option value="None">None</option>
                  {editProduct.colorAvailable.map((color, i) => {
                    return (
                      <option key={i} value={color}>
                        {color}
                      </option>
                    );
                  })}
                </select>
                <select value={detail.size} onChange={(e) => handleDetailChange("edit-form", idx, "size", e.target.value)}>
                  <option value="None">None</option>
                  {editProduct.sizeAvailable.map((size, i) => {
                    return (
                      <option key={i} value={size}>
                        {size}
                      </option>
                    );
                  })}
                </select>
                <input
                  className={cx("input-quantity")}
                  type="number"
                  placeholder="Số lượng"
                  value={detail.stock}
                  onChange={(e) => handleDetailChange("edit-form", idx, "stock", Number(e.target.value))}
                />
                <input
                  className={cx("input-price")}
                  type="number"
                  placeholder="Giá (VND)"
                  value={detail.price}
                  onChange={(e) => handleDetailChange("edit-form", idx, "price", Number(e.target.value))}
                />
                <input
                  className={cx("input-weight")}
                  type="number"
                  placeholder="Cân nặng (gram)"
                  value={detail.weight}
                  onChange={(e) => handleDetailChange("edit-form", idx, "weight", Number(e.target.value))}
                />
                {/* <input
                  className={cx("input-breakeven")}
                  type="number"
                  placeholder="Giá vốn (VND)"
                  value={detail.breakEvenPrice}
                  onChange={(e) => handleDetailChange("edit-form", idx, "breakEvenPrice", Number(e.target.value))}
                /> */}
                <button className={cx("btn-clone")} onClick={() => handleCloneDetail("edit-form", idx)}>
                  <FaRegClone size={20} />
                </button>
                <button className={cx("btn-delete")} onClick={() => handleRemoveDetail("edit-form", idx)}>
                  Xóa
                </button>
              </div>
            ))}

            <button className={cx("btn-decor", "btn-add")} onClick={() => handleAddDetail("edit-form")}>
              + Thêm chi tiết
            </button>

            <div className={cx("actions")}>
              <button className={cx("cancel-btn")} onClick={() => setShowEditForm(false)}>
                Đóng
              </button>
              <button className={cx("save-btn")} onClick={handleUpdateEditProduct}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* // -- Content */}

      <div className={cx("product-list")}>

        <div className={cx('wrap-title-btn')}>
          <div className={cx('title-header')}>Danh sách sản phẩm</div>
          <button className={cx("btn-assign")} onClick={() => setShowForm(true)}>
            + Thêm sản phẩm
          </button>
        </div>
        <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      {/* Branch Product Assignment Table */}
      <BranchProductTable />
    </div>
  );
}
