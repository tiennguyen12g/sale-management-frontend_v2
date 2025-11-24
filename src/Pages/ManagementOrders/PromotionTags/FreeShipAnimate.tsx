import React from 'react';
import classNames from 'classnames/bind'
import styles from './FreeShipAnimate.module.scss'
const cx = classNames.bind(styles)
import { RiCoupon3Fill } from "react-icons/ri";
import { LiaShippingFastSolid } from "react-icons/lia";

export default function FreeShipAnimate({text} : {text: string}) {
  return (
    <div className={cx('container-coupon')}>
        <div className={cx('part1')}>
            <div className={cx('icon-coupon')}><LiaShippingFastSolid size={18} color="#037269"/>&nbsp;</div>
            <div className={cx('text1')}>FreeShip</div>
        </div>
        <div className={cx('part2')}>
            <span className={cx('text-animate')}>{text}</span>

        </div>

    </div>
  )
}
