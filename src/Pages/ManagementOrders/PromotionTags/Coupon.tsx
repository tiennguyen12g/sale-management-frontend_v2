import React from 'react';
import classNames from 'classnames/bind'
import styles from './Coupon.module.scss'
const cx = classNames.bind(styles)
import { RiCoupon3Fill } from "react-icons/ri";
interface Props{
    text: string,
    valueText: string,
}
export default function Coupon({text, valueText}: Props) {
  return (
    <div className={cx('container-coupon')}>
        <div className={cx('part1')}>
            <div className={cx('icon-coupon')}><RiCoupon3Fill />&nbsp;</div>
            <div className={cx('text1')}>Giảm tiền {valueText}</div>
        </div>
        <div className={cx('part2')}>
            <span className={cx('text-animate')}>{text}</span>

        </div>

    </div>
  )
}
