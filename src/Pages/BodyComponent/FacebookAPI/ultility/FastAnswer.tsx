import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./FastAnswer.module.scss";
const cx = classNames.bind(styles);

import { type TagType, type MediaLinkedType , useBranchStore , type FastMessageType} from "../../../../zustand/branchStore";

interface FastAnswerProps {
  inputValue: string;
  onSelect: (message: { text: string; media?: MediaLinkedType[] }) => void;
}

export default function FastAnswer({ inputValue, onSelect }: FastAnswerProps) {
  const { branchSettings } = useBranchStore();
  const fastMessages: FastMessageType[] = branchSettings?.fastMessages || [];

  const [filtered, setFiltered] = useState<FastMessageType[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const match = inputValue.match(/\/(\w*)$/);
    if (match) {
      const keyword = match[1].toLowerCase();
      const result = fastMessages.filter((r) => r.keySuggest.toLowerCase().startsWith(keyword));
      setFiltered(result);
      setActiveIndex(0);
    } else {
      setFiltered([]);
    }
  }, [inputValue, fastMessages]);

  const handleSelect = (item: FastMessageType) => {
    onSelect({
      text: item.messageContent,
      media: item.listMediaUrl,
    });
    setFiltered([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!filtered.length) return false;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
      return true;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      return true;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filtered[activeIndex];
      if (chosen) handleSelect(chosen);
      return true;
    }
    return false;
  };

  if (!filtered.length) return null;

  return (
    <div className={cx("dropdown")}>
      {filtered.map((item, i) => (
        <div
          key={item.id}
          className={cx("item", { active: i === activeIndex })}
          onClick={() => handleSelect(item)}
        >
          <span className={cx("shortcut")}>/{item.keySuggest}</span>
       <span className={cx("text")}>{item.messageContent}</span>

          {item.listMediaUrl?.length > 0 && (
            <div className={cx("thumbs")}>
              {item.listMediaUrl.slice(0, 3).map((m) => (
                <img key={m.id} src={m.url} alt="thumb" className={cx("thumb")} />
              ))}
              {item.listMediaUrl.length > 3 && (
                <span className={cx("more")}>+{item.listMediaUrl.length - 3}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** ✅ Hook-like helper so parent can intercept keyboard events */
FastAnswer.useKeyHandler = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  inputValue: string,
  onSelect: (message: { text: string; media?: MediaLinkedType[] }) => void,
  stateRef: React.MutableRefObject<any>,
  fastMessages: FastMessageType[]
): boolean => {
  const match = inputValue.match(/\/(\w*)$/);
  if (!match) return false;

  const keyword = match[1].toLowerCase();
  const result = fastMessages.filter((r) => r.keySuggest.toLowerCase().startsWith(keyword));
  if (!result.length) return false;

  if (!stateRef.current) stateRef.current = { active: 0, list: result };

  if (e.key === "ArrowDown") {
    e.preventDefault();
    stateRef.current.active = (stateRef.current.active + 1) % result.length;
    return true;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    stateRef.current.active = (stateRef.current.active - 1 + result.length) % result.length;
    return true;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    const chosen = result[stateRef.current.active];
    if (chosen)
      onSelect({ text: chosen.messageContent, media: chosen.listMediaUrl });
    return true;
  }

  return false;
};
