import React from 'react'
import DeliveryReturn_v2 from './DeliveryReturnBroken/DeliveryReturn_v2';
import ProductDetails from './ProductDetails/ProductDetailsForOwner';
import ImportExportInventory_v2 from './ImportExportInventory/ImportExportInventory_v2';
import { useMenuStore } from '../../MenuComponent/MenuActiveState';
export default function ProductManage() {
      const {activeSubmenu,} = useMenuStore();
        let contentShow: React.ReactNode = "";
        switch (activeSubmenu) {
          case "import":
            contentShow = <ImportExportInventory_v2 />;
            break;
          case "delivery":
            contentShow = <DeliveryReturn_v2 />;
            break;
          case "product-detail":
            contentShow = <ProductDetails />;
            break;
          default:
            break;
        }
  return (
    <div>
      {contentShow}
    </div>
  )
}

