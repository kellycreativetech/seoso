import Image from "next/image";
import { urlFor } from "@/sanity/image";
import type { SanityImageCrop, SanityImageHotspot } from "@/sanity/types";

export type SanityImageValue = {
  asset: {
    _id: string;
    metadata: {
      lqip: string | null;
      dimensions: { width: number | null; height: number | null } | null;
    } | null;
  } | null;
  alt?: string | null;
  hotspot?: SanityImageHotspot | null;
  crop?: SanityImageCrop | null;
} | null;

type Props = {
  value: SanityImageValue;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "lazy" | "eager";
};

export function SanityImage({ value, width, height, className, priority, sizes, loading }: Props) {
  if (!value?.asset) return null;
  const { asset, alt, hotspot, crop } = value;
  const lqip = asset.metadata?.lqip;

  return (
    <Image
      src={urlFor({ asset: { _ref: asset._id }, hotspot: hotspot ?? undefined, crop: crop ?? undefined })
        .width(width)
        .height(height)
        .fit("crop")
        .url()}
      alt={alt ?? ""}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      loading={priority ? undefined : loading}
      placeholder={lqip ? "blur" : "empty"}
      blurDataURL={lqip ?? undefined}
    />
  );
}
