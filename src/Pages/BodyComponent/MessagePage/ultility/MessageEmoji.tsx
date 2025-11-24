import React from "react";
import EmojiPicker,  { type EmojiClickData, Theme } from "emoji-picker-react";
import classNames from "classnames/bind";
import styles from "./MessageEmoji.module.scss";

const cx = classNames.bind(styles);

interface MessageEmojiProps {
  onSelect: (emoji: string) => void;
}

export default function MessageEmoji({ onSelect }: MessageEmojiProps) {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
  };

  return (
    <div className={cx("main")}>
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        theme={Theme.LIGHT}
        autoFocusSearch={false}
        lazyLoadEmojis
        // width={320}
        // height={400}
      />
    </div>
  );
}
