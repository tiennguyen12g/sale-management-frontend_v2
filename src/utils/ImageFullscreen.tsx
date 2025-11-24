import React, { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { HiStar } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import classNames from "classnames/bind";
import styles from "./ReviewSection.module.scss";

const cx = classNames.bind(styles);
interface Props{
    imageUrl: string, 
    startIndex?: number, 
    onClose: Dispatch<SetStateAction<boolean>>, 
    infoImage?: string
}
export default function ReviewFullscreen({ imageUrl, startIndex, onClose, infoImage } : Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(startIndex || 0);

  // sync carousel index
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(startIndex, true); // jump instantly
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, startIndex]);

  return (
    <div className={cx("overlay")}>
      {/* Top bar */}
      <div className={cx("top-bar")}>
        <button onClick={onClose} className={cx("close-btn")}>
          <MdClose size={28} /> Đóng
        </button>
        <span className={cx("counter")}>
          {selectedIndex + 1}/{images.length}
        </span>
      </div>

      {/* Image carousel */}
      <div className={cx("embla")} ref={emblaRef}>
        <div className={cx("embla__container")}>
          {images.map((img, i) => (
            <div className={cx("embla__slide")} key={i}>
              <img src={img} alt={`Review ${i}`} className={cx("review-img")} />
            </div>
          ))}
        </div>
      </div>

      {/* Review footer */}
      <div className={cx("footer")}>
        <div className={cx("user")}>
          <img src={review.src} alt="user" className={cx("avatar")} />
          <span className={cx("name")}>{review.name}</span>
          <span className={cx("stars")}>
            {[...Array(review.rating)].map((_, idx) => (
              <HiStar key={idx} size={14} color="#facc15" />
            ))}
          </span>
        </div>
        <div className={cx("product")}>Mặt hàng: {review.productName}</div>
        <div className={cx("comment")}>{review.comment}</div>
      </div>
    </div>
  );
}
