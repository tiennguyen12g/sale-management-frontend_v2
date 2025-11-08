import { create } from "zustand";
import { useAuthStore } from "./authStore";
import { useBranchStore } from "./branchStore";
import { GetProducts_API, AddProduct_API, AssignProductsToBranch_API, UpdateBranchProducts_API, GetBranchProducts_API } from "../configs/api";
export interface ProductDetailsType {
  name: string;
  stock: number;
  color: string;
  size: string;
  price: number;
  weight: number;
  breakEvenPrice: number;
}

export interface ProductType {
  _id: string;
  company_id: string;
  product_code: string;
  name: string;
  typeProduct: string;
  sizeAvailable: string[];
  colorAvailable: string[];
  productDetailed: ProductDetailsType[];
  imageUrl: { name: string; color: string; url: string }[];
  material?: string;
  description?: string;
  category?: string;
  stock?: number;
  supplier?: string;
  tags?: string[];
  warranty?: string;
  salesCount?: number;
  notes?: string;
}

interface ProductState {
  products: ProductType[];
  loading: boolean;
  error: string | null;

  fetchProducts: (branchId?: string | null) => Promise<{ status: string; message: string } | undefined>;
  addProduct: (p: Omit<ProductType, "_id" | "company_id">) => Promise<{ status: string; message: string } | undefined>;
  updateProduct: (id: string, p: Partial<ProductType>) => Promise<{ status: string; message: string } | undefined>;
  deleteProduct: (id: string) => Promise<{ status: string; message: string } | undefined>;
  startAutoFetch: () => void;
  
  // Branch Product Assignment
  assignProductsToBranch: (branchId: string, productIds: string[]) => Promise<{ status: string; message: string } | undefined>;
  updateBranchProducts: (branchId: string, productIds: string[]) => Promise<{ status: string; message: string } | undefined>;
  getBranchProducts: (branchId: string) => Promise<{ status: string; products?: any[]; message?: string } | undefined>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  /**
   * Fetch products for the authenticated user's company
   * If branchId is provided, only fetches products assigned to that branch
   * If branchId is null/undefined, fetches all products for the company
   */
  fetchProducts: async (branchId?: string | null) => {
    set({ loading: true, error: null });
    try {
      const { getAuthHeader, logout, company_id } = useAuthStore.getState();
      
      // Build URL with optional branch_id query parameter
      let url = GetProducts_API;
      if (branchId) {
        url = `${GetProducts_API}?branch_id=${branchId}`;
      }

      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });
      const data = await res.json();

      if (res.status === 401) {
        logout();
        window.location.href = "/login";
        return { status: "No valid token", message: data.message };
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      set({ products: data, loading: false });
      return { status: "success", message: "Products fetched successfully" };
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return { status: "failed", message: err.message };
    }
  },

  addProduct: async (p) => {
    try {
      const { getAuthHeader, logout, company_id } = useAuthStore.getState();
      
      // company_id is automatically set by backend from authenticated user
      // But we still need to refresh the product list after adding
      const res = await fetch(AddProduct_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(p),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      const data = await res.json();
      
      // Refresh products list after adding
      await get().fetchProducts();
      
      return { status: "success", message: "Product added successfully" };
    } catch (err: any) {
      set({ error: err.message });
      return { status: "failed", message: err.message };
    }
  },

  updateProduct: async (id, p) => {
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const res = await fetch(`${GetProducts_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(p),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      const data = await res.json();
      
      // Refresh products list after updating
      await get().fetchProducts();
      
      return { status: "success", message: "Product updated successfully" };
    } catch (err: any) {
      set({ error: err.message });
      return { status: "failed", message: err.message };
    }
  },

  deleteProduct: async (id) => {
    try {
      const { getAuthHeader } = useAuthStore.getState();
      const res = await fetch(`${GetProducts_API}/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      // Refresh products list after deleting
      await get().fetchProducts();
      
      return { status: "success", message: "Product deleted successfully" };
    } catch (err: any) {
      set({ error: err.message });
      return { status: "failed", message: err.message };
    }
  },
  startAutoFetch: () => {
    // ✅ Prevent multiple intervals
    if ((get() as any)._intervalStarted) return;
    (get() as any)._intervalStarted = true;

    // ✅ Call once immediately - use selectedBranch if available
    const { selectedBranch } = useBranchStore.getState();
    get().fetchProducts(selectedBranch?._id);

    setInterval(() => {
      const { selectedBranch } = useBranchStore.getState();
      get().fetchProducts(selectedBranch?._id);
    }, 20 * 1000);
  },

  /**
   * Assign products to a branch
   */
  assignProductsToBranch: async (branchId: string, productIds: string[]) => {
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const url = `${AssignProductsToBranch_API}/${branchId}/assign-products`;
      console.log('Calling API:', url);
      console.log('Product IDs:', productIds);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ productIds }),
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to assign products to branch");
      }

      const data = await res.json();
      
      // Refresh branches to update the list_product_selling
      await useBranchStore.getState().fetchBranches();

      return { status: "success", message: data.message || "Products assigned successfully" };
    } catch (err: any) {
      console.error('Assign products error:', err);
      const errorMessage = err.message || "Failed to assign products to branch";
      set({ error: errorMessage });
      return { status: "failed", message: errorMessage };
    }
  },

  /**
   * Update products assigned to a branch (replaces existing list)
   */
  updateBranchProducts: async (branchId: string, productIds: string[]) => {
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const url = `${UpdateBranchProducts_API}/${branchId}/update-products`;
      
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ productIds }),
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update branch products");
      }

      const data = await res.json();
      
      // Refresh branches to update the list_product_selling
      await useBranchStore.getState().fetchBranches();

      return { status: "success", message: data.message || "Products updated successfully" };
    } catch (err: any) {
      console.error('Update branch products error:', err);
      const errorMessage = err.message || "Failed to update branch products";
      set({ error: errorMessage });
      return { status: "failed", message: errorMessage };
    }
  },

  /**
   * Get products assigned to a branch
   */
  getBranchProducts: async (branchId: string) => {
    try {
      const { getAuthHeader, logout } = useAuthStore.getState();
      const url = `${GetBranchProducts_API}/${branchId}/products`;
      
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(`Server returned non-JSON response. Status: ${res.status}`);
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to get branch products");
      }

      const data = await res.json();
      return { status: "success", products: data.products || [] };
    } catch (err: any) {
      console.error('Get branch products error:', err);
      const errorMessage = err.message || "Failed to get branch products";
      set({ error: errorMessage });
      return { status: "failed", message: errorMessage };
    }
  },
}));
