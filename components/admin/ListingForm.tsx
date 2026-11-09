'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Listing, ListingDraft } from '@/types/listing';
import { LISTING_STATUSES, PROPERTY_TYPES, REGIONS } from '@/types/listing';
import { BLUR_DATA_URL } from '@/lib/format';

const EMPTY: ListingDraft = {
  title: '',
  listingType: 'Sale',
  propertyType: 'House',
  status: 'Active',
  price: 0,
  location: '',
  region: 'North Trinidad',
  beds: 3,
  baths: 2,
  sqft: 1500,
  description: '',
  amenities: [],
  images: [],
  featured: false,
  dateListed: new Date().toISOString().slice(0, 10),
};

type Errors = Partial<Record<string, string>>;

/**
 * Add / edit form in a modal. Same component for both — an existing listing
 * pre-fills it, so an agent learns one screen rather than two.
 */
export default function ListingForm({
  open,
  listing,
  onClose,
  onSave,
}: {
  open: boolean;
  listing: Listing | null;
  onClose: () => void;
  onSave: (draft: ListingDraft) => void;
}) {
  const [draft, setDraft] = useState<ListingDraft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [imageInput, setImageInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');
  const reduce = useReducedMotion();
  const titleRef = useRef<HTMLInputElement>(null);
  // Object URLs from local file previews, revoked when the form closes.
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setDraft(listing ? { ...listing } : { ...EMPTY });
    setErrors({});
    setImageInput('');
    setAmenityInput('');
    const focus = setTimeout(() => titleRef.current?.focus(), 80);
    return () => clearTimeout(focus);
  }, [open, listing]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.current = [];
    },
    [],
  );

  const patch = (part: Partial<ListingDraft>) => setDraft((d) => ({ ...d, ...part }));

  const addImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    patch({ images: [...draft.images, trimmed] });
    setImageInput('');
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    // No upload in the demo — a local preview URL stands in for the CDN URL
    // the real system would return.
    const urls = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      return url;
    });
    patch({ images: [...draft.images, ...urls] });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!draft.title.trim()) next.title = 'Give the listing a title.';
    if (!draft.location.trim()) next.location = 'Name the neighbourhood.';
    if (!draft.price || draft.price <= 0) next.price = 'Enter a price above zero.';
    if (draft.images.length === 0) next.images = 'Add at least one photograph.';

    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.getElementById('form-' + Object.keys(next)[0])?.focus();
      return;
    }
    onSave(draft);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-overlay bg-ink/50 backdrop-blur-[2px]"
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-heading"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-auto z-modal mx-auto flex max-h-[92dvh] w-full max-w-[46rem] flex-col overflow-hidden rounded-t-lg border border-bone-edge bg-bone shadow-float sm:inset-4 sm:bottom-auto sm:top-[4vh] sm:rounded-lg"
          >
            <div className="flex items-center justify-between border-b border-bone-edge px-6 py-4">
              <h2
                id="form-heading"
                className="font-display text-[1.25rem] tracking-display text-ink"
              >
                {listing ? 'Edit listing' : 'Add listing'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close without saving"
                className="flex h-11 w-11 items-center justify-center rounded-sm text-ink-mute transition-colors duration-200 ease-out hover:bg-bone-deep hover:text-ink sm:h-auto sm:w-auto sm:p-1.5"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
                  <path
                    d="M4 4l10 10M14 4L4 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>

            <form
              id="listing-form"
              onSubmit={submit}
              noValidate
              className="flex-1 overflow-y-auto px-6 py-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="form-title" error={errors.title}>
                    Title
                  </Label>
                  <input
                    ref={titleRef}
                    id="form-title"
                    value={draft.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    className={inputClass(errors.title)}
                  />
                  <ErrorText id="form-title" message={errors.title} />
                </div>

                <div>
                  <Label htmlFor="form-location" error={errors.location}>
                    Neighbourhood
                  </Label>
                  <input
                    id="form-location"
                    value={draft.location}
                    onChange={(e) => patch({ location: e.target.value })}
                    className={inputClass(errors.location)}
                  />
                  <ErrorText id="form-location" message={errors.location} />
                </div>

                <div>
                  <Label htmlFor="form-region">Region</Label>
                  <select
                    id="form-region"
                    value={draft.region}
                    onChange={(e) => patch({ region: e.target.value })}
                    className={inputClass()}
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="form-listingType">Sale or rent</Label>
                  <select
                    id="form-listingType"
                    value={draft.listingType}
                    onChange={(e) =>
                      patch({ listingType: e.target.value as ListingDraft['listingType'] })
                    }
                    className={inputClass()}
                  >
                    <option value="Sale">For sale</option>
                    <option value="Rent">For rent</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="form-propertyType">Property type</Label>
                  <select
                    id="form-propertyType"
                    value={draft.propertyType}
                    onChange={(e) =>
                      patch({
                        propertyType: e.target.value as ListingDraft['propertyType'],
                      })
                    }
                    className={inputClass()}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="form-price" error={errors.price}>
                    Price, TTD
                    <span className="ml-1.5 text-[0.72rem] text-ink-faint">
                      {draft.listingType === 'Rent' ? 'per month' : 'asking'}
                    </span>
                  </Label>
                  <input
                    id="form-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={draft.price || ''}
                    onChange={(e) => patch({ price: Number(e.target.value) })}
                    className={inputClass(errors.price) + ' tnum'}
                  />
                  <ErrorText id="form-price" message={errors.price} />
                </div>

                <div>
                  <Label htmlFor="form-status">Status</Label>
                  <select
                    id="form-status"
                    value={draft.status}
                    onChange={(e) =>
                      patch({ status: e.target.value as ListingDraft['status'] })
                    }
                    className={inputClass()}
                  >
                    {LISTING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                  <div>
                    <Label htmlFor="form-beds">Beds</Label>
                    <input
                      id="form-beds"
                      type="number"
                      min={0}
                      value={draft.beds ?? ''}
                      onChange={(e) =>
                        patch({ beds: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      className={inputClass() + ' tnum'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-baths">Baths</Label>
                    <input
                      id="form-baths"
                      type="number"
                      min={0}
                      step={0.5}
                      value={draft.baths ?? ''}
                      onChange={(e) =>
                        patch({ baths: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      className={inputClass() + ' tnum'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-sqft">Sq ft</Label>
                    <input
                      id="form-sqft"
                      type="number"
                      min={0}
                      value={draft.sqft ?? ''}
                      onChange={(e) =>
                        patch({ sqft: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      className={inputClass() + ' tnum'}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="form-description">Description</Label>
                  <textarea
                    id="form-description"
                    rows={3}
                    value={draft.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    className={inputClass() + ' resize-y leading-relaxed'}
                  />
                </div>

                {/* Amenities */}
                <div className="sm:col-span-2">
                  <Label htmlFor="form-amenity">Amenities</Label>
                  <div className="flex gap-2">
                    <input
                      id="form-amenity"
                      value={amenityInput}
                      placeholder="Private Pool"
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (!amenityInput.trim()) return;
                          patch({ amenities: [...draft.amenities, amenityInput.trim()] });
                          setAmenityInput('');
                        }
                      }}
                      className={inputClass()}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!amenityInput.trim()) return;
                        patch({ amenities: [...draft.amenities, amenityInput.trim()] });
                        setAmenityInput('');
                      }}
                      className="shrink-0 rounded-sm border border-bone-edge px-4 text-[0.82rem] text-ink-soft transition-colors duration-200 ease-out hover:border-ink/25 hover:text-ink"
                    >
                      Add
                    </button>
                  </div>
                  {draft.amenities.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {draft.amenities.map((a, i) => (
                        <li key={a + i}>
                          <button
                            type="button"
                            onClick={() =>
                              patch({
                                amenities: draft.amenities.filter((_, idx) => idx !== i),
                              })
                            }
                            className="group flex items-center gap-1.5 rounded-sm bg-gold-wash px-2.5 py-1 text-[0.76rem] text-ink transition-colors duration-200 ease-out hover:bg-gold/40"
                          >
                            {a}
                            <span
                              aria-hidden
                              className="text-ink-faint group-hover:text-ink"
                            >
                              &times;
                            </span>
                            <span className="sr-only">Remove {a}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Images */}
                <div className="sm:col-span-2">
                  <Label htmlFor="form-images" error={errors.images}>
                    Photographs
                  </Label>
                  <div className="flex gap-2">
                    <input
                      id="form-images"
                      value={imageInput}
                      placeholder="Paste an image URL"
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage(imageInput);
                        }
                      }}
                      className={inputClass(errors.images)}
                    />
                    <button
                      type="button"
                      onClick={() => addImage(imageInput)}
                      className="shrink-0 rounded-sm border border-bone-edge px-4 text-[0.82rem] text-ink-soft transition-colors duration-200 ease-out hover:border-ink/25 hover:text-ink"
                    >
                      Add
                    </button>
                  </div>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[0.78rem] text-gold-deep underline decoration-gold/40 underline-offset-4 transition-colors duration-200 ease-out hover:text-ink">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => onFiles(e.target.files)}
                    />
                    or choose files from this computer
                  </label>
                  <ErrorText id="form-images" message={errors.images} />

                  {draft.images.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {draft.images.map((src, i) => (
                        <li key={src + i} className="relative">
                          <span className="relative block h-16 w-24 overflow-hidden rounded-sm bg-bone-deep">
                            <Image
                              src={src}
                              alt=""
                              fill
                              // Local object URLs and arbitrary hosts can't go
                              // through the optimizer.
                              unoptimized={!src.startsWith('/') && !src.startsWith('https://images.unsplash.com')}
                              placeholder="blur"
                              blurDataURL={BLUR_DATA_URL}
                              sizes="96px"
                              className="object-cover"
                            />
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              patch({ images: draft.images.filter((_, idx) => idx !== i) })
                            }
                            aria-label={'Remove photograph ' + (i + 1)}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[0.7rem] text-bone transition-transform duration-200 ease-out hover:scale-110"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 sm:col-span-2">
                  <input
                    id="form-featured"
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => patch({ featured: e.target.checked })}
                    className="h-4 w-4 accent-[#B8934D]"
                  />
                  <span className="text-[0.86rem] text-ink-soft">
                    Feature on the homepage
                  </span>
                </label>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 border-t border-bone-edge px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm border border-bone-edge px-4 py-2.5 text-[0.85rem] text-ink-mute transition-colors duration-200 ease-out hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="listing-form"
                className="rounded-sm bg-ink px-5 py-2.5 text-[0.85rem] text-bone transition-[background-color,transform] duration-200 ease-out hover:bg-ink-soft active:translate-y-px"
              >
                {listing ? 'Save changes' : 'Publish listing'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function inputClass(error?: string) {
  return (
    'w-full rounded-sm border bg-bone px-3 py-3 text-[16px] text-ink transition-colors duration-200 ease-out focus:border-gold sm:py-2.5 desk:text-[0.88rem] ' +
    (error ? 'border-[#9B3D2E]' : 'border-bone-edge hover:border-ink/25')
  );
}

function Label({
  htmlFor,
  children,
  error,
}: {
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={
        'mb-1.5 block text-[0.76rem] ' + (error ? 'text-[#9B3D2E]' : 'text-ink-soft')
      }
    >
      {children}
    </label>
  );
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id + '-error'} role="alert" className="mt-1.5 text-[0.75rem] text-[#9B3D2E]">
      {message}
    </p>
  );
}
