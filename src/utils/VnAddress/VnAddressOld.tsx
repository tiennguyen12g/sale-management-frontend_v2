import { useState, useEffect, type Dispatch,type SetStateAction } from 'react';
import {
    getAllProvince,
    getDistrictsByProvinceId
} from 'vietnam-provinces-js/provinces';
import {
    getCommunesByDistrictId
} from 'vietnam-provinces-js/districts';
import classNames from 'classnames/bind'
import styles from './VnAddressOld.module.scss'
const cx = classNames.bind(styles)

interface VnAddressSelectProps {
    onChange: (addressData: {
        provinceName: string;
        districtName: string;
        communeName: string;
    }) => void;
}
export default function VnAddressSelect_Old({ onChange } : VnAddressSelectProps) {
    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [communes, setCommunes] = useState<any[]>([]);

    const [provinceId, setProvinceId] = useState('');
    const [districtId, setDistrictId] = useState('');
    const [communeId, setCommuneId] = useState('');

    useEffect(() => {
        getAllProvince().then(setProvinces);
    }, []);

    useEffect(() => {
        if (provinceId) {
            getDistrictsByProvinceId(provinceId).then(setDistricts);
            setDistrictId('');
            setCommunes([]);
            setCommuneId('');
        }
    }, [provinceId]);

    useEffect(() => {
        if (districtId) {
            getCommunesByDistrictId(districtId).then(setCommunes);
            setCommuneId('');
        }
    }, [districtId]);

      useEffect(() => {
    // mỗi khi province/district/commune thay đổi => gửi ngược lên parent
    const addressData = {
      provinceId,
      districtId,
      communeId,
      provinceName: provinces.find(p => p.idProvince === provinceId)?.name || "",
      districtName: districts.find(d => d.idDistrict === districtId)?.name || "",
      communeName: communes.find(c => c.idCommune === communeId)?.name || "",
    };
    if (onChange) onChange(addressData);
  }, [provinceId, districtId, communeId]);

    return (
        <div className={cx('address-select-wrapper')}>
            <div>
                <select value={provinceId} onChange={e => setProvinceId(e.target.value)} className={cx('select-css')}>
                    <option value="">Tỉnh/Thành</option>
                    {provinces.map(p => (
                        <option key={p.idProvince} value={p.idProvince}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <select value={districtId} onChange={e => setDistrictId(e.target.value)} disabled={!districts.length} className={cx('select-css')}> 
                    <option value="">Quận/Huyện</option>
                    {districts.map(d => (
                        <option key={d.idDistrict} value={d.idDistrict}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <select value={communeId} onChange={e => setCommuneId(e.target.value)} disabled={!communes.length} className={cx('select-css')}>
                    <option value="">Phường/Xã</option>
                    {communes.map(c => (
                        <option key={c.idCommune} value={c.idCommune}>{c.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
