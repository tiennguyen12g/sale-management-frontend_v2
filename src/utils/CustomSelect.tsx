import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind'
import styles from './CustomSelect.module.scss'
const cx = classNames.bind(styles)

interface CustomSelectProps {
  options: Array<{ id: string; tagName: string, color: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  dropdownPosition?: 'top' | 'bottom'; // New prop
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  options, 
  onChange, 
  placeholder = "-- Chọn thẻ --",
  dropdownPosition = 'bottom' // Default to bottom
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
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

  const handleSelect = (id: string, name: string) => {
    setSelected(name);
    setIsOpen(false);
    onChange(id);
  };

  return (
    <div className={cx('customSelect')} ref={dropdownRef}>
      <div 
        className={cx('selectTrigger')}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected || placeholder}
        <span className={cx('arrow')}>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className={cx('optionsList', dropdownPosition === 'top' ? 'optionsListTop' : 'optionsListBottom')}>
          {options.map((tag) => (
            <div
              key={tag.id}
              className={cx('option')}
              onClick={() => handleSelect(tag.id, tag.tagName)}
              style={{color: tag.color}}
            >
              {tag.tagName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;