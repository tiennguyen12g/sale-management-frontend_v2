import React, { type Dispatch, type SetStateAction } from "react";
import classNames from "classnames/bind";
import styles from "./PageSelect.module.scss";
const cx = classNames.bind(styles);
import FacebookLoginButton from "./CallPagePermission";
import { FaSquareFacebook } from "react-icons/fa6";
import { AiFillTikTok } from "react-icons/ai";
import { SiShopee } from "react-icons/si";
import { useFacebookStore, type PageInfoType } from "../../../zustand/facebookStore";
const platformIcon = {
  facebook: <FaSquareFacebook />,
  tiktok: <AiFillTikTok />,
  shopee: <SiShopee />,
};
interface Props {
  setShowListPage: Dispatch<SetStateAction<boolean>>;
}
export default function PageSelect({ setShowListPage }: Props) {
  const { pages, setPageSelected } = useFacebookStore();
  console.log("pages", pages);
  const handleSaveSelectedPage = (pageInfo: PageInfoType) => {
    setPageSelected(pageInfo);
    setShowListPage(false);
  }
  return (
    <div className={cx("main-page-select")}>
      <div className={cx("btn-close-wrap")}>
        <button className={cx("btn-decor")} onClick={() => setShowListPage(false)}>
          Đóng
        </button>
      </div>
      <div className={cx("container")}>
        <div style={{ flex: 1 }}>
          {/* <div className={cx('horizontal-line')}></div> */}
          <div className={cx("page-list-container")}>
            <h3 style={{ textAlign: "center" }}>Shop bạn sở hữu</h3>
            {data.length === 0 && (
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <FacebookLoginButton />
              </div>
            )}
            <div className={cx("list-box")}>
              {pages.length > 0 &&
                pages.map((pageInfo: PageInfoType, i) => {
                  return (
                    <div key={i} className={cx("box-page-info")} onClick={() => handleSaveSelectedPage(pageInfo)}>
                      <div className={cx("left-part")}>
                        <img src={pageInfo.pageAvatarURL} className={cx("img-decor")} />
                      </div>
                      <div className={cx("right-part")}>
                        <div style={{ fontSize: 18, fontWeight: 550 }}>{pageInfo.pageName}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {platformIcon[pageInfo.platform as keyof typeof platformIcon]} {pageInfo.pageId}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          {/* <div className={cx('horizontal-line')}></div> */}
          <div className={cx("page-list-container")}>
            <h3 style={{ textAlign: "center" }}>Shop bạn quản lí</h3>
            <div className={cx("list-box")}>
              {data.map((pageInfo: PageInfoType, i) => {
                return (
                  <div key={i} className={cx("box-page-info")}>
                    <div className={cx("left-part")}>
                      <img src={pageInfo.pageAvatarURL} className={cx("img-decor")} />
                    </div>
                    <div className={cx("right-part")}>
                      <div style={{ fontSize: 18, fontWeight: 550 }}>{pageInfo.pageName}</div>
                      <div>
                        {platformIcon[pageInfo.platform as keyof typeof platformIcon]} {pageInfo.pageId}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const data: PageInfoType[] = [];
