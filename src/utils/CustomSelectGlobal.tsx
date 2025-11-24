import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind'
import styles from './CustomSelectGlobal.module.scss'
const cx = classNames.bind(styles)

interface CustomSelectProps {
  options: {name: string, key: string, color?: string}[];
  onChange: (value: string) => void;
  placeholder?: string;
  dropdownPosition?: 'top' | 'bottom'; // New prop
  isUsePlaceHolder?: boolean,
  isUseBorder?:boolean
}

const CustomSelectGlobal: React.FC<CustomSelectProps> = ({ 
  options, 
  onChange, 
  placeholder = "-- Chọn thẻ --",
  dropdownPosition = 'bottom', // Default to bottom
  isUsePlaceHolder = false,
  isUseBorder = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(isUsePlaceHolder ?  placeholder : options[0].name);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionKey: string, name: string) => {
    setSelected(name);
    setIsOpen(false);
    onChange(optionKey);
  };

  return (
    <div className={cx('customSelect')} ref={dropdownRef}>
      <div 
        className={cx('selectTrigger')}
        onClick={() => setIsOpen(!isOpen)}
        style={{border: isUseBorder ? "1px solid #ddd" : "0px solid #ddd"}}
      >
        {selected }
        <span className={cx('arrow')}>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className={cx('optionsList', dropdownPosition === 'top' ? 'optionsListTop' : 'optionsListBottom')}>
          {options.map((option, i) => (
            <div
              key={i}
              className={cx('option')}
              onClick={() => handleSelect(option.key, option.name)}
              style={{color: option.color ?? 'black'}}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelectGlobal;