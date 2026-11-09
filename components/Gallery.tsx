'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { BLUR_DATA_URL } from '@/lib/format';

/**
 * Image gallery with a thumbnail strip. Swipeable by drag on touch, arrow-key
 * navigable, and the frame keeps its aspect ratio so nothing shifts as the
 * photographs load.
 */
export default function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reduce = useReducedMotion();

  const go = useCallback(
    (next: number) => {
      const wrapped = (next + images.length) % images.length;
      setDirection(next > index ? 1 : -1);
      setIndex(wrapped);
    },
    [images.length, index],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  return (
    <div>
      <div className="relative aspect-[3/2] overflow-hidden rounded-sm bg-bone-deep sm:aspect-[16/9]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            drag={images.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) go(index + 1);
              if (info.offset.x > 70) go(index - 1);
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Image
              src={images[index]}
              alt={title + ', image ' + (index + 1) + ' of ' + images.length}
              fill
              priority={index === 0}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="pointer-events-none object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gold/8 mix-blend-multiply" />

        {images.length > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(index - 1)} />
            <GalleryArrow side="right" onClick={() => go(index + 1)} />
            <p className="tnum absolute bottom-3 right-3 rounded-sm bg-ink/70 px-2.5 py-1 text-[0.72rem] text-bone backdrop-blur-sm">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Property photographs"
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={'Show image ' + (i + 1)}
              onClick={() => go(i)}
              className={
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-sm transition-[opacity,box-shadow] duration-300 ease-out sm:h-20 sm:w-28 ' +
                (i === index
                  ? 'opacity-100 ring-2 ring-gold ring-offset-2 ring-offset-bone'
                  : 'opacity-55 hover:opacity-85')
              }
            >
              <Image
                src={src}
                alt=""
                fill
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({
  side,
  onClick,
}: {
  side: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous image' : 'Next image'}
      className={
        'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-bone/90 text-ink backdrop-blur-sm transition-[background-color,transform] duration-200 ease-out hover:bg-bone active:scale-95 sm:h-10 sm:w-10 ' +
        (side === 'left' ? 'left-3' : 'right-3')
      }
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path
          d={side === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </button>
  );
}
