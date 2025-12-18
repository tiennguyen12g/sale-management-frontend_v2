import React, { useEffect, useState, useMemo, type Dispatch, type SetStateAction, useRef } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames/bind";
import styles from "./ShopOrders_v3.module.scss";
const cx = classNames.bind(styles);

// Icons
import { MdDelete } from "react-icons/md";
import { IoIosCopy } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import { HiMinusSmall } from "react-icons/hi2";
import { HiPlusSmall } from "react-icons/hi2";
import { FcFilledFilter } from "react-icons/fc";

import deliveryTruck from "@/components/ui/icons/gifs/delivery-truck.gif";
import atm from "@/components/ui/icons/gifs/atm.gif";
import dislike from "@/components/ui/icons/gifs/dislike.gif";
import hourglass from "@/components/ui/icons/gifs/hourglass.gif";
import conveyorBelt from "@/components/ui/icons/gifs/conveyor-belt.gif";
import phone from "@/components/ui/icons/gifs/phone.gif";
import outOfStock from "@/components/ui/icons/gifs/sold.png";
import courier from "@/components/ui/icons/gifs/courier.gif";
import dollarIcon from "@/components/ui/icons/gifs/dollar.gif";

// Hooks and type
import { useAuthStore } from "../../zustand/authStore";
import { useBranchStore } from "../../zustand/branchStore";
import { useStaffStore, type StaffRole } from "../../zustand/staffStore";
import { useShopOrderStore, type OrderDataFromServerType, type OriginalOrder, type FinalOrder } from "../../zustand/shopOrderStore";
import { type ProductType, type ProductDetailsType, useProductStore } from "../../zustand/productStore";

// Components

import VnAddressSelect_Old from "../../utils/VnAddress/VnAddressOld";
import { StaffRedistributeButton } from "../BodyComponent/Financial/Staff/RedistributeOrder";
import { ClaimMorningButton } from "./ClaimOrderMorning";
import NotificationBox_v2 from "../../utils/NotificationBox_v2";
import FreeShipAnimate from "./PromotionTags/FreeShipAnimate";
import Coupon from "./PromotionTags/Coupon";
import {
  TableWithDragColumn,
  TableWithResizeColumn,
  TableCommon,
  Select,
  Dropdown,
  Input,
  Search,
  SelectGray,
  ButtonBorderGradient,
  GradientButton,
  GroupButton,
  ButtonCommon,
  UploadBox,
  useToastSeri,
} from "@tnbt/react-favorit-style";
// Ultilitys
import CustomSelectGlobal from "../../utils/CustomSelectGlobal";
import { icons } from "@/components/ui/icons/Icons";

type VirtualCartType = ProductDetailsType & { quantity: number; isSelected: boolean };

interface ShopOrdersProps {
  dataOrders: OrderDataFromServerType[];
  setGetFinalData: Dispatch<SetStateAction<FinalOrder[]>>;
  products?: ProductType[]; // All products for the branch
}

const iconSize = 20;

