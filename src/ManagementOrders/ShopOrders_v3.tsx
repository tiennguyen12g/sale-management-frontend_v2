import React, { useEffect, useState, useMemo, type Dispatch, type SetStateAction, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./ShopOrders_v3.module.scss";
const cx = classNames.bind(styles);

// Icons
import { MdDelete } from "react-icons/md";
import { IoIosCopy } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import deliveryTruck from "./icons/delivery-truck.gif";
import atm from "./icons/atm.gif";
import dislike from "./icons/dislike.gif";
import hourglass from "./icons/hourglass.gif";
import conveyorBelt from "./icons/conveyor-belt.gif";
import phone from "./icons/phone.gif";
import outOfStock from "./icons/sold.png";
import courier from "./icons/courier.gif";
import dollarIcon from "./icons/dollar.gif";
import { HiMinusSmall } from "react-icons/hi2";
import { HiPlusSmall } from "react-icons/hi2";
import { GiDividedSquare } from "react-icons/gi";
import { HiSearch } from "react-icons/hi";
import { FcFilledFilter } from "react-icons/fc";
import { LuSquareMenu } from "react-icons/lu";
import { FaCircle } from "react-icons/fa";
import { IoIosArrowDropleft } from "react-icons/io";
import { IoIosArrowDropright } from "react-icons/io";
import { MdInsertChart } from "react-icons/md";
import { CgDesktop } from "react-icons/cg";

// Hooks and type
import { useAuthStore } from "../zustand/authStore";
import { useBranchStore } from "../zustand/branchStore";
import { useStaffStore, type StaffRole } from "../zustand/staffStore";
import { useShopOrderStore, type OrderDataFromServerType, type OriginalOrder, type FinalOrder } from "../zustand/shopOrderStore";
import { type ProductType, type ProductDetailsType } from "../zustand/productStore";

// Components

import CreateExcel_v2 from "./CreateExcel_v2";
import VnAddressSelect_Old from "../ultilitis/VnAddress/VnAddressOld";
import UploadExcelBox from "../ultilitis/UploadExcelBox";
import StaffNotification from "../StaffPage/utilities/StaffNotification";
import { StaffRedistributeButton } from "../Pages/BodyComponent/Financial/Staff/RedistributeOrder";
import { ClaimMorningButton } from "./ClaimOrderMorning";
import NotificationBox_v2 from "../ultilitis/NotificationBox_v2";
import FreeShipAnimate from "./PromotionTags/FreeShipAnimate";
import Coupon from "./PromotionTags/Coupon";
import { HiPhoneMissedCall } from "react-icons/hi";

// Ultilitys
import CustomSelectGlobal from "../ultilitis/CustomSelectGlobal";

type VirtualCartType = ProductDetailsType & { quantity: number; isSelected: boolean };

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
const STATUS_OPTIONS2 = [
  // "Chưa gọi điện",
  "Đơn mới",
  "Không gọi được lần 1",
  "Không gọi được lần 2",
  "Không gọi được lần 3",
  "Khách không mua",
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
    key: "newest",
  },
  {
    name: "Đơn cũ nhất",
    key: "oldest",
  },
];
export type SortOrder = "latest" | "oldest";

interface ShopOrdersProps {
  productDetail: ProductType;
  dataOrders: OrderDataFromServerType[];
  setGetFinalData: Dispatch<SetStateAction<FinalOrder[]>>;
}

