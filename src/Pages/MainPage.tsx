import React from 'react';
import classNames from 'classnames/bind'
import styles from './MainPage.module.scss'
const cx = classNames.bind(styles)

// Menu
import MainMenu_v2 from './MenuComponent/MainMenu_v2';
//Body
import BodyMain from './BodyComponent/BodyMain';
export default function MainPage() {
  return (
    <div className={cx('main-page')}>
        <MainMenu_v2 />
        <BodyMain />
    </div>
  )
}
