import React, {useState} from 'react'
import classNames from 'classnames/bind'
import styles from './InitialPageShow.module.scss'
const cx = classNames.bind(styles)
import PageSelect from './PageSelect';
import { useFacebookStore } from '../../../zustand/facebookStore';
export default function InitialMessageShow() {
    const [showPageSelect, setShowPageSelect] = useState(false);

  return (
    <div className={cx('main-initial-message-show')}>
        <h3>Chọn trang để bắt đầu quản lý tin nhắn</h3>
        <button className={cx("btn-decor")} onClick={() => setShowPageSelect(true)}>
            Danh sách shop
        </button>
        {showPageSelect && <PageSelect setShowListPage={setShowPageSelect} />}
    </div>
  )
}