const iconSize = 20;
export default function ShopOrders_v3({ productDetail, dataOrders, setGetFinalData }: ShopOrdersProps) {
  const { updateOrder, deleteOrder, addOrder, updateMultipleOrders, uploadOrdersExcel, deleteManyOrder, fetchOrders } = useShopOrderStore();
  const { yourStaffProfileInWorkplace } = useStaffStore();
  console.log('yourStaffProfileInWorkplace', yourStaffProfileInWorkplace);
  const { yourStaffId, userInfo } = useAuthStore();
  const { selectedBranch } = useBranchStore();
  const [showNotification, setShowNotification] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [staffName, setStaffName] = useState<string[]>([yourStaffProfileInWorkplace?.staffInfo.name || "Không"]);
  const [staffID, setStaffID] = useState(yourStaffId || "none");
  const [userId, setUserId] = useState("none");
  const staffRole: StaffRole | "none" = yourStaffProfileInWorkplace?.role || "none";
  // const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [activeTable, setActiveTable] = useState("personal-ads-acc");

  let serverOriginalOrderData: OriginalOrder[] = [];
  let serverFinalOrderData: FinalOrder[] = [];
  dataOrders.forEach((item) => {
    // Only push original if it exists (orders from customers)
    if (item.original) {
      serverOriginalOrderData.push(item.original);
    } else {
      // For staff-created orders, use final as original for display purposes
      serverOriginalOrderData.push({
        ...item.final,
        staff_name: item.final.staff_name,
      } as OriginalOrder);
    }
    serverFinalOrderData.push(item.final);
  });

  const productCode = productDetail.product_code;
  const [viewMode, setViewMode] = useState<"table" | "excel">("table");
  const [orders, setOrders] = useState<FinalOrder[]>(serverFinalOrderData);
  const [originOrder, setOriginOrder] = useState<OriginalOrder | null>(null);
  const [isFinalDataChange, setIsFinalDataChange] = useState(false);

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
  const [defaultNewOrder, setDefaultNewOrder] = useState<FinalOrder>({
    orderCode: "default",
    time: localFormatted,
    customerName: "",
    phone: "",
    address: "",
    orderInfo: [], //{ product: "", color: "", size: "", quantity: 1, price: 0 }
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
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    setDefaultNewOrder((prev) => {
      return { ...prev, staff_name: staffName[0] };
    });
    setNewOrder((prev) => {
      return { ...prev, staff_name: staffName[0] };
    });
  }, [staffName]);
  const [newOrder, setNewOrder] = useState<FinalOrder>({ ...defaultNewOrder });
  const [editing, setEditing] = useState<FinalOrder>({ ...defaultNewOrder });
  const [showEditingBox, setShowEditingBox] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [hasEditing, setHasEditting] = useState(false);
  const defaultVirtualCart = useMemo(() => {
    return (
      productDetail?.productDetailed?.map((p: ProductDetailsType) => ({
        ...p,
        quantity: 0,
        isSelected: false,
      })) ?? []
    );
  }, [productDetail]);

  // ✅ virtualCart can be changed by user
  const [virtualCart, setVirtualCart] = useState<VirtualCartType[]>(defaultVirtualCart);

  const [filterColorInAddProduct, setFilterColorInAddProduct] = useState("None");
  const [isExceedStock, setIsExceedStock] = useState<number | null>(null);
  const [searchOrderCode, setSearchOrderCode] = useState<string | null>(null);
  const [showUploadExcel, setShowUploadExcel] = useState(false);

  // --- CRITICAL: sync local orders state when incoming prop changes ---
  useEffect(() => {
    // update local orders to match incoming dataOrders for this product
    setOrders(serverFinalOrderData);

    // reset UI/editing state when product changes
    setOriginOrder(null);
    setEditing({ ...defaultNewOrder });
    setShowListProduct(false);
    setCorrectedAddress(null);
    setVirtualCart(defaultVirtualCart);
    setShowEditingBox(false);
  }, [dataOrders, productDetail, defaultVirtualCart]); // re-run when data/orders or product change

  const sortedOrdersByTime = sortOrders(orders, sortBy);
  const handleSave = async () => {
    if (!editing) return;
    if (currentEditIndex === null) return;
    const orderCode = editing.orderCode;
    const dataOrder = dataOrders.find((data) => data.orderCode === orderCode);
    console.log("dataOrder", dataOrder);
    if (!dataOrder) return console.log("Cannot find root data of the order");
    const combineEditOrder: OrderDataFromServerType = {
      ...dataOrder,
      final: editing,
    };

    console.log("editing", combineEditOrder);
    const res = await updateOrder(dataOrder._id, combineEditOrder);
    setDiscountValue(0);
    if (res?.status === "success") {
      setEditing({ ...defaultNewOrder });
      setCurrentEditIndex(null);
      alert("Cập nhật thành công");
      setShowEditingBox(false);
    } else {
      console.log("Editing failed");
      alert("Sửa đơn bị lỗi, không thành công.");
    }
  };

  // handle checkbox change
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

  // filter orders
  const filteredOrders = selectedStatuses.includes("All")
    ? sortedOrdersByTime
    : sortedOrdersByTime.filter((o) => selectedStatuses.some((s) => s.trim().toLowerCase() === o.status.trim().toLowerCase()));

  // Filter for "Chốt" status
  const filteredConfirmedOrders = deliveryStatuses === "All" ? filteredOrders : filteredOrders.filter((o) => o.deliveryStatus === deliveryStatuses);

  // Step 2: filter by search text
  // const finalData = !searchOrderCode
  //   ? filteredConfirmedOrders
  //   : filteredConfirmedOrders.filter(
  //       (o) =>
  //         o.orderCode.toLowerCase().includes(searchOrderCode.toLowerCase()) ||
  //         (o.deliveryCode && o.deliveryCode.toLowerCase().includes(searchOrderCode.toLowerCase()))
  //     );
  const finalData = useMemo(() => {
    if (!searchOrderCode) return filteredConfirmedOrders;
    const q = searchOrderCode.toLowerCase();
    return filteredConfirmedOrders.filter((o) => o.orderCode.toLowerCase().includes(q) || (o.deliveryCode && o.deliveryCode.toLowerCase().includes(q)));
  }, [searchOrderCode, filteredConfirmedOrders]);

  // keep previous ref for shallow comparison
  const prevRef = useRef<typeof finalData | null>(null);

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
        if (prev[i] !== finalData[i] && (prev[i].orderCode || prev[i].orderCode) !== (finalData[i].orderCode || finalData[i].orderCode)) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      setGetFinalData(finalData);
      prevRef.current = finalData;
    }
  }, [finalData, setGetFinalData]);

  const handleFilterByOwnerId = (codeText: string) => {
    if (!codeText) return filteredConfirmedOrders;

    const lowerText = codeText.trim().toLowerCase();

    return filteredConfirmedOrders.filter(
      (o) => o.orderCode.toLowerCase().includes(lowerText) || (o.deliveryCode && o.deliveryCode.toLowerCase().includes(lowerText)) // in case you also want to match deliveryCode
    );
  };

  const handleSearchChange = (searchText: string) => {
    setSearchOrderCode(searchText || null);
  };

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

  const UpdateMultipleDeliveryStatus = async (newStatus: string) => {
    if (DeliveryStatusCountsResult["Đã chốt"] === 0) {
      alert("Không có đơn hàng nào để cập nhật. Vui lòng kiểm tra lại.");
      return;
    }
    if (newStatus === "Chưa gửi hàng") {
      alert("Vui lòng chọn trạng thái vận chuyển hợp lệ để cập nhật.");
      return;
    }

    const idsToUpdate = dataOrders
      .filter(
        (o) =>
          (o.final.status === "Chốt" && o.final.deliveryStatus === "Chưa gửi hàng") ||
          o.final.deliveryStatus === "Đang đóng hàng" ||
          o.final.deliveryStatus === "Đã gửi hàng"
      )
      .map((o) => o._id);

    if (idsToUpdate.length === 0) return;

    const res = await updateMultipleOrders(idsToUpdate, { deliveryStatus: newStatus });
    if (res?.status === "success") {
      alert("✅ Cập nhật trạng chuyển thành công");
    } else {
      alert("🚨 Cập nhật lỗi.");
    }
  };

  const handleCreateNewOrder = async () => {
    if (!newOrder) return;
    console.log("new", newOrder);

    if (!selectedBranch?._id) {
      alert("🚨 Vui lòng chọn chi nhánh trước khi tạo đơn hàng.");
      return;
    }

    if (!newOrder.customerName || !newOrder.phone || !newOrder.address || newOrder.orderInfo.length === 0 || newOrder.total <= 0) {
      alert("🚨 Vui lòng điền đầy đủ thông tin.");
      return;
    }

    const localFormatted = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16).replace("T", " ");
    const newFinalForSend = {
      branch_id: selectedBranch._id,
      product_code: productCode,
      staffID: staffID,
      isFromCustomer: false, // Orders created by staff don't need original
      ...newOrder,
      staff_name: newOrder.staff_name || staffName[0],
      time: localFormatted,
      company_id_own_product: selectedBranch.company_id,
    };
    const res = await addOrder(newFinalForSend);

    if (res?.status === "success") {
      alert(" ✅ Tạo đơn hàng thành công!");
      // Refresh orders
      await fetchOrders(selectedBranch._id);
    } else {
      alert(" 🚨 Tạo đơn hàng lỗi.");
    }

    setNewOrder({ ...defaultNewOrder });
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
      return {
        name: cart.name,
        color: cart.color,
        size: cart.size,
        quantity: cart.quantity,
        weight: cart.weight,
        price: cart.price,
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

  const handleUploadOrderExcel = async (file: File) => {
    if (!selectedBranch?._id) {
      alert("🚨 Vui lòng chọn chi nhánh trước khi upload đơn hàng.");
      return;
    }

    // For Excel uploads, assume they are from customers (isFromCustomer = true)
    // You can add a checkbox in the UI to let users choose if needed
    const result = await uploadOrdersExcel(file, selectedBranch._id, true);
    if (result.status === "success") {
      alert(`✅ Cập nhật ${result.count} đơn thành công`);
      // Refresh orders
      await fetchOrders(selectedBranch._id);
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
    const orderRootData = dataOrders.find((item) => item.orderCode === orderCode);
    const idOrder = orderRootData?._id;
    if (!idOrder) return alert(`Không tìm thấy đơn có mã đơn này.`);
    let userChoice = confirm("Bạn chắc chắn muốn xóa?");

    if (!userChoice) return;
    const res = await deleteOrder(idOrder);
    if (res?.status === "success") {
      alert("Delete success!");
    } else {
      alert("Detele failed!");
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
      const newArrayDelete = arrayDelete.filter((item) => item !== value);
      setArrayDelete([...newArrayDelete]);
    }
    console.log("arraydelete", arrayDelete);
  };
  const DeleteAllSelectOrder = async () => {
    if (arrayDelete.length > 0) {
      let userConfirmed = confirm(`Are you sure you want to delete ${arrayDelete.length} orders?`);

      if (userConfirmed) {
        const res = await deleteManyOrder(arrayDelete);
        if (res && res.status === "success") {
          setArrayDelete([]);
          setStatusMsg("✅ Delete success!");
          setShowNotification(true);
        } else {
          setStatusMsg("❌ Delete failed");
        }
        console.log("User clicked OK.");
      } else {
        console.log("User clicked Cancel.");
      }
    }
  };

  return (
    <div className={cx("landing-orders-main")}>
      {showNotification && <NotificationBox_v2 message={statusMsg} onClose={() => setShowNotification(false)} />}
      <div className={cx("header")}>
        <div className={cx("header-left")}>
          <div className={cx("header-tabs")}>
            <div className={cx("search-decor")}>
              <HiSearch size={20} />
              <input
                type="text"
                placeholder="Nhập mã đơn shop hoặc nhập mã đơn nhà vận chuyển"
                className={cx("input-search")}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={cx("header-right")}>
          <div className={cx("header-actions")}>
            <button className={cx("btn-decor")} onClick={() => setCreateNewOrderBox(true)}>
              Tạo đơn hàng mới
            </button>
            <button className={cx("btn-decor")} onClick={() => setOpenUpdateDeliveryBox(true)}>
              Cập nhật vận chuyển hàng loạt
            </button>
            {staffRole === "Director" && (
              <button className={cx("btn-decor")} onClick={() => DeleteAllSelectOrder()}>
                Delete all select order
              </button>
            )}
            <button className={cx("btn-decor")} onClick={() => setShowUploadExcel(true)}>
              Tải excel
            </button>{" "}
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
                placeholder="-- Chọn lọc --"
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
                  Tất cả
                </label>
                {STATUS_OPTIONS.map((status) => (
                  <label key={status}>
                    <input type="checkbox" checked={selectedStatuses.includes(status)} onChange={() => toggleStatus(status)} />
                    <span>{status} - </span>
                    <span style={{ color: "red", fontWeight: 600 }}>{statusCounts[status]}</span>
                    {status === "Chốt" && selectedStatuses.includes(status) && (
                      <select value={deliveryStatuses} onChange={(e) => setDeliveryStatuses(e.target.value)}>
                        <option value="All">Tất cả</option>
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

      <div className={cx("content")}>
        <div className={cx("table-scroll")}>
          <div className={cx("table-container")}>
            <div className={cx("table-header")}></div>
            <div className={cx("table-body")}>
              <table className={cx("orders-table")}>
                <thead>
                  <tr>
                    <th>Box</th>
                    <th>Thời gian</th>
                    <th>Mã đơn</th>
                    <th>Trạng thái</th>
                    <th>Tên khách hàng</th>
                    <th>Số điện thoại</th>
                    <th>Địa chỉ</th>
                    <th>
                      <div>Sản phẩm - Màu - Size - Số lượng</div>
                    </th>
                    <th>Tổng tiền</th>

                    <th>Vận chuyển</th>
                    <th>Sửa</th>
                    <th>Ghi chú</th>
                    <th>Nguồn</th>
                    <th>Nhân viên</th>
                  </tr>
                </thead>
                <tbody>
                  {finalData.map((o, i) => {
                    let statusClass = "";

                    if (o.status === "Chốt") statusClass = "status-done";
                    else if (o.status === "Chưa gọi điện") statusClass = "status-pending";
                    else if (o.status === "Gọi lần 1" || o.status === "Gọi lần 2" || o.status === "Gọi lần 3") statusClass = "status-retry";
                    else if (o.status === "Khách không mua") statusClass = "status-cancel";
                    else if (o.status === "Đơn mới") statusClass = "status-new-order";

                    let deliveryClass = "";
                    if (o.deliveryStatus === "Giao thành công") deliveryClass = "text-status-done";
                    else if (o.deliveryStatus === "Chưa gửi hàng") deliveryClass = "text-status-pending";
                    else if (o.deliveryStatus === "Giao thất bại") deliveryClass = "text-status-cancel";
                    else if (o.deliveryStatus === "Đang giao hàng") deliveryClass = "text-status-retry";
                    else if (o.deliveryStatus === "Đã gửi hàng") deliveryClass = "text-status-info";
                    else if (o.deliveryStatus === "Đang đóng hàng") deliveryClass = "text-status-packing";
                    console.log('o.time', o.time);
                    return (
                      <tr key={`o.orderCode-${i}`} className={cx("row")}>
                        <td>
                          <input type="checkbox" value={o.orderCode} onChange={(e) => handleSelectManyOrder(e)} />
                        </td>
                        <td>{ConvertTime(o.time)}</td>
                        {/* <td>{o.orderCode} <IoIosCopy style={{cursor: "pointer"}} onClick={() => hanleCopyOrderCode(o.orderCode)}/></td> */}
                        <td style={{ position: "relative" }}>
                          {o.orderCode} <IoIosCopy style={{ cursor: "pointer" }} onClick={() => handleCopyOrderCode(o.orderCode, i)} />
                          {copied && copyIndex === i && (
                            <span className={cx("copied-text")} key={`copy-${i}`}>
                              Đã sao chép
                            </span>
                          )}
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

                        {/* <td>{o.confirmed ? "✅" : "❌"}</td> */}
                        <td className={cx(deliveryClass)} style={{ verticalAlign: "middle" }}>
                          {o.deliveryStatus}
                          {o.deliveryStatus === "Đang giao hàng" && (
                            <img src={deliveryTruck} alt="Đang giao" style={{ width: "35px", verticalAlign: "middle" }} />
                          )}
                          {o.deliveryStatus === "Giao thành công" && <img src={atm} alt="Đã giao" style={{ width: "25px", verticalAlign: "middle" }} />}
                          {o.deliveryStatus === "Giao thất bại" && <img src={dislike} alt="Giao thất bại" style={{ width: "30px", verticalAlign: "middle" }} />}
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
                        </td>

                        <td className={cx("group-action")}>
                          {o.deliveryStatus !== "Giao thành công" ? (
                            <React.Fragment>
                              <button
                                className={cx("edit-btn")}
                                onClick={() => {
                                  console.log("edit ", o);
                                  setEditing(o);
                                  setOriginOrder(serverOriginalOrderData[i]);
                                  const currentOrders = o.orderInfo;
                                  setVirtualCart(
                                    defaultVirtualCart.map((item) => {
                                      const sameProduct = currentOrders.find((order) => order.color === item.color && order.size === item.size);
                                      return sameProduct
                                        ? { ...item, isSelected: true, quantity: sameProduct.quantity }
                                        : { ...item, isSelected: false, quantity: 0 };
                                    })
                                  );

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
                        <td>{o.note}</td>
                        <td>{o.website}</td>
                        <td>{o.staff_name}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* {viewMode === "excel" && <CreateExcel_v2 orders={filteredOrders} />} */}
            </div>
          </div>
        </div>
      </div>

      {/* //--Edit Modal */}
      {showEditingBox && originOrder && editing && (
        <div className={cx("fullfilment-bg")}>
          <div className={cx("modal-overlay")}>
            {/* Show original Data */}
            <div className={cx("modal-original")}>
              <h2>Thông tin gốc</h2>
              <div className={cx("form")}>
                <div className={cx("group-item")}>
                  <label>
                    Tên khách hàng:
                    <input disabled value={originOrder.customerName} />
                  </label>
                  <label>
                    Số điện thoại:
                    <input disabled value={formatPhone(originOrder.phone)} />
                  </label>
                </div>

                <label>
                  Địa chỉ:
                  <input disabled value={originOrder.address} />
                </label>
                {/* Order Info (array of products) */}
                <div className={cx("order-info-edit")}>
                  <h3>Thông tin sản phẩm</h3>
                  <div className={cx("order-item-row")}>
                    <div className={cx("input-1", "header-order")}>Tên sản phẩm</div>
                    <div className={cx("input-2", "header-order")}>Màu</div>
                    <div className={cx("input-3", "header-order")}>Size</div>
                    <div className={cx("input-4", "header-order")}>Số lượng</div>
                    <div className={cx("input-5", "header-order")}>Giá</div>
                  </div>
                  {originOrder.orderInfo.map((item, index) => {
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
                <div className={cx("btn-total-add")}>
                  <div></div>
                  <label style={{ fontWeight: "550", fontSize: "17px", textAlign: "right", color: "#ff0958" }}>
                    Tổng tiền {`( ${originOrder.totalProduct} sản phẩm)`}:&nbsp; {Number(originOrder.total).toLocaleString()} ₫
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    Ghi chú:
                    <input disabled value={originOrder.note} />
                  </label>
                  <label>
                    Nguồn:
                    <input
                      value={originOrder.website}
                      onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                      placeholder="link website hoặc link facebook khách..."
                      disabled
                    />
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    Nhân viên:
                    <input disabled value={originOrder.staff_name} />
                  </label>
                </div>
              </div>
            </div>

            {/* Show Final Data */}
            <div className={cx("modal")}>
              <h2>Sửa đơn hàng: {editing.orderCode}</h2>

              <div className={cx("form")}>
                <div style={{ fontSize: 16, fontWeight: 550 }}>1. Thông tin khách hàng</div>
                <div className={cx("group-item")}>
                  <label>
                    Tên khách hàng:
                    <input value={editing.customerName} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} />
                  </label>
                  <label>
                    Số điện thoại:
                    <input value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} disabled />
                  </label>
                </div>

                <div className={cx("address-edit-group")}>
                  <label>
                    <div style={{ marginBottom: 10 }}>
                      Địa chỉ: <span style={{ fontSize: 14, fontWeight: 500, color: "#e94343" }}>{editing.address}</span>
                    </div>
                    <input
                      value={correctedAddress === null ? editing.address : correctedAddress}
                      onChange={(e) => setCorrectedAddress(e.target.value)}
                      placeholder="Số nhà, tên đường hoặc tên tòa nhà..."
                    />
                  </label>
                  <VnAddressSelect_Old onChange={(addr) => handleAddressChange_Old("edit-form", addr)} />
                </div>

                {/* Order Info (array of products) */}
                <div className={cx("order-info-edit")}>
                  <div style={{ display: "flex", gap: 20, marginBottom: 10, marginTop: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 550, display: "flex", alignItems: "center" }}>2. Thông tin sản phẩm</div>
                    <button type="button" className={cx("btn-decor")} onClick={() => setShowListProduct(true)}>
                      + Thêm sản phẩm
                    </button>
                  </div>
                  <div className={cx("order-item-row")}>
                    <div className={cx("input-1")} style={{ textDecoration: "underline" }}>
                      Tên sản phẩm
                    </div>
                    <div className={cx("input-2")} style={{ textDecoration: "underline" }}>
                      Màu
                    </div>
                    <div className={cx("input-3")} style={{ textDecoration: "underline" }}>
                      Size
                    </div>
                    <div className={cx("input-4")} style={{ textDecoration: "underline" }}>
                      Số lượng
                    </div>
                    <div className={cx("input-5")} style={{ textDecoration: "underline" }}>
                      Giá 1 SP
                    </div>
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
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>3. Phí vận chuyển:</div>
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
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>4. Ưu đãi:</div>

                  {editing.totalProduct >= 2 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "space-between", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Coupon text="" valueText="" />
                        <input
                          type="number"
                          style={{ marginTop: 0 }}
                          placeholder="Tối đa 50.000đ"
                          value={discountValue}
                          onChange={(e) => handleDiscountChange(+e.target.value)}
                        />
                      </div>
                      <div>-{discountValue.toLocaleString("vi-VN")}₫</div>
                    </div>
                  )}
                </div>
                {discountValue > 50000 && <div style={{ color: "red" }}>Giảm giá không quá 50.000đ</div>}
                <div className={cx("btn-total-add")}>
                  <div>
                    {/* <button type="button" onClick={() => setShowListProduct(true)}>
                          + Thêm sản phẩm
                        </button> */}
                  </div>
                  <label style={{ fontWeight: "550", fontSize: "17px", textAlign: "right", color: "#ff0958" }}>
                    Tổng tiền {`( ${editing.totalProduct} sản phẩm)`}:&nbsp; {Number(editing.total).toLocaleString()} ₫
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    Trạng thái:
                    <select
                      value={editing.status}
                      onChange={(e) => {
                        setEditing({ ...editing, status: e.target.value });
                        console.log("value", e.target.value);
                      }}
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Vận chuyển:
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
                    Ghi chú:
                    <input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
                  </label>
                  <label>
                    Nhân viên:
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
                    Nguồn:
                    <input
                      value={editing.website}
                      onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                      placeholder="link website hoặc tên shop..."
                    />
                  </label>
                  <label>
                    Facebook khách:
                    <input
                      value={editing.facebookLink || ""}
                      onChange={(e) => setEditing({ ...editing, facebookLink: e.target.value })}
                      placeholder="link facebook khách..."
                    />
                  </label>
                </div>
              </div>

              <div className={cx("modal-actions")}>
                <button
                  onClick={() => {
                    setEditing({ ...defaultNewOrder });
                    setCorrectedAddress(null);
                    setVirtualCart([...defaultVirtualCart]);
                    setShowListProduct(false);
                    setShowEditingBox(false);
                    setDiscountValue(0);
                  }}
                >
                  Hủy
                </button>
                <button onClick={handleSave}>Lưu</button>
              </div>
            </div>
            {showListProduct && (
              <div className={cx("show-list-product")}>
                <h4>Chọn sản phẩm theo màu, size</h4>
                <div className={cx("filter-color-container")}>
                  <div style={{ fontWeight: 550 }}>Lọc theo màu:</div>
                  <div className={cx("wrap-checkbox")}>
                    {productDetail.colorAvailable.map((color, k) => {
                      const isChecked = filterColorInAddProduct === color;
                      return (
                        <div key={k}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (isChecked) {
                                // ✅ if clicking again on the same box → reset to "None"
                                setFilterColorInAddProduct("None");
                              } else {
                                // ✅ else → select this color (unchecking others automatically)
                                setFilterColorInAddProduct(color);
                              }
                            }}
                          />
                          <span>{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={cx("row")}>
                  <div>Chọn</div>
                  <div>Tên</div>
                  <div>Màu</div>
                  <div>Size</div>
                  <div>Giá</div>
                  <div>Kho</div>
                  <div>Số lượng</div>
                </div>
                {virtualCart.map((p, i) => (
                  <React.Fragment key={i}>
                    {isExceedStock === i && <div className={cx("warning")}>⚠️ Số lượng vượt quá tồn kho ({p.stock})</div>}
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
                        <div className={cx("column-3")}>
                          <span className={cx("color-identification")} style={{ backgroundColor: COLORS[p.color.toLowerCase()] }} />
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
                ))}

                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button className={cx("btn-decor", "btn-close")} onClick={() => handleCloseAddProduct("edit-form")}>
                    Đóng
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
          <h4>Cập nhật tất cả đơn đã chốt - Chưa giao hàng</h4>
          <div>
            Đã chốt - Chưa gửi hàng: <span style={{ color: "red", fontWeight: 600 }}>{DeliveryStatusCountsResult["Đã chốt"]}</span>
          </div>
          <div>
            <label style={{ marginRight: 10 }}>Trạng thái vận chuyển mới:</label>
            <select value={selectedDeliveryStatusForUpdate} onChange={(e) => setSelectedDeliveryStatusForUpdate(e.target.value)}>
              {DeliveryOptionsForStaffSelectManual.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 10 }}>Lưu ý: Chỉ cập nhật những đơn có trạng thái vận chuyển là "Chưa gửi hàng"</div>
          <div>
            <button className={cx("cancel")} onClick={() => setOpenUpdateDeliveryBox(false)}>
              Đóng
            </button>
            <button className={cx("update")} onClick={() => UpdateMultipleDeliveryStatus(selectedDeliveryStatusForUpdate)}>
              Cập nhật
            </button>
          </div>
        </div>
      )}

      {/* //-- Create new order */}
      {createNewOrderBox && newOrder && (
        <div className={cx("fullfilment-bg")}>
          <div className={cx("modal-overlay")}>
            <div className={cx("modal")}>
              <div style={{ fontSize: 20, fontWeight: 600, margin: "10px 0px", color: "#026feb" }}>Tạo đơn hàng mới</div>
              <div className={cx("form")}>
                <div style={{ fontSize: 16, fontWeight: 550 }}>1. Thông tin khách hàng</div>
                <div className={cx("group-item")}>
                  <label>
                    Tên khách hàng:
                    <input value={newOrder.customerName} onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })} />
                  </label>
                  <label>
                    Số điện thoại:
                    <input value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })} />
                  </label>
                </div>

                <div className={cx("address-edit-group")}>
                  <label>
                    <div style={{ marginBottom: 10 }}>
                      Địa chỉ: <span style={{ fontSize: 14, fontWeight: 500, color: "#e94343" }}>{newOrder.address}</span>
                    </div>
                    <input
                      value={correctedAddress === null ? newOrder.address : correctedAddress}
                      onChange={(e) => setCorrectedAddress(e.target.value)}
                      placeholder="Số nhà, tên đường hoặc tên tòa nhà..."
                    />
                  </label>
                  <VnAddressSelect_Old onChange={(addr) => handleAddressChange_Old("new-form", addr)} />
                </div>
                {/* Order Info (array of products) */}
                <div className={cx("order-info-edit")}>
                  <div style={{ display: "flex", gap: 20, marginBottom: 10, marginTop: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 550, display: "flex", alignItems: "center" }}>2. Thông tin sản phẩm</div>
                    <button type="button" className={cx("btn-decor")} onClick={() => setShowListProduct(true)}>
                      + Thêm sản phẩm
                    </button>
                  </div>
                  <div className={cx("order-item-row")}>
                    <div className={cx("input-1")} style={{ textDecoration: "underline" }}>
                      Tên sản phẩm
                    </div>
                    <div className={cx("input-2")} style={{ textDecoration: "underline" }}>
                      Màu
                    </div>
                    <div className={cx("input-3")} style={{ textDecoration: "underline" }}>
                      Size
                    </div>
                    <div className={cx("input-4")} style={{ textDecoration: "underline" }}>
                      Số lượng
                    </div>
                    <div className={cx("input-5")} style={{ textDecoration: "underline" }}>
                      Gía 1 SP
                    </div>
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
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>3. Phí vận chuyển:</div>
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
                  <div style={{ fontSize: 16, fontWeight: 550, marginTop: 0 }}>4. Ưu đãi:</div>

                  {newOrder.totalProduct >= 2 && (
                    <div style={{ display: "flex", gap: 15, justifyContent: "space-between", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Coupon text="" valueText="" />
                        <input
                          type="number"
                          style={{ marginTop: 0 }}
                          placeholder="Tối đa 50.000đ"
                          value={discountValue}
                          onChange={(e) => handleDiscountChange(+e.target.value)}
                        />
                      </div>
                      <div>-{discountValue.toLocaleString("vi-VN")}₫</div>
                    </div>
                  )}
                </div>
                {discountValue > 50000 && <div style={{ color: "red" }}>Giảm giá không quá 50.000đ</div>}
                <div className={cx("btn-total-add")}>
                  <label style={{ fontWeight: "550", fontSize: "17px", textAlign: "right", color: "#ff0958" }}>
                    Tổng tiền {`( ${newOrder.totalProduct} sản phẩm)`}:&nbsp; {Number(newOrder.total).toLocaleString()} ₫
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    Ghi chú:
                    <input value={newOrder.note} onChange={(e) => setNewOrder({ ...newOrder, note: e.target.value })} />
                  </label>
                  <label>
                    Vận chuyển:
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
                    Trạng thái:
                    <select value={newOrder.status} onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Nhân viên:
                    <select disabled={true} value={yourStaffProfileInWorkplace?.staffInfo.name || "Không có tên"} onChange={(e) => setNewOrder({ ...newOrder, staff_name: e.target.value })}>
                      {/* {staffName.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))} */}
                      <option>{yourStaffProfileInWorkplace?.staffInfo.name || "Không có tên"}</option>
                    </select>
                  </label>
                </div>
                <div className={cx("group-item")}>
                  <label>
                    Nguồn:
                    <input
                      value={newOrder.website}
                      onChange={(e) => setNewOrder({ ...newOrder, website: e.target.value })}
                      placeholder="link website hoặc tên shop..."
                    />
                  </label>
                  <label>
                    Facebook khách:
                    <input
                      value={newOrder.facebookLink || ""}
                      onChange={(e) => setNewOrder({ ...newOrder, facebookLink: e.target.value })}
                      placeholder="link facebook khách..."
                    />
                  </label>
                </div>
              </div>
              <div className={cx("modal-actions")}>
                <button
                  onClick={() => {
                    setCreateNewOrderBox(false);
                    setCorrectedAddress(null);
                    setVirtualCart([...defaultVirtualCart]);
                    setNewOrder({ ...defaultNewOrder });
                    setDiscountValue(0);
                  }}
                >
                  Đóng
                </button>
                <button
                  onClick={handleCreateNewOrder}
                  disabled={discountValue > 50000 ? true : false}
                  style={{ cursor: discountValue > 50000 ? "not-allowed" : "pointer" }}
                >
                  Tạo đơn
                </button>
              </div>
            </div>
            {showListProduct && (
              <div className={cx("show-list-product")}>
                <h4>Chọn sản phẩm theo màu size</h4>
                <div className={cx("filter-color-container")}>
                  <div style={{ fontWeight: 550 }}>Lọc theo màu:</div>
                  <div className={cx("wrap-checkbox")}>
                    {productDetail.colorAvailable.map((color, k) => {
                      const isChecked = filterColorInAddProduct === color;
                      return (
                        <div key={k}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (isChecked) {
                                // ✅ if clicking again on the same box → reset to "None"
                                setFilterColorInAddProduct("None");
                              } else {
                                // ✅ else → select this color (unchecking others automatically)
                                setFilterColorInAddProduct(color);
                              }
                            }}
                          />
                          <span>{color}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={cx("row")}>
                  <div>Chọn</div>
                  <div>Tên</div>
                  <div>Màu</div>
                  <div>Size</div>
                  <div>Giá</div>
                  <div>Kho</div>
                  <div>Số lượng</div>
                </div>

                {virtualCart.map((p, i) => (
                  <React.Fragment key={i}>
                    {isExceedStock === i && <div className={cx("warning")}>⚠️ Số lượng vượt quá tồn kho ({p.stock})</div>}
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
                        <div className={cx("column-3")}>
                          <span className={cx("color-identification")} style={{ backgroundColor: COLORS[p.color.toLowerCase()] }} />
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
                ))}

                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <button className={cx("btn-decor", "btn-close")} onClick={() => handleCloseAddProduct("new-form")}>
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* //-- Upload excel */}
      {showUploadExcel && <UploadExcelBox onClose={() => setShowUploadExcel(false)} onUpload={handleUploadOrderExcel} />}

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
function ConvertTime(timeString: string){
// const inputString = "2025-11-08 23:29";

// Regex Explanation:
// (\d{4})-(\d{2})-(\d{2})  -> Matches and captures Year (Group 1), Month (Group 2), Day (Group 3)
// \s                     -> Matches the space
// (\d{2}):(\d{2})        -> Matches and captures Hours (Group 4), Minutes (Group 5)
// Replacement string uses $n to refer to the capture groups: $4:$5 $3-$2
const outputString = timeString.replace(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})/, '$4:$5 $3-$2');

// console.log(outputString); // Output: "23:29 08-11"
return outputString
}