export default function ShopOrders_v3({ dataOrders, setGetFinalData, products = [] }: ShopOrdersProps) {
  const { t } = useTranslation();
  const { successToast, errorToast, warningToast } = useToastSeri();
  // -- Hooks
  const {
    updateOrder,
    deleteOrder,
    addOrder,
    updateMultipleOrders,
    uploadOrdersExcel,
    deleteManyOrder,
    fetchOrders,
    orders: ordersFromStore,
    setUpdateOrders,
  } = useShopOrderStore();
  const { yourStaffProfileInWorkplace } = useStaffStore();
  const { yourStaffId, userInfo } = useAuthStore();
  const { selectedBranch } = useBranchStore();
  const { products: allProducts, fetchProducts } = useProductStore();

  const [staffName, setStaffName] = useState<string[]>([yourStaffProfileInWorkplace?.staffInfo.name || t("shopOrders.none", "Không")]);
  const [staffID, setStaffID] = useState(yourStaffId || "none");
  const [userId, setUserId] = useState("none");
  const staffRole: StaffRole | "none" = yourStaffProfileInWorkplace?.role || "none";

  // -- Support state/notifications
  const [showNotification, setShowNotification] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  // Product filter state
  const [selectedProductCode, setSelectedProductCode] = useState<string>("all"); // "all" or product_code
  const [selectedProductsForOrder, setSelectedProductsForOrder] = useState<ProductType[]>([]); // Multiple products selected when creating/editing order
  const [editingSelectedProducts, setEditingSelectedProducts] = useState<ProductType[]>([]); // Products selected when editing order

  // Sync dataOrders with store orders - always use store orders if available (they're the source of truth)
  // The store is updated immediately after edit, so we should use it
  // Key insight: Zustand store updates will cause ordersFromStore to get a new reference,
  // so this memo will recalculate and create a new deep copy, triggering React re-renders
  const syncedDataOrders: any[] = useMemo(() => {
    // Always prefer store orders if they exist (they're updated immediately after mutations)
    // Only fall back to prop if store is empty (initial load)
    if (ordersFromStore.length > 0) {
      // Always create a deep copy to ensure React detects changes in nested objects
      // This ensures that even if nested objects change, React will detect the change
      return JSON.parse(JSON.stringify(ordersFromStore));
    }

    // Fallback to prop data if store is empty

    if (dataOrders) return dataOrders;
    return [];
  }, [dataOrders, ordersFromStore]);

  // Memoize server order data to prevent unnecessary re-renders
  // Create deep copies to ensure React detects changes in nested objects
  const serverOriginalOrderData = useMemo(() => {
    const original: OriginalOrder[] = [];
    // if(!syncedDataOrders) return;
    syncedDataOrders.forEach((item: OrderDataFromServerType) => {
      // Only push original if it exists (orders from customers)
      if (item.original) {
        original.push(JSON.parse(JSON.stringify(item.original)));
      } else {
        // For staff-created orders, use final as original for display purposes
        original.push({
          ...item.final,
          staff_name: item.final.staff_name,
        } as OriginalOrder);
      }
    });
    return original;
  }, [syncedDataOrders]);

  const serverFinalOrderData = useMemo(() => {
    return syncedDataOrders.map((item: OrderDataFromServerType) => JSON.parse(JSON.stringify(item.final)));
  }, [syncedDataOrders]);

  // Get available products from branch or products prop
  const availableProducts = products.length > 0 ? products : allProducts;

  // Get unique product codes from orders
  const orderProductCodes = useMemo(() => {
    const codes = new Set<string>();
    syncedDataOrders.forEach((order: OrderDataFromServerType) => {
      if (order.product_code) {
        codes.add(order.product_code);
      }
    });
    return Array.from(codes);
  }, [syncedDataOrders]);

  // -- Create key for filter order by product
  let orderProductCodes_KeyFilter: { key: string; label: string }[] = [{ key: "all", label: t("shopOrders.all", "Tất cả") }];
  orderProductCodes.forEach((code) => {
    if (!code) return;
    const product = availableProducts.find((p) => p.product_code === code);
    orderProductCodes_KeyFilter.push({
      key: code,
      label: product ? `${code} - ${product.name}` : code,
    });
  });

  // Filter orders by selected product
  const filteredOrdersByProduct = useMemo(() => {
    if (selectedProductCode === "all") {
      return serverFinalOrderData;
    }
    return serverFinalOrderData.filter((order: FinalOrder) => {
      // Find the order in syncedDataOrders to get product_code
      const fullOrder = syncedDataOrders.find((o: OrderDataFromServerType) => o.final.orderCode === order.orderCode);
      return fullOrder?.product_code === selectedProductCode;
    });
  }, [serverFinalOrderData, selectedProductCode, syncedDataOrders]);
  const [orders, setOrders] = useState<FinalOrder[]>(filteredOrdersByProduct);
  const [originOrder, setOriginOrder] = useState<OriginalOrder | null>(null);

  // filter state
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["All"]);
  const [sortBy, setSortBy] = useState<SortOrder>("latest");
  const [deliveryStatuses, setDeliveryStatuses] = useState<string>("All");
  const [currentBuyerInfo, setCurrentBuyerInfo] = useState({
    province: "",
    district: "",
    commune: "",
  });
  const [correctedAddress, setCorrectedAddress] = useState<string | null>(null);
  const [openUpdateDeliveryBox, setOpenUpdateDeliveryBox] = useState<boolean>(false);
  const [selectedDeliveryStatusForUpdate, setSelectedDeliveryStatusForUpdate] = useState<string>(DeliveryOptionsForStaffSelectManual[0]);

  const [createNewOrderBox, setCreateNewOrderBox] = useState<boolean>(false);
  const [showListProduct, setShowListProduct] = useState(false);
  const localFormatted = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16).replace("T", " ");
  const [discountValue, setDiscountValue] = useState(0);

  // --- CRITICAL: sync local orders state when syncedDataOrders changes ---
  // Update orders whenever filteredOrdersByProduct changes (which depends on syncedDataOrders)
  // This ensures UI updates when store orders change after edit
  useEffect(() => {
    // Always update when filteredOrdersByProduct changes
    // filteredOrdersByProduct is a memo that depends on syncedDataOrders,
    // which changes when the store updates, so this will trigger a re-render
    // console.log('ShopOrders_v3: updating orders state, filteredOrdersByProduct length:', filteredOrdersByProduct.length);
    setOrders([...filteredOrdersByProduct]);
  }, [filteredOrdersByProduct]);

  // -- ✅ virtualCart can be changed by user
  const [virtualCart, setVirtualCart] = useState<VirtualCartType[]>([]);

  //-- Handle create new order
  const [defaultNewOrder, setDefaultNewOrder] = useState<FinalOrder>({
    orderCode: "default",
    time: localFormatted,
    customerName: "",
    phone: "",
    address: "",
    orderInfo: [], //{ product: "", color: "", size: "", quantity: 1, price: 0, product_id }
    total: 0,
    totalProduct: 0,
    totalWeight: 0,
    note: "",
    status: "Đơn mới",
    confirmed: false,
    staff_name: staffName[0],
    buyerIP: "",
    website: "",
    deliveryStatus: "Chưa gửi hàng",
    deliveryCode: "",
    facebookLink: "",
    tiktokLink: "",
    promotions: {
      shipTags: "none",
      discount: 0,
    },
    source_order_from: "",
  });
  const [newOrder, setNewOrder] = useState<FinalOrder>({ ...defaultNewOrder });

  useEffect(() => {
    setDefaultNewOrder((prev) => {
      return { ...prev, staff_name: staffName[0] };
    });
    setNewOrder((prev) => {
      return { ...prev, staff_name: staffName[0] };
    });
  }, [staffName]);
  const handleCreateNewOrder = async () => {
    if (!newOrder) return;

    if (!selectedBranch?._id) {
      warningToast(t("shopOrders.selectBranchBeforeCreate", "🚨 Vui lòng chọn chi nhánh trước khi tạo đơn hàng."));
      return;
    }

    if (selectedProductsForOrder.length === 0) {
      warningToast(t("shopOrders.selectAtLeastOneProduct", "🚨 Vui lòng chọn ít nhất một sản phẩm trước khi tạo đơn hàng."));
      return;
    }

    if (!newOrder.customerName || !newOrder.phone || !newOrder.address || newOrder.orderInfo.length === 0 || newOrder.total <= 0) {
      warningToast(t("shopOrders.fillAllInformation", "🚨 Vui lòng điền đầy đủ thông tin."));
      return;
    }

    // For multi-product orders, we'll use the first product's code as the primary product_code
    // The backend might need to handle this differently, but for now we'll use the first selected product
    const primaryProduct = selectedProductsForOrder[0];

    const localFormatted = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16).replace("T", " ");
    const newFinalForSend = {
      branch_id: selectedBranch._id,
      product_code: primaryProduct.product_code, // Use first product as primary
      staffID: staffID,
      isFromCustomer: false, // Orders created by staff don't need original
      ...newOrder,
      staff_name: newOrder.staff_name || staffName[0],
      time: localFormatted,
      company_id_own_product: selectedBranch.company_id,
    };
    const res = await addOrder(newFinalForSend);

    if (res?.status === "success") {
      successToast(t("shopOrders.createOrderSuccess", "✅ Tạo đơn hàng thành công!"));
      // Refresh orders
      if (selectedBranch?._id) {
        await fetchOrders(selectedBranch.company_id, selectedBranch._id);
      }
      setNewOrder({ ...defaultNewOrder });
      setSelectedProductsForOrder([]);
      setVirtualCart([]);
    } else {
      errorToast(t("shopOrders.createOrderError", "🚨 Tạo đơn hàng lỗi."));
    }
  };

  // -- Handle editting
  const [editing, setEditing] = useState<FinalOrder>({ ...defaultNewOrder });
  const [showEditingBox, setShowEditingBox] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);

  // Update virtualCart when selectedProductsForOrder changes (for create order mode)
  useEffect(() => {
    // Only update for create order mode (not editing)
    if (showEditingBox) {
      // Don't update virtualCart in edit mode - it's set when edit button is clicked
      return;
    }

    // For create order mode: rebuild cart when products are selected/deselected
    if (selectedProductsForOrder.length === 0) {
      setVirtualCart([]);
      return;
    }

    const cart: (VirtualCartType & { productCode?: string; productName?: string })[] = [...virtualCart];
    selectedProductsForOrder.forEach((product) => {
      if (product?.productDetailed) {
        product.productDetailed.forEach((p: ProductDetailsType) => {
          // Check if this item already exists in cart (don't duplicate)
          const exists = cart.some((item) => item.color === p.color && item.size === p.size && (item as any).productCode === product.product_code);
          console.log("existed", exists);
          if (!exists) {
            cart.push({
              ...p,
              quantity: 0,
              isSelected: false,
              productCode: product.product_code,
              productName: product.name,
            } as VirtualCartType & { productCode?: string; productName?: string });
          }
        });
      }
    });

    // Check the selected product is unchecked.
    const remainingCart = cart.filter((item) => {
      const isProductSelected = selectedProductsForOrder.some((product) => product.product_code === item.productCode);
      return isProductSelected;
    });
    // console.log('remain', remainingCart);

    setVirtualCart(remainingCart);
  }, [selectedProductsForOrder, showEditingBox]);

  const [filterColorInAddProduct, setFilterColorInAddProduct] = useState("None");
  const [isExceedStock, setIsExceedStock] = useState<number | null>(null);
  const [searchOrderCode, setSearchOrderCode] = useState<string | undefined>(undefined);
  const [showUploadExcel, setShowUploadExcel] = useState(false);

  // -- Handle editting save
  const handleSave = async () => {
    if (!editing) return;
    if (currentEditIndex === null) return;
    const orderCode = editing.orderCode;
    const dataOrder = syncedDataOrders.find((data: OrderDataFromServerType) => data.orderCode === orderCode);
    if (!dataOrder) return console.log("Cannot find root data of the order");
    const combineEditOrder: OrderDataFromServerType = {
      ...dataOrder,
      final: editing,
    };

    const res = await updateOrder(dataOrder._id, combineEditOrder);
    setDiscountValue(0);
    if (res?.status === "success") {
      // Update orders in store with the response data (deep copy to ensure change detection)
      if (res.data) {
        // Create a deep copy to ensure all nested objects are new references
        const updatedOrderData = JSON.parse(JSON.stringify(res.data));
        setUpdateOrders(updatedOrderData);
      }

      // Close editing box first
      setShowEditingBox(false);

      // Reset editing state
      setEditing({ ...defaultNewOrder });
      setCurrentEditIndex(null);
      setEditingSelectedProducts([]);
      setVirtualCart([]);
      setShowListProduct(false);
      setCorrectedAddress(null);
      setFilterColorInAddProduct("None");

      // Small delay to ensure store update is processed, then show success
      setTimeout(() => {
        successToast(t("shopOrders.updateSuccess", "Cập nhật thành công"));
      }, 50);
    } else {
      console.log("Editing failed");
      errorToast(t("shopOrders.updateError", "Sửa đơn bị lỗi, không thành công."));
    }
  };

  // -- Handle checkbox change
  const toggleStatus = (status: string) => {
    if (status === "All") {
      setSelectedStatuses(["All"]);
    } else {
      setSelectedStatuses((prev) => {
        const newStatuses = prev.includes(status) ? prev.filter((s) => s !== status) : [...prev.filter((s) => s !== "All"), status];
        return newStatuses.length === 0 ? ["All"] : newStatuses;
      });
    }
  };

  // -- Handle filter orders

  const sortedOrdersByTime = sortOrders(orders, sortBy);
  const filteredOrders = selectedStatuses.includes("All")
    ? sortedOrdersByTime
    : sortedOrdersByTime.filter((o) => selectedStatuses.some((s) => s.trim().toLowerCase() === o.status.trim().toLowerCase()));

  // Filter for "Chốt" status
  const filteredConfirmedOrders = deliveryStatuses === "All" ? filteredOrders : filteredOrders.filter((o) => o.deliveryStatus === deliveryStatuses);

  // Step 2: filter by search text
  const finalData = useMemo(() => {
    if (!searchOrderCode) return filteredConfirmedOrders;
    const q = searchOrderCode.toLowerCase();
    return filteredConfirmedOrders.filter((o) => o.orderCode.toLowerCase().includes(q) || (o.deliveryCode && o.deliveryCode.toLowerCase().includes(q)));
  }, [searchOrderCode, filteredConfirmedOrders]);

  // keep previous ref for shallow comparison
  const prevRef = useRef<typeof finalData | null>(null);

  // -- Handle update data to CreateExcel component
  useEffect(() => {
    const prev = prevRef.current;
    let changed = false;

    if (!prev) {
      changed = finalData.length > 0;
    } else if (prev.length !== finalData.length) {
      changed = true;
    } else {
      // compare by identifier (use your real unique key, e.g. id or orderCode)
      for (let i = 0; i < finalData.length; i++) {
        // quick compare: same object reference or same id/orderCode

        if (prev[i].status !== finalData[i].status) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      setGetFinalData(finalData);
      prevRef.current = finalData;
    }
  }, [finalData, setGetFinalData, orders]);

  const handleFilterByOwnerId = (codeText: string) => {
    if (!codeText) return filteredConfirmedOrders;

    const lowerText = codeText.trim().toLowerCase();

    return filteredConfirmedOrders.filter(
      (o) => o.orderCode.toLowerCase().includes(lowerText) || (o.deliveryCode && o.deliveryCode.toLowerCase().includes(lowerText)) // in case you also want to match deliveryCode
    );
  };

  //-- Handle search
  // Note: The actual filtering is done via searchOrderCode state which is updated by onChange
  // We don't need onSearch because filtering happens automatically when searchOrderCode changes

  const countByStatus = () => {
    const counts: Record<string, number> = {};
    filteredConfirmedOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  };
  const statusCounts = countByStatus();
  const DeliveryStatusCounts = () => {
    const counts: Record<string, number> = {};
    filteredConfirmedOrders.forEach((o) => {
      counts[o.deliveryStatus] = (counts[o.deliveryStatus] || 0) + 1;
      if (o.deliveryStatus === "Chưa gửi hàng" && o.status === "Chốt") {
        {
          counts["Đã chốt"] = (counts["Đã chốt"] || 0) + 1;
        }
      }
    });
    return counts;
  };
  const DeliveryStatusCountsResult = DeliveryStatusCounts();

  // -- Handle select address
  const handleAddressChange_Old = (whatBox: "edit-form" | "new-form", addr: { provinceName: string; districtName: string; communeName: string }) => {
    setCurrentBuyerInfo({
      province: addr.provinceName,
      district: addr.districtName,
      commune: addr.communeName,
    });
  };

  useEffect(() => {
    if (!correctedAddress) return;

    const fullAddress = [correctedAddress, currentBuyerInfo.commune, currentBuyerInfo.district, currentBuyerInfo.province].filter(Boolean).join(", ");

    if (editing) {
      setEditing((prev) => (prev ? { ...prev, address: fullAddress } : prev));
    }
    if (newOrder) {
      setNewOrder((prev) => ({ ...prev, address: fullAddress }));
    }
  }, [correctedAddress, currentBuyerInfo]);

  // -- Function handle order change
  const UpdateMultipleDeliveryStatus = async (newStatus: string) => {
    if (DeliveryStatusCountsResult["Đã chốt"] === 0) {
      warningToast(t("shopOrders.noOrdersToUpdate", "Không có đơn hàng nào để cập nhật. Vui lòng kiểm tra lại."));
      return;
    }
    if (newStatus === "Chưa gửi hàng") {
      warningToast(t("shopOrders.selectValidDeliveryStatus", "Vui lòng chọn trạng thái vận chuyển hợp lệ để cập nhật."));
      return;
    }

    const idsToUpdate = syncedDataOrders
      .filter(
        (o: OrderDataFromServerType) =>
          (o.final.status === "Chốt" && o.final.deliveryStatus === "Chưa gửi hàng") ||
          o.final.deliveryStatus === "Đang đóng hàng" ||
          o.final.deliveryStatus === "Đã gửi hàng"
      )
      .map((o: OrderDataFromServerType) => o._id);

    if (idsToUpdate.length === 0) return;

    const res = await updateMultipleOrders(idsToUpdate, { deliveryStatus: newStatus });
    if (res?.status === "success") {
      successToast(t("shopOrders.updateDeliveryStatusSuccess", "✅ Cập nhật trạng chuyển thành công"));
    } else {
      errorToast(t("shopOrders.updateDeliveryStatusError", "🚨 Cập nhật lỗi."));
    }
  };
  const handleNumberProduct = (action: "decrease" | "increase", index: number) => {
    const newCart = [...virtualCart];
    if (action === "increase") {
      if (newCart[index].quantity + 1 > newCart[index].stock) {
        // 🚨 exceed stock
        setIsExceedStock(index);
        return; // stop increasing
      }
      if (newCart[index].quantity === 0) {
        newCart[index].isSelected = true;
      }
      newCart[index].quantity += 1;

      setVirtualCart(newCart);
    }
    if (action === "decrease") {
      if (typeof isExceedStock === "number") {
        setIsExceedStock(null);
      }
      if (newCart[index].quantity === 0) {
        // setNotify2("Ít nhất là 1 sản phẩm")
        return;
      } else {
        newCart[index].quantity = newCart[index].quantity - 1;
        if (newCart[index].quantity < 0) {
          newCart[index].quantity === 0;
        }
        if (newCart[index].quantity === 0) {
          newCart[index].isSelected = false;
        }
        setVirtualCart(newCart);
      }
    }
  };

  const handleCartChange = (value: boolean, index: number) => {
    const newCart = [...virtualCart];

    newCart[index].isSelected = value;
    if (newCart[index].quantity === 0 && value) {
      newCart[index].quantity = 1;
    }
    if (newCart[index].quantity !== 0 && value === false) {
      newCart[index].quantity = 0;
    }
    setVirtualCart(newCart);
  };

  const handleCloseAddProduct = (whatBox: "new-form" | "edit-form") => {
    const selectOrder = virtualCart.filter((item) => item.isSelected === true);
    const orders = selectOrder.map((cart) => {
      const itemWithProduct = cart as VirtualCartType & { productCode?: string; productName?: string };
      // Find the product for this cart item to get product_id
      const product = availableProducts.find((p) => p.product_code === itemWithProduct.productCode);
      return {
        name: cart.name,
        color: cart.color,
        size: cart.size,
        quantity: cart.quantity,
        weight: cart.weight,
        price: cart.price,
        product_id: product?._id || product?.product_code || "", // Use product _id as product_id
      };
    });

    const totals = {
      totalPayment: 0,
      totalQuantity: 0,
      totalWeight: 0,
      promotions: {
        shipTags: "none" as "none" | "freeship",
        discount: 0,
      },
    };

    selectOrder.forEach((item) => {
      totals.totalQuantity += item.quantity;
      totals.totalWeight += item.quantity * item.weight;
      totals.totalPayment += item.quantity * item.price;
    });
    if (totals.totalQuantity === 1) {
      totals.totalPayment = totals.totalPayment + DiscountOption.freeShip.value;
      totals.promotions.shipTags = "none";
    }
    if (totals.totalQuantity >= 2) {
      totals.totalPayment = totals.totalPayment - discountValue;
      totals.promotions.shipTags = "freeship";
      totals.promotions.discount = discountValue;
    }
    if (whatBox === "new-form") {
      setNewOrder((prev) => {
        return {
          ...prev,
          orderInfo: [...orders],
          total: totals.totalPayment,
          totalProduct: totals.totalQuantity,
          totalWeight: totals.totalWeight,
          promotions: totals.promotions,
        };
      });
    }
    if (whatBox === "edit-form") {
      setEditing((prev) => {
        return { ...prev, orderInfo: [...orders], total: totals.totalPayment, totalProduct: totals.totalQuantity, totalWeight: totals.totalWeight };
      });
    }
    setShowListProduct(false);
  };
  const handleDiscountChange = (value: number) => {
    setDiscountValue(value);

    const selectOrder = virtualCart.filter((item) => item.isSelected);

    const totals = selectOrder.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.totalWeight += item.quantity * item.weight;
        acc.totalPayment += item.quantity * item.price;
        return acc;
      },
      { totalPayment: 0, totalQuantity: 0, totalWeight: 0 }
    );

    // const discount = value > totals.totalPayment ? totals.totalPayment : value;
    if (value > 50000) {
      return console.log("Dont discount a lot");
    }

    setNewOrder((prev) => ({
      ...prev,
      total: totals.totalPayment - value,
      promotions: {
        shipTags: prev.promotions.shipTags,
        discount: value,
      },
    }));
  };

  // -- Helper function --//

  const handleUploadOrderExcel = async (file: File) => {
    if (!selectedBranch?._id) {
      warningToast(t("shopOrders.selectBranchBeforeUpload", "🚨 Vui lòng chọn chi nhánh trước khi upload đơn hàng."));
      return;
    }

    // For Excel uploads, assume they are from customers (isFromCustomer = true)
    // You can add a checkbox in the UI to let users choose if needed
    const result = await uploadOrdersExcel(file, selectedBranch._id, true);
    if (result.status === "success") {
      successToast(t("shopOrders.uploadOrdersSuccess", "✅ Cập nhật {{count}} đơn thành công", { count: result.count }));
      // Refresh orders
      await fetchOrders(selectedBranch.company_id, selectedBranch._id);
    }
    setShowUploadExcel(false);
  };

  const [copied, setCopied] = useState(false);
  const [copyIndex, setCopyIndex] = useState<number | null>(null);
  const handleCopyOrderCode = async (orderCode: string, i: number) => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setCopied(true);
      setCopyIndex(i);
      setTimeout(() => setCopied(false), 2000); // hide after 2s
      console.log("Text copied to clipboard:", orderCode);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleDeleteOrder = async (orderCode: string) => {
    const orderRootData = syncedDataOrders.find((item: OrderDataFromServerType) => item.orderCode === orderCode);
    const idOrder = orderRootData?._id;
    if (!idOrder) {
      errorToast(t("shopOrders.orderNotFound", "Không tìm thấy đơn có mã đơn này."));
      return;
    }
    let userChoice = confirm(t("shopOrders.confirmDelete", "Bạn chắc chắn muốn xóa?"));

    if (!userChoice) return;
    const res = await deleteOrder(idOrder);
    if (res?.status === "success") {
      successToast(t("shopOrders.deleteSuccess", "Delete success!"));
    } else {
      errorToast(t("shopOrders.deleteFailed", "Delete failed!"));
    }
  };

  const [arrayDelete, setArrayDelete] = useState<string[]>([]);
  const handleSelectManyOrder = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const isChecked = e.target.checked;
    if (isChecked) {
      setArrayDelete((prev) => {
        return [...prev, value];
      });
    } else {
      const newArrayDelete = arrayDelete.filter((item: string) => item !== value);
      setArrayDelete([...newArrayDelete]);
    }
    console.log("arraydelete", arrayDelete);
  };
  const DeleteAllSelectOrder = async () => {
    if (arrayDelete.length > 0) {
      let userConfirmed = confirm(t("shopOrders.confirmDeleteMultiple", "Are you sure you want to delete {{count}} orders?", { count: arrayDelete.length }));

      if (userConfirmed) {
        const res = await deleteManyOrder(arrayDelete);
        if (res && res.status === "success") {
          setArrayDelete([]);
          setStatusMsg(t("shopOrders.deleteSuccess", "✅ Delete success!"));
          setShowNotification(true);
        } else {
          setStatusMsg(t("shopOrders.deleteFailed", "❌ Delete failed"));
        }
        console.log("User clicked OK.");
      } else {
        console.log("User clicked Cancel.");
      }
    }
  };

  const handleTest = () => {
    successToast(t("shopOrders.deleteSuccess", "Delete success!"), undefined, 100000);
  };
  return (
    <div className={cx("landing-orders-main")}>
      {showNotification && <NotificationBox_v2 message={statusMsg} onClose={() => setShowNotification(false)} />}
      <div className={cx("header")}>
        <div className={cx("header-left")}>
          <div className={cx("header-tabs")}>
            <div className="">
              <Search
                value={searchOrderCode}
                onChange={setSearchOrderCode as any}
                onSearch={undefined}
                placeholder={t("shopOrders.searchPlaceholder", "Nhập mã đơn shop hoặc nhập mã đơn nhà vận chuyển")}
                debounceMs={300}
                className="w-[400px]"
              />
            </div>
            {/* Product Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500, width: "fit-content" }}>{t("shopOrders.filterByProduct", "Lọc theo sản phẩm")}:</div>
              <div style={{ minWidth: 250 }}>
                {/* <CustomSelectGlobal options={orderProductCodes_KeyFilter} onChange={(id) => setSelectedProductCode(id)} isUseBorder={true} /> */}
                <SelectGray options={orderProductCodes_KeyFilter} onChange={(id) => setSelectedProductCode(id)} value={selectedProductCode} />
              </div>
            </div>
          </div>
        </div>
        <div className={cx("header-right")}>
          <div className={cx("header-actions")}>
            {/* <ButtonCommon onClick={() => handleTest()}>Test</ButtonCommon> */}
            <GradientButton variant="orange" onClick={() => setCreateNewOrderBox(true)} className="flex gap-2 items-center group">
              {" "}
              {<icons.bag_add size={16} className="group-hover:scale-[1.2]" />} {t("shopOrders.createNewOrder", "Tạo đơn mới")}
            </GradientButton>
            <GradientButton variant="orange" onClick={() => setOpenUpdateDeliveryBox(true)}>
              {t("shopOrders.bulkUpdateDelivery", "Cập nhật vận chuyển hàng loạt")}
            </GradientButton>
            {staffRole === "Director" && (
              <ButtonCommon variant="delete" onClick={() => DeleteAllSelectOrder()}>
                {t("shopOrders.deleteAllSelected", "Delete all select order")}
              </ButtonCommon>
            )}
            <ButtonCommon
              className="bg-gradient-to-tr from-orange-400 via-orange-500 to-red-500 text-white"
              onClick={() => setShowUploadExcel(true)}
              variant="default"
              icon={icons.upload}
              iconClass="mr-2 w-4 h-4"
            >
              {t("shopOrders.uploadExcel", "Tải excel")}
            </ButtonCommon>{" "}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <ClaimMorningButton staffID={staffID} userId={userId} />
              <StaffRedistributeButton staffID={staffID} userId={userId} />
            </div>
          </div>
        </div>
      </div>
      <div className={cx("header2")}>
        <div className={cx("header-left")}>
          <div className={cx("header-tabs")}>
            <div className={cx("filter-decor")}>
              <FcFilledFilter size={24} />
              <CustomSelectGlobal
                options={filterOptions}
                placeholder={t("shopOrders.selectFilter", "-- Chọn lọc --")}
                onChange={(key) => {
                  setSortBy(key as SortOrder);
                  console.log("1");
                }}
              />
            </div>
            <div className={cx("filters")}>
              <div className={cx("filter-checkbox")}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes("All")}
                    onChange={() => {
                      toggleStatus("All");
                      setDeliveryStatuses("All");
                    }}
                  />
                  {t("shopOrders.all", "Tất cả")}
                </label>
                {STATUS_OPTIONS.map((status) => (
                  <label key={status}>
                    <input type="checkbox" checked={selectedStatuses.includes(status)} onChange={() => toggleStatus(status)} />
                    <span>{status} - </span>
                    <span style={{ color: "red", fontWeight: 600 }}>{statusCounts[status]}</span>
                    {status === "Chốt" && selectedStatuses.includes(status) && (
                      <select value={deliveryStatuses} onChange={(e) => setDeliveryStatuses(e.target.value)}>
                        <option value="All">{t("shopOrders.all", "Tất cả")}</option>
                        {DeliveryOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className={cx("header-right")}></div>
      </div>

      {/* // -- Table content */}
      <div className={cx("content")}>
        <div className={cx("table-scroll")}>
          <div className={cx("table-container")}>
            {/* <div className={cx("table-header")}></div> */}
            <div className={cx("table-body")}>
              <table className={cx("orders-table")}>
                <thead>
                  <tr>
                    <th>{t("shopOrders.box", "Box")}</th>
                    <th>{t("shopOrders.edit", "Sửa")}</th>
                    <th>{t("shopOrders.time", "Thời gian")}</th>
                    <th>{t("shopOrders.orderCode", "Mã đơn")}</th>
                    <th>{t("shopOrders.status", "Trạng thái")}</th>
                    <th>{t("shopOrders.customerName", "Tên khách hàng")}</th>
                    <th>{t("shopOrders.phone", "Số điện thoại")}</th>
                    <th>{t("shopOrders.address", "Địa chỉ")}</th>
                    <th>
                      <div>{t("shopOrders.productInfo", "Sản phẩm - Màu - Size - Số lượng")}</div>
                    </th>
                    <th>{t("shopOrders.totalAmount", "Tổng tiền")}</th>
                    <th>{t("shopOrders.delivery", "Vận chuyển")}</th>
                    <th>{t("shopOrders.note", "Ghi chú")}</th>
                    <th>{t("shopOrders.source", "Nguồn")}</th>
                    <th>{t("shopOrders.staff", "Nhân viên")}</th>
                  </tr>
                </thead>
                <tbody>
                  {finalData.map((o, i) => {
                    let statusClass = "";

                    if (o.status === "Chốt") statusClass = "status-done";
                    else if (o.status === "Chưa gọi điện") statusClass = "status-pending";
                    else if (o.status === "Gọi lần 1 ❌" || o.status === "Gọi lần 2 ❌" || o.status === "Gọi lần 3 ❌") statusClass = "status-retry";
                    else if (o.status === "Khách không mua") statusClass = "status-cancel";
                    else if (o.status === "Đơn mới") statusClass = "status-new-order";

                    let deliveryClass = "";
                    if (o.deliveryStatus === "Giao thành công") deliveryClass = "text-status-done";
                    else if (o.deliveryStatus === "Chưa gửi hàng") deliveryClass = "text-status-pending";
                    else if (o.deliveryStatus === "Giao thất bại") deliveryClass = "text-status-cancel";
                    else if (o.deliveryStatus === "Đang giao hàng") deliveryClass = "text-status-retry";
                    else if (o.deliveryStatus === "Đã gửi hàng") deliveryClass = "text-status-info";
                    else if (o.deliveryStatus === "Đang đóng hàng") deliveryClass = "text-status-packing";
                    return (
                      <tr key={`o.orderCode-${i}`} className={cx("row")}>
                        <td>
                          <input type="checkbox" value={o.orderCode} onChange={(e) => handleSelectManyOrder(e)} />
                        </td>
                        <td className={cx("group-action")}>
                          {o.deliveryStatus !== "Giao thành công" ? (
                            <React.Fragment>
                              <button
                                className={cx("edit-btn")}
                                onClick={() => {
                                  console.log("edit ", o);
                                  setEditing(o);
                                  // Find the original order data for this order
                                  const orderIndex = serverFinalOrderData.findIndex((ord: FinalOrder) => ord.orderCode === o.orderCode);
                                  if (
                                    orderIndex !== -1 &&
                                    serverOriginalOrderData[orderIndex] &&
                                    serverOriginalOrderData[orderIndex].orderInfo &&
                                    serverOriginalOrderData[orderIndex].orderInfo.length > 0
                                  ) {
                                    setOriginOrder(serverOriginalOrderData[orderIndex]);
                                  } else {
                                    // Set empty origin order if it doesn't exist
                                    setOriginOrder(null);
                                  }

                                  // Find all unique products used in this order using product_id
                                  const orderItems = o.orderInfo || [];
                                  const uniqueProductIds = new Set<string>();
                                  const productToOrderItemsMap = new Map<string, typeof orderItems>(); // Map product_id to its order items
                                  const fullOrderData = syncedDataOrders.find((ord: OrderDataFromServerType) => ord.final.orderCode === o.orderCode);
                                  const productCodeFromOrder = fullOrderData?.product_code;

                                  // Group order items by product_id
                                  orderItems.forEach((item) => {
                                    if (item.product_id) {
                                      uniqueProductIds.add(item.product_id);
                                      if (!productToOrderItemsMap.has(item.product_id)) {
                                        productToOrderItemsMap.set(item.product_id, []);
                                      }
                                      productToOrderItemsMap.get(item.product_id)?.push(item);
                                    }
                                  });

                                  // Find products by product_id (try _id first, then product_code as fallback)
                                  const editingProducts: ProductType[] = [];
                                  uniqueProductIds.forEach((productId) => {
                                    // Try to find by _id first
                                    let product = availableProducts.find((p) => p._id === productId);
                                    // If not found, try to find by product_code (in case product_id stores product_code)
                                    if (!product) {
                                      product = availableProducts.find((p) => p.product_code === productId);
                                    }
                                    if (product) {
                                      editingProducts.push(product);
                                    }
                                  });

                                  // If no products found by product_id, fallback to primary product
                                  if (editingProducts.length === 0 && productCodeFromOrder) {
                                    const primaryProduct = availableProducts.find((p) => p.product_code === productCodeFromOrder);
                                    if (primaryProduct) {
                                      editingProducts.push(primaryProduct);
                                      // Add primary product to map if it doesn't exist
                                      if (!productToOrderItemsMap.has(primaryProduct._id) && !productToOrderItemsMap.has(primaryProduct.product_code)) {
                                        productToOrderItemsMap.set(primaryProduct._id, orderItems);
                                      }
                                    }
                                  }

                                  // Set selected products
                                  if (editingProducts.length > 0) {
                                    setEditingSelectedProducts(editingProducts);
                                  } else {
                                    // Final fallback: use first available product
                                    setEditingSelectedProducts([availableProducts[0]].filter(Boolean));
                                  }

                                  // Build virtual cart from all selected products with quantities from order
                                  const productCart: (VirtualCartType & { productCode?: string; productName?: string })[] = [];
                                  const finalEditingProducts = editingProducts.length > 0 ? editingProducts : [availableProducts[0]].filter(Boolean);

                                  finalEditingProducts.forEach((product) => {
                                    if (product?.productDetailed) {
                                      // Get order items for this specific product (try both _id and product_code)
                                      const productOrderItems =
                                        productToOrderItemsMap.get(product._id) || productToOrderItemsMap.get(product.product_code) || [];

                                      product.productDetailed.forEach((p: ProductDetailsType) => {
                                        // Find matching order item by product_id, color and size
                                        const orderItem = productOrderItems.find((oi) => {
                                          // Match by product_id first (most reliable)
                                          const matchesProduct = oi.product_id === product._id || oi.product_id === product.product_code;
                                          const matchesColor = oi.color === p.color;
                                          const matchesSize = oi.size === p.size;
                                          return matchesProduct && matchesColor && matchesSize;
                                        });

                                        productCart.push({
                                          ...p,
                                          quantity: orderItem?.quantity || 0,
                                          isSelected: !!orderItem && orderItem.quantity > 0,
                                          productCode: product.product_code,
                                          productName: product.name,
                                        } as VirtualCartType & { productCode?: string; productName?: string });
                                      });
                                    }
                                  });

                                  setVirtualCart(productCart.length > 0 ? productCart : []);

                                  setCurrentEditIndex(i);
                                  setShowEditingBox(true);
                                  setDiscountValue(o.promotions.discount || 0);
                                }}
                              >
                                {/* ✏️ */}
                                <MdModeEditOutline size={22} color="#1175e7" />
                              </button>
                              {staffRole === "Director" && (
                                <button onClick={() => handleDeleteOrder(o.orderCode)}>
                                  <MdDelete color="red" size={22} style={{ marginLeft: 10 }} />
                                </button>
                              )}
                            </React.Fragment>
                          ) : (
                            <div>
                              <img src={dollarIcon} alt="Đã gửi hàng" style={{ width: "28px", verticalAlign: "middle", marginLeft: 0 }} />
                            </div>
                          )}
                        </td>
                        <td>{ConvertTime(o.time)}</td>
                        <td style={{ position: "relative" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {o.orderCode} <IoIosCopy style={{ cursor: "pointer" }} onClick={() => handleCopyOrderCode(o.orderCode, i)} />
                            {copied && copyIndex === i && (
                              <span className={cx("copied-text")} key={`copy-${i}`}>
                                {t("shopOrders.copied", "Đã sao chép")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={cx(statusClass)}>{o.status}</td>
                        <td className={cx(statusClass)}>{o.customerName}</td>
                        <td className={cx(statusClass)}>{formatPhone(o.phone)}</td>
                        <td>{o.address}</td>
                        <td className={cx("order-info-cell")}>
                          {o.orderInfo.map((item, idx) => (
                            <div key={idx} className={cx("order-item")}>
                              {item.name} - {item.color} - {item.size} - x<span style={{ fontSize: 18, fontWeight: 550 }}>{item.quantity}</span>
                            </div>
                          ))}
                        </td>
                        <td>{o.total.toLocaleString()}₫</td>
                        <td className={cx(deliveryClass)} style={{ verticalAlign: "middle" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {o.deliveryStatus}
                            {o.deliveryStatus === "Đang giao hàng" && (
                              <img src={deliveryTruck} alt="Đang giao" style={{ width: "35px", verticalAlign: "middle" }} />
                            )}
                            {o.deliveryStatus === "Giao thành công" && <img src={atm} alt="Đã giao" style={{ width: "25px", verticalAlign: "middle" }} />}
                            {o.deliveryStatus === "Giao thất bại" && (
                              <img src={dislike} alt="Giao thất bại" style={{ width: "30px", verticalAlign: "middle" }} />
                            )}
                            {o.deliveryStatus === "Chưa gửi hàng" && <img src={hourglass} alt="Chưa gửi" style={{ width: "28px", verticalAlign: "middle" }} />}
                            {o.deliveryStatus === "Đang đóng hàng" && (
                              <img src={conveyorBelt} alt="Đang đóng hàng" style={{ width: "28px", verticalAlign: "middle", marginLeft: 3 }} />
                            )}
                            {o.deliveryStatus === "Khách chưa chốt" && (
                              <img src={phone} alt="Khách chưa chốt" style={{ width: "28px", verticalAlign: "middle", marginLeft: 3 }} />
                            )}
                            {o.deliveryStatus === "Đang hết hàng" && (
                              <img src={outOfStock} alt="Đang hết hàng" style={{ width: "28px", verticalAlign: "middle", marginLeft: 3 }} />
                            )}
                            {o.deliveryStatus === "Đã gửi hàng" && (
                              <img src={courier} alt="Đã gửi hàng" style={{ width: "28px", verticalAlign: "middle", marginLeft: 3 }} />
                            )}
                          </div>
                        </td>
                        <td>{o.note}</td>
                        <td>{o.website}</td>
                        <td>{o.staff_name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {finalData.length === 0 && (
                <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
                  {selectedProductCode === "all"
                    ? t("shopOrders.noOrdersInBranch", "Không có đơn hàng nào trong chi nhánh này")
                    : t("shopOrders.noOrdersForProduct", "Không có đơn hàng nào cho sản phẩm {{productCode}}", {
                        productCode: orderProductCodes.find((c) => c === selectedProductCode) || selectedProductCode,
                      })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* //--Edit Modal */}
      {showEditingBox && editing && (
        <div className={cx("fullfilment-bg")}>
          <div className={cx("modal-overlay")}>
            {/* Show original Data - only show if originOrder exists and has data */}
            {originOrder && originOrder.orderInfo && originOrder.orderInfo.length > 0 && (
              <div className={cx("modal-original")}>
                <h2>{t("shopOrders.originalInfo", "Thông tin gốc")}</h2>
                <div className={cx("form")}>
                  <div className={cx("group-item")}>
                    <label>
                      {t("shopOrders.customerName", "Tên khách hàng")}:
                      <input disabled value={originOrder.customerName || ""} />
                    </label>
                    <label>
                      {t("shopOrders.phone", "Số điện thoại")}:
                      <input disabled value={originOrder.phone ? formatPhone(originOrder.phone) : ""} />
                    </label>
                  </div>

                  <label>
                    {t("shopOrders.address", "Địa chỉ")}:
                    <input disabled value={originOrder.address || ""} />
                  </label>
                  {/* Order Info (array of products) */}
                  <div className={cx("order-info-edit")}>
                    <h3>{t("shopOrders.productInfo", "Thông tin sản phẩm")}</h3>
                    <div className={cx("order-item-row")}>
                      <div className={cx("input-1", "header-order")}>{t("shopOrders.productName", "Tên sản phẩm")}</div>
                      <div className={cx("input-2", "header-order")}>{t("shopOrders.color", "Màu")}</div>
                      <div className={cx("input-3", "header-order")}>{t("shopOrders.size", "Size")}</div>
                      <div className={cx("input-4", "header-order")}>{t("shopOrders.quantity", "Số lượng")}</div>
                      <div className={cx("input-5", "header-order")}>{t("shopOrders.price", "Giá")}</div>
                    </div>
                    {originOrder.orderInfo && originOrder.orderInfo.length > 0 ? (
                      originOrder.orderInfo.map((item, index) => {
                        return (
                          <div key={index} className={cx("order-item-row")}>
                            <div className={cx("input-1")}>{item.name}</div>
                            <div className={cx("input-2")}>
                              <span className={cx("color-identification")} style={{ backgroundColor: COLORS[item.color?.toLowerCase()] || "#ccc" }} />
                              {item.color}
                            </div>
                            <div className={cx("input-3")}>{item.size}</div>
                            <div className={cx("input-4")}>{item.quantity}</div>
                            <div className={cx("input-5")}>{item.price.toLocaleString("vi-VN")}₫</div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
                        {t("shopOrders.noOriginalProductInfo", "Không có thông tin sản phẩm gốc")}
                      </div>
                    )}
                  </div>
                  <div className={cx("btn-total-add")}>
                    <div></div>
                    <label style={{ fontWeight: "550", fontSize: "17px", textAlign: "right", color: "#ff0958" }}>
                      {t("shopOrders.totalAmount", "Tổng tiền")} {`( ${originOrder.totalProduct || 0} ${t("shopOrders.products", "sản phẩm")})`}:&nbsp;{" "}
                      {Number(originOrder.total || 0).toLocaleString()} ₫
                    </label>
                  </div>
                  <div className={cx("group-item")}>
                    <label>
                      {t("shopOrders.note", "Ghi chú")}:
                      <input disabled value={originOrder.note || ""} />
                    </label>
                    <label>
                      {t("shopOrders.source", "Nguồn")}:
                      <input
                        value={originOrder.website || ""}
                        onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                        placeholder={t("shopOrders.sourcePlaceholder", "link website hoặc link facebook khách...")}
                        disabled
                      />
                    </label>
                  </div>
                  <div className={cx("group-item")}>
                    <label>
                      {t("shopOrders.staff", "Nhân viên")}:
                      <input disabled value={originOrder.staff_name || ""} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Show Final Data */}
            <div className={cx("modal")}>
              <h2>
                {t("shopOrders.editOrder", "Sửa đơn hàng")}: {editing.orderCode}
              </h2>

              <div className={cx("form")}>
                <div style={{ fontSize: 16, fontWeight: 550, marginTop: 15 }}>1. {t("shopOrders.customerInfo", "Thông tin khách hàng")}</div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.customerName", "Tên khách hàng")}:
                    <input value={editing.customerName} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} />
                  </label>
                  <label>
                    {t("shopOrders.phone", "Số điện thoại")}:
                    <input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} disabled />
                  </label>
                </div>

                <div className={cx("address-edit-group")}>
                  <label>
                    <div style={{ marginBottom: 10 }}>
                      {t("shopOrders.address", "Địa chỉ")}: <span style={{ fontSize: 14, fontWeight: 500, color: "#e94343" }}>{editing.address}</span>
                    </div>
                    <input
                      value={correctedAddress === null ? editing.address : correctedAddress}
                      onChange={(e) => setCorrectedAddress(e.target.value)}
                      placeholder={t("shopOrders.addressPlaceholder", "Số nhà, tên đường hoặc tên tòa nhà...")}
                    />
                  </label>
                  <VnAddressSelect_Old onChange={(addr) => handleAddressChange_Old("edit-form", addr)} />
                </div>

                {/* Order Info (array of products) */}
                <div className={cx("order-info-edit")}>
                  <div style={{ display: "flex", gap: 20, marginBottom: 10, marginTop: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 550, display: "flex", alignItems: "center" }}>
                      2. {t("shopOrders.productInfo", "Thông tin sản phẩm")}
                    </div>
                    <ButtonCommon
                      className="bg-gradient-to-tr from-orange-400 via-orange-500 to-red-500 text-white group [&>span]:transition-transform group-hover:[&>span]:scale-[1.2]"
                      icon={icons.cart_add}
                      iconClass="w-5 h-5"
                      onClick={() => setShowListProduct(true)}
                      isTextHover={true}
                    >
                      {t("shopOrders.addProduct", "Thêm sản phẩm")}
                    </ButtonCommon>
                  </div>
                  <div className={cx("order-item-row")}>
                    <div className={cx("input-1", "header-order")}>{t("shopOrders.productName", "Tên sản phẩm")}</div>
                    <div className={cx("input-2", "header-order")}>{t("shopOrders.color", "Màu")}</div>
                    <div className={cx("input-3", "header-order")}>{t("shopOrders.size", "Size")}</div>
                    <div className={cx("input-4", "header-order")}>{t("shopOrders.quantity", "Số lượng")}</div>
                    <div className={cx("input-5", "header-order")}>{t("shopOrders.pricePerItem", "Giá 1 SP")}</div>
                  </div>
                  {editing.orderInfo.map((item, index) => {
                    return (
                      <div key={index} className={cx("order-item-row")}>
                        <div className={cx("input-1")}>{item.name}</div>
                        <div className={cx("input-2")}>
                          <span className={cx("color-identification")} style={{ backgroundColor: COLORS[item.color.toLowerCase()] }} />
                          {item.color}
                        </div>
                        <div className={cx("input-3")}>{item.size}</div>
                        <div className={cx("input-4")}>{item.quantity}</div>
                        <div className={cx("input-5")}>{item.price.toLocaleString("vi-VN")}₫</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>3. {t("shopOrders.shippingFee", "Phí vận chuyển")}:</div>
                  {editing.totalProduct >= 2 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "space-between", flex: 1 }}>
                      <div>
                        <FreeShipAnimate text="" />
                      </div>
                      <div>
                        <span style={{ marginTop: 5 }}>0₫</span>
                      </div>
                    </div>
                  )}
                  {editing.totalProduct === 1 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "flex-end", flex: 1 }}>
                      <div style={{ verticalAlign: "middle" }}>
                        <span style={{ marginTop: 5 }}>+{Number(30000).toLocaleString("vi-VN")}₫</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>4. {t("shopOrders.promotion", "Ưu đãi")}:</div>

                  {editing.totalProduct >= 2 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "space-between", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Coupon text="" valueText="" />
                        <input
                          type="number"
                          style={{ marginTop: 0 }}
                          placeholder={t("shopOrders.maxDiscount", "Tối đa 50.000đ")}
                          value={discountValue}
                          onChange={(e) => handleDiscountChange(+e.target.value)}
                        />
                      </div>
                      <div>-{discountValue.toLocaleString("vi-VN")}₫</div>
                    </div>
                  )}
                </div>
                {discountValue > 50000 && <div style={{ color: "red" }}>{t("shopOrders.discountLimit", "Giảm giá không quá 50.000đ")}</div>}
                <div className={cx("btn-total-add")}>
                  <label style={{ fontWeight: "550", fontSize: "17px", textAlign: "right", color: "#ff0958" }}>
                    {t("shopOrders.totalAmount", "Tổng tiền")} {`( ${editing.totalProduct} ${t("shopOrders.products", "sản phẩm")})`}:&nbsp;{" "}
                    {Number(editing.total).toLocaleString()} ₫
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.status", "Trạng thái")}:
                    <select
                      value={editing.status}
                      onChange={(e) => {
                        setEditing({ ...editing, status: e.target.value });
                        console.log("value", e.target.value);
                      }}
                    >
                      <option value="">{t("shopOrders.selectStatus", "-- Chọn trạng thái --")}</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t("shopOrders.delivery", "Vận chuyển")}:
                    <select value={editing.deliveryStatus} onChange={(e) => setEditing({ ...editing, deliveryStatus: e.target.value })}>
                      {staffRole !== "Director" &&
                        DeliveryOptionsForStaffSelectManual.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      {staffRole === "Director" &&
                        DeliveryOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.note", "Ghi chú")}:
                    <input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
                  </label>
                  <label>
                    {t("shopOrders.staff", "Nhân viên")}:
                    <select value={editing.staff_name} onChange={(e) => setEditing({ ...editing, staff_name: e.target.value })}>
                      {/* <option value="Không">Không tên</option> */}
                      {staffName.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.source", "Nguồn")}:
                    <input
                      value={editing.website}
                      onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                      placeholder={t("shopOrders.sourcePlaceholder2", "link website hoặc tên shop...")}
                    />
                  </label>
                  <label>
                    {t("shopOrders.customerFacebook", "Facebook khách")}:
                    <input
                      value={editing.facebookLink || ""}
                      onChange={(e) => setEditing({ ...editing, facebookLink: e.target.value })}
                      placeholder={t("shopOrders.facebookPlaceholder", "link facebook khách...")}
                    />
                  </label>
                </div>
              </div>

              <div className={cx("modal-actions")}>
                <button
                  onClick={() => {
                    // Reset all editing state
                    setEditing({ ...defaultNewOrder });
                    setCorrectedAddress(null);
                    setVirtualCart([]);
                    setEditingSelectedProducts([]);
                    setShowListProduct(false);
                    setFilterColorInAddProduct("None");
                    setShowEditingBox(false);
                    setDiscountValue(0);
                    setCurrentEditIndex(null);
                    setOriginOrder(null);
                  }}
                >
                  {t("shopOrders.cancel", "Hủy")}
                </button>
                <button onClick={handleSave}>{t("shopOrders.save", "Lưu")}</button>
              </div>
            </div>
            {showListProduct && editingSelectedProducts.length > 0 && (
              <div className={cx("show-list-product")}>
                {/* Product Selection for Edit - Multiple products with checkboxes */}
                <div style={{ fontSize: 16, fontWeight: 550, marginBottom: 10, marginTop: 10 }}>
                  1. {t("shopOrders.selectProductsMultiple", "Chọn sản phẩm (có thể chọn nhiều)")}
                </div>
                <div className={cx("group-products")} style={{ flexDirection: "column", alignItems: "flex-start", marginBottom: 15 }}>
                  {availableProducts.map((product) => {
                    const isSelected = editingSelectedProducts.some((p) => p.product_code === product.product_code);
                    return (
                      <div key={product._id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          style={{ width: 18, height: 18 }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelected = [...editingSelectedProducts, product];
                              setEditingSelectedProducts(newSelected);
                              // Add product's items to virtual cart (only if not already present)
                              if (product?.productDetailed) {
                                const existingProductCodes = new Set(virtualCart.map((item) => (item as any).productCode));
                                if (!existingProductCodes.has(product.product_code)) {
                                  const newItems = product.productDetailed.map((p: ProductDetailsType) => ({
                                    ...p,
                                    quantity: 0,
                                    isSelected: false,
                                    productCode: product.product_code,
                                    productName: product.name,
                                  })) as (VirtualCartType & { productCode?: string; productName?: string })[];
                                  setVirtualCart([...virtualCart, ...newItems]);
                                }
                              }
                            } else {
                              setEditingSelectedProducts(editingSelectedProducts.filter((p) => p.product_code !== product.product_code));
                              // Remove items from virtual cart and editing.orderInfo for this product
                              const filteredCart = virtualCart.filter((item) => (item as any).productCode !== product.product_code);
                              setVirtualCart(filteredCart);
                              setEditing({
                                ...editing,
                                orderInfo: editing.orderInfo.filter((item) => {
                                  return item.product_id !== product._id && item.product_id !== product.product_code;
                                }),
                              });
                            }
                          }}
                        />
                        <div style={{ fontSize: 16, color: "var(--orange-primary)", fontWeight: 550 }}>
                          {product.product_code} - {product.name}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontSize: 16, fontWeight: 550, marginBottom: 10, marginTop: 10 }}>
                  2. {t("shopOrders.selectProductsByColorSize", "Chọn sản phẩm theo màu, size")}
                </div>
                <div className={cx("filter-color-container")}>
                  <div style={{ fontWeight: 550 }}>{t("shopOrders.filterByColor", "Lọc theo màu")}:</div>
                  <div className={cx("wrap-checkbox")}>
                    {(() => {
                      // Get all unique colors from selected products
                      const selectedProducts = showEditingBox ? editingSelectedProducts : selectedProductsForOrder;
                      const allColors = new Set<string>();
                      selectedProducts.forEach((product) => {
                        product?.colorAvailable?.forEach((color) => allColors.add(color));
                      });
                      return Array.from(allColors).map((color, k) => {
                        const isChecked = filterColorInAddProduct === color;
                        return (
                          <div key={k}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (isChecked) {
                                  setFilterColorInAddProduct("None");
                                } else {
                                  setFilterColorInAddProduct(color);
                                }
                              }}
                            />
                            <span>{color}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                <div className={cx("row")}>
                  <div>{t("shopOrders.select", "Chọn")}</div>
                  <div>{t("shopOrders.product", "Sản phẩm")}</div>
                  <div>{t("shopOrders.name", "Tên")}</div>
                  <div>{t("shopOrders.color", "Màu")}</div>
                  <div>{t("shopOrders.size", "Size")}</div>
                  <div>{t("shopOrders.price", "Giá")}</div>
                  <div>{t("shopOrders.stock", "Kho")}</div>
                  <div>{t("shopOrders.quantity", "Số lượng")}</div>
                </div>
                {virtualCart.map((p, i) => {
                  const itemWithProduct = p as VirtualCartType & { productCode?: string; productName?: string };
                  return (
                    <React.Fragment key={i}>
                      {isExceedStock === i && (
                        <div className={cx("warning")}>
                          ⚠️ {t("shopOrders.exceedStock", "Số lượng vượt quá tồn kho")} ({p.stock})
                        </div>
                      )}
                      {filterColorInAddProduct === "None" || p.color === filterColorInAddProduct ? (
                        <div className={cx("row")}>
                          <div>
                            <input
                              checked={p.isSelected}
                              type="checkbox"
                              style={{ cursor: "pointer", width: 18, height: 18, borderRadius: 9 }}
                              onChange={(e) => handleCartChange(e.target.checked, i)}
                            />
                          </div>
                          <div style={{ fontSize: 12, color: "#666" }}>{itemWithProduct.productCode || ""}</div>
                          <div style={{ fontWeight: 550 }}>{p.name}</div>
                          <div className={cx("column-3")}>
                            <span className={cx("color-identification")} style={{ backgroundColor: COLORS[p.color?.toLowerCase()] || "#ccc" }} />
                            {p.color}
                          </div>
                          <div>{p.size}</div>
                          <div>{p.price.toLocaleString("vi-VN")} đ</div>
                          <div>{p.stock}</div>
                          <div className={cx("choose-quantity")}>
                            <div onClick={() => handleNumberProduct("decrease", i)} className={cx("decrease")}>
                              <HiMinusSmall color="black" />
                            </div>
                            <div className={cx("vertical-line")}>|</div>
                            <div style={{ color: "black", fontSize: "18px" }} className={cx("quantity-number")}>
                              {p.quantity}
                            </div>
                            <div className={cx("vertical-line")}>|</div>
                            <div onClick={() => handleNumberProduct("increase", i)} className={cx("increase")}>
                              <HiPlusSmall color="black" />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </React.Fragment>
                  );
                })}

                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button className={cx("btn-decor", "btn-close")} onClick={() => handleCloseAddProduct("edit-form")}>
                    {t("shopOrders.close", "Đóng")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* //--Update multiple delivery status order */}
      {openUpdateDeliveryBox && (
        <div className={cx("update-delivery-box")}>
          <h4>{t("shopOrders.updateAllConfirmedOrders", "Cập nhật tất cả đơn đã chốt - Chưa giao hàng")}</h4>
          <div>
            {t("shopOrders.confirmedNotShipped", "Đã chốt - Chưa gửi hàng")}:{" "}
            <span style={{ color: "red", fontWeight: 600 }}>{DeliveryStatusCountsResult["Đã chốt"]}</span>
          </div>
          <div>
            <label style={{ marginRight: 10 }}>{t("shopOrders.newDeliveryStatus", "Trạng thái vận chuyển mới")}:</label>
            <select value={selectedDeliveryStatusForUpdate} onChange={(e) => setSelectedDeliveryStatusForUpdate(e.target.value)}>
              {DeliveryOptionsForStaffSelectManual.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 10 }}>
            {t("shopOrders.updateNote", 'Lưu ý: Chỉ cập nhật những đơn có trạng thái vận chuyển là "Chưa gửi hàng"')}
          </div>
          <div>
            <button className={cx("cancel")} onClick={() => setOpenUpdateDeliveryBox(false)}>
              {t("shopOrders.close", "Đóng")}
            </button>
            <button className={cx("update")} onClick={() => UpdateMultipleDeliveryStatus(selectedDeliveryStatusForUpdate)}>
              {t("shopOrders.update", "Cập nhật")}
            </button>
          </div>
        </div>
      )}

      {/* //-- Create new order */}
      {createNewOrderBox && newOrder && (
        <div className={cx("fullfilment-bg")}>
          <div className={cx("modal-overlay")}>
            <div className={cx("modal")}>
              <div style={{ fontSize: 20, fontWeight: 600, margin: "10px 0px", color: "#026feb" }}>{t("shopOrders.createNewOrder", "Tạo đơn hàng mới")}</div>
              <div className={cx("form")}>
                <div style={{ fontSize: 16, fontWeight: 550, marginTop: 15 }}>1. {t("shopOrders.customerInfo", "Thông tin khách hàng")}</div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.customerName", "Tên khách hàng")}:
                    <input value={newOrder.customerName} onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })} />
                  </label>
                  <label>
                    {t("shopOrders.phone", "Số điện thoại")}:
                    <input value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })} />
                  </label>
                </div>

                <div className={cx("address-edit-group")}>
                  <label>
                    <div style={{ marginBottom: 10 }}>
                      {t("shopOrders.address", "Địa chỉ")}: <span style={{ fontSize: 14, fontWeight: 500, color: "#e94343" }}>{newOrder.address}</span>
                    </div>
                    <input
                      value={correctedAddress === null ? newOrder.address : correctedAddress}
                      onChange={(e) => setCorrectedAddress(e.target.value)}
                      placeholder={t("shopOrders.addressPlaceholder", "Số nhà, tên đường hoặc tên tòa nhà...")}
                    />
                  </label>
                  <div className="w-full">
                    <VnAddressSelect_Old onChange={(addr) => handleAddressChange_Old("new-form", addr)} />
                  </div>
                </div>
                {/* Order Info (array of products) */}
                <div className={cx("order-info-edit")}>
                  <div style={{ display: "flex", gap: 20, marginBottom: 10, marginTop: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 550, display: "flex", alignItems: "center" }}>
                      2. {t("shopOrders.productInfo", "Thông tin sản phẩm")}
                    </div>
                    <ButtonCommon
                      className="bg-gradient-to-tr from-orange-400 via-orange-500 to-red-500 text-white"
                      icon={icons.cart_add}
                      iconClass="w-5 h-5"
                      onClick={() => setShowListProduct(true)}
                      isTextHover={true}
                    >
                      {t("shopOrders.addProduct", "Thêm sản phẩm")}
                    </ButtonCommon>
                  </div>
                  <div className={cx("order-item-row")}>
                    <div className={cx("input-1", "header-order")}>{t("shopOrders.productName", "Tên sản phẩm")}</div>
                    <div className={cx("input-2", "header-order")}>{t("shopOrders.color", "Màu")}</div>
                    <div className={cx("input-3", "header-order")}>{t("shopOrders.size", "Size")}</div>
                    <div className={cx("input-4", "header-order")}>{t("shopOrders.quantity", "Số lượng")}</div>
                    <div className={cx("input-5", "header-order")}>{t("shopOrders.pricePerItem", "Gía 1 SP")}</div>
                  </div>
                  {newOrder.orderInfo.map((item, index) => {
                    return (
                      <div key={index} className={cx("order-item-row")}>
                        <div className={cx("input-1")}>{item.name}</div>
                        <div className={cx("input-2")}>
                          <span className={cx("color-identification")} style={{ backgroundColor: COLORS[item.color.toLowerCase()] }} />
                          {item.color}
                        </div>
                        <div className={cx("input-3")}>{item.size}</div>
                        <div className={cx("input-4")}>{item.quantity}</div>
                        <div className={cx("input-5")}>{item.price.toLocaleString("vi-VN")}₫</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>3. {t("shopOrders.shippingFee", "Phí vận chuyển")}:</div>
                  {newOrder.totalProduct >= 2 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "space-between", flex: 1 }}>
                      <div>
                        <FreeShipAnimate text="" />
                      </div>
                      <div>
                        <span style={{ marginTop: 5 }}>0₫</span>
                      </div>
                    </div>
                  )}
                  {newOrder.totalProduct === 1 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "flex-end", flex: 1 }}>
                      <div style={{ verticalAlign: "middle" }}>
                        <span style={{ marginTop: 5 }}>+{Number(30000).toLocaleString("vi-VN")}₫</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>4. {t("shopOrders.promotion", "Ưu đãi")}:</div>

                  {newOrder.totalProduct >= 2 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "space-between", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Coupon text="" valueText="" />
                        <input
                          type="number"
                          style={{ marginTop: 0 }}
                          placeholder={t("shopOrders.maxDiscount", "Tối đa 50.000đ")}
                          value={discountValue}
                          onChange={(e) => handleDiscountChange(+e.target.value)}
                        />
                      </div>
                      <div>-{discountValue.toLocaleString("vi-VN")}₫</div>
                    </div>
                  )}
                </div>
                {discountValue > 50000 && <div style={{ color: "red" }}>{t("shopOrders.discountLimit", "Giảm giá không quá 50.000đ")}</div>}
                <div className={cx("btn-total-add")}>
                  <label style={{ fontWeight: "550", fontSize: "17px", textAlign: "right", color: "#ff0958" }}>
                    {t("shopOrders.totalAmount", "Tổng tiền")} {`( ${newOrder.totalProduct} ${t("shopOrders.products", "sản phẩm")})`}:&nbsp;{" "}
                    {Number(newOrder.total).toLocaleString()} ₫
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.note", "Ghi chú")}:
                    <input value={newOrder.note} onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })} />
                  </label>
                  <label>
                    {t("shopOrders.delivery", "Vận chuyển")}:
                    <select value={newOrder.deliveryStatus} onChange={(e) => setNewOrder({ ...newOrder, deliveryStatus: e.target.value })}>
                      {staffRole !== "Director" &&
                        DeliveryOptionsForStaffSelectManual.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      {staffRole === "Director" &&
                        DeliveryOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.status", "Trạng thái")}:
                    <select value={newOrder.status} onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t("shopOrders.staff", "Nhân viên")}:
                    <select
                      disabled={true}
                      value={yourStaffProfileInWorkplace?.staffInfo.name || t("shopOrders.noName", "Không có tên")}
                      onChange={(e) => setNewOrder({ ...newOrder, staff_name: e.target.value })}
                    >
                      <option>{yourStaffProfileInWorkplace?.staffInfo.name || t("shopOrders.noName", "Không có tên")}</option>
                    </select>
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    {t("shopOrders.source", "Nguồn")}:
                    <input
                      value={newOrder.website}
                      onChange={(e) => setNewOrder({ ...newOrder, website: e.target.value })}
                      placeholder={t("shopOrders.sourcePlaceholder2", "link website hoặc tên shop...")}
                    />
                  </label>
                  <label>
                    {t("shopOrders.customerFacebook", "Facebook khách")}:
                    <input
                      value={newOrder.facebookLink || ""}
                      onChange={(e) => setNewOrder({ ...newOrder, facebookLink: e.target.value })}
                      placeholder={t("shopOrders.facebookPlaceholder", "link facebook khách...")}
                    />
                  </label>
                </div>
              </div>
              <div className={cx("modal-actions")}>
                <button
                  onClick={() => {
                    // Reset all create order state
                    setCreateNewOrderBox(false);
                    setCorrectedAddress(null);
                    setVirtualCart([]);
                    setSelectedProductsForOrder([]);
                    setNewOrder({ ...defaultNewOrder });
                    setDiscountValue(0);
                    setShowListProduct(false);
                    setFilterColorInAddProduct("None");
                  }}
                >
                  {t("shopOrders.close", "Đóng")}
                </button>
                <button
                  onClick={handleCreateNewOrder}
                  disabled={discountValue > 50000 ? true : false}
                  style={{ cursor: discountValue > 50000 ? "not-allowed" : "pointer" }}
                >
                  {t("shopOrders.createOrder", "Tạo đơn")}
                </button>
              </div>
            </div>
            {showListProduct && (
              <div className={cx("show-list-product")}>
                {/* <h4>Chọn sản phẩm theo màu size</h4> */}

                {/* Product Selection for Create - Multiple products with checkboxes */}
                <div style={{ fontSize: 16, fontWeight: 550, marginBottom: 10, marginTop: 10 }}>
                  1. {t("shopOrders.selectProductsMultiple", "Chọn sản phẩm (có thể chọn nhiều)")}
                </div>
                <div className={cx("group-products")}>
                  {availableProducts.map((product) => {
                    const isSelected = selectedProductsForOrder.some((p) => p.product_code === product.product_code);
                    return (
                      <div key={product._id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          style={{ width: 18, height: 18 }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newSelected = [...selectedProductsForOrder, product];
                              setSelectedProductsForOrder(newSelected);
                              // Virtual cart will be updated by useEffect when selectedProductsForOrder changes
                            } else {
                              setSelectedProductsForOrder(selectedProductsForOrder.filter((p) => p.product_code !== product.product_code));
                              // Remove items from newOrder.orderInfo for this product
                              setNewOrder({
                                ...newOrder,
                                orderInfo: newOrder.orderInfo.filter((item) => {
                                  return item.product_id !== product._id && item.product_id !== product.product_code;
                                }),
                              });
                              // Virtual cart will be updated by useEffect when selectedProductsForOrder changes
                            }
                          }}
                        />
                        <div style={{ fontSize: 16, color: "var(--orange-primary)", fontWeight: 550 }}>
                          {product.product_code} - {product.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 16, fontWeight: 550, marginBottom: 10, marginTop: 10 }}>
                  2. {t("shopOrders.selectProductsByColorSize", "Chọn sản phẩm theo màu size")}
                </div>

                <div className={cx("filter-color-container")}>
                  <div style={{ fontWeight: 550 }}>{t("shopOrders.filterByColor", "Lọc theo màu")}:</div>
                  <div className={cx("wrap-checkbox")}>
                    {(() => {
                      // Get all unique colors from selected products
                      const selectedProducts = showEditingBox ? editingSelectedProducts : selectedProductsForOrder;
                      const allColors = new Set<string>();
                      selectedProducts.forEach((product) => {
                        product?.colorAvailable?.forEach((color) => allColors.add(color));
                      });
                      return Array.from(allColors).map((color, k) => {
                        const isChecked = filterColorInAddProduct === color;
                        return (
                          <div key={k}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (isChecked) {
                                  setFilterColorInAddProduct("None");
                                } else {
                                  setFilterColorInAddProduct(color);
                                }
                              }}
                            />
                            <span>{color}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                <div className={cx("row")}>
                  <div>{t("shopOrders.select", "Chọn")}</div>
                  <div>{t("shopOrders.name", "Tên")}</div>
                  <div>{t("shopOrders.productCode", "Mã sản phẩm")}</div>

                  <div>{t("shopOrders.color", "Màu")}</div>
                  <div>{t("shopOrders.size", "Size")}</div>
                  <div>{t("shopOrders.price", "Giá")}</div>
                  <div>{t("shopOrders.stock", "Kho")}</div>
                  <div>{t("shopOrders.quantity", "Số lượng")}</div>
                </div>

                {virtualCart.map((p, i) => {
                  const itemWithProduct = p as VirtualCartType & { productCode?: string; productName?: string };
                  return (
                    <React.Fragment key={i}>
                      {isExceedStock === i && (
                        <div className={cx("warning")}>
                          ⚠️ {t("shopOrders.exceedStock", "Số lượng vượt quá tồn kho")} ({p.stock})
                        </div>
                      )}
                      {filterColorInAddProduct === "None" || p.color === filterColorInAddProduct ? (
                        <div className={cx("row")}>
                          <div>
                            <input
                              checked={p.isSelected}
                              type="checkbox"
                              style={{ cursor: "pointer", width: 18, height: 18, borderRadius: 9 }}
                              onChange={(e) => handleCartChange(e.target.checked, i)}
                            />
                          </div>
                          <div style={{ fontWeight: 550 }}>{p.name}</div>
                          <div style={{ fontSize: 16, color: "#666" }}>{itemWithProduct.productCode || ""}</div>

                          <div className={cx("column-3")}>
                            <span className={cx("color-identification")} style={{ backgroundColor: COLORS[p.color?.toLowerCase()] || "#ccc" }} />
                            {p.color}
                          </div>
                          <div>{p.size}</div>
                          <div>{p.price.toLocaleString("vi-VN")} đ</div>
                          <div>{p.stock}</div>
                          <div className={cx("choose-quantity")}>
                            <div onClick={() => handleNumberProduct("decrease", i)} className={cx("decrease")}>
                              <HiMinusSmall color="black" />
                            </div>
                            <div className={cx("vertical-line")}>|</div>
                            <div style={{ color: "black", fontSize: "18px" }} className={cx("quantity-number")}>
                              {p.quantity}
                            </div>
                            <div className={cx("vertical-line")}>|</div>
                            <div onClick={() => handleNumberProduct("increase", i)} className={cx("increase")}>
                              <HiPlusSmall color="black" />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </React.Fragment>
                  );
                })}

                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button className={cx("btn-decor", "btn-close")} onClick={() => handleCloseAddProduct("new-form")}>
                    {t("shopOrders.close", "Đóng")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* //-- Upload excel */}
      {showUploadExcel && <UploadBox onClose={() => setShowUploadExcel(false)} onUpload={handleUploadOrderExcel} />}

      <div className={cx("footer")}></div>
    </div>
  );
}

export function sortOrders(data: FinalOrder[], sortBy: SortOrder): FinalOrder[] {
  return [...data].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();

    if (sortBy === "latest") {
      return timeB - timeA; // newest first
    } else {
      return timeA - timeB; // oldest first
    }
  });
}
export function formatPhone(phone: string): string {
  if (!phone) return phone;
  // Remove all non-digit characters just in case
  const digits = phone.replace(/\D/g, "");

  // Format: 4 digits . 3 digits . 3 digits
  return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1.$2.$3");
}
function convertToNumber(value: string) {
  // remove all non-digits (and also the dot used as thousands separator)
  let cleaned = value.replace(/[^\d]/g, "");
  return Number(cleaned);
}

// console.log(convertToNumber("179.000 đ")); // 👉 179000
// console.log(convertToNumber("200,500 VND")); // 👉 200500
// console.log(convertToNumber("99.999"));      // 👉 99999

function getLocalTime() {
  const now = new Date();
  const utcYear = now.getUTCFullYear();
  const utcMonth = String(now.getUTCMonth() + 1).padStart(2, "0");
  const utcDay = String(now.getUTCDate()).padStart(2, "0");
  const utcHour = String(now.getUTCHours()).padStart(2, "0");
  const utcMinute = String(now.getUTCMinutes()).padStart(2, "0");

  const result = `${utcYear}-${utcMonth}-${utcDay} ${utcHour}:${utcMinute}`;
  console.log(result);
  return result.toString();
}

//-- Convert time to "23:29 08-11"
function ConvertTime(timeString: string) {
  // const inputString = "2025-11-08 23:29";

  // Regex Explanation:
  // (\d{4})-(\d{2})-(\d{2})  -> Matches and captures Year (Group 1), Month (Group 2), Day (Group 3)
  // \s                     -> Matches the space
  // (\d{2}):(\d{2})        -> Matches and captures Hours (Group 4), Minutes (Group 5)
  // Replacement string uses $n to refer to the capture groups: $4:$5 $3-$2
  const outputString = timeString.replace(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})/, "$4:$5 $3-$2");

  // console.log(outputString); // Output: "23:29 08-11"
  return outputString;
}

const COLORS: Record<string, string> = {
  đen: "#000000",
  trắng: "#FFFFFF",
  "xanh dương": "#007BFF", // xanh dương (blue) – adjust if you mean "green"
  đỏ: "#FF0000",
  "xanh lá cây": "#02a51d",
  vàng: "#FFD700",
  hồng: "#FFC0CB",
  tím: "#800080",
  cam: "#FFA500",
  nâu: "#8B4513",
  xám: "#808080",
  be: "#F5F5DC",
  "xanh nõn chuối": "#a7e9b2",
};

const STATUS_OPTIONS = [
  // "Chưa gọi điện",
  "Đơn mới",
  "Gọi lần 1 ❌", // ✖
  "Gọi lần 2 ❌",
  "Gọi lần 3 ❌",
  "Không mua",
  "Sale hủy",
  "Sai số",
  "Chốt",
];

// For delivery status, you should add the update time for each status change. ❌
const DeliveryOptions = [
  "Chưa gửi hàng",
  "Đang đóng hàng",
  "Đã gửi hàng",
  "Đang giao hàng",
  "Giao thành công",
  "Giao thất bại",
  "Khách chưa chốt",
  "Đang hết hàng",
  "Mất hàng",
  "Đã nhận hoàn",
];
const DiscountOption = {
  freeShip: {
    value: 30000,
  },
  discount: {
    value: 20000,
  },
};
const DeliveryOptionsForStaffSelectManual = ["Chưa gửi hàng", "Đang đóng hàng", "Đã gửi hàng", "Đang hết hàng"];

const filterOptions = [
  {
    name: "Đơn mới nhất",
    key: "latest",
  },
  {
    name: "Đơn cũ nhất",
    key: "oldest",
  },
];
export type SortOrder = "latest" | "oldest";
