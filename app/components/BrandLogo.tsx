import Image from 'next/image';

type BrandLogoProps = {
  compact?: boolean;
  onDark?: boolean;  // true = dark nav (white box), false = light page (border only)
  className?: string;
};

export default function BrandLogo({ compact = false, onDark = true, className = '' }: BrandLogoProps) {
  const containerStyle = onDark
    ? 'bg-white shadow-sm'
    : 'border border-slate-200 bg-white';

  return (
    <span
      className={`inline-flex shrink-0 items-center overflow-hidden rounded-xl ${containerStyle} ${compact ? 'px-2.5 py-1' : 'px-3 py-1.5'} ${className}`}
    >
      <Image
        src="/images/glosource-logo-transparent.png"
        alt="GloSource AI"
        width={1048}
        height={721}
        className={compact ? 'h-7 w-[41px] object-contain' : 'h-9 w-[52px] object-contain'}
        priority={false}
      />
    </span>
  );
}
