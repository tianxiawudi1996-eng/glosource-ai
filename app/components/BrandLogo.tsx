import Image from 'next/image';

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  const frameSize = compact ? 'h-10 w-[112px] sm:w-[132px]' : 'h-12 w-[142px] sm:w-[166px]';
  const imageSize = compact ? 'h-8 w-[96px] sm:w-[116px]' : 'h-10 w-[124px] sm:w-[148px]';

  return (
    <span
      className={`inline-flex ${frameSize} items-center justify-center rounded-xl border border-white/25 bg-white/10 px-2 shadow-[0_8px_30px_rgba(2,8,23,0.16)] ring-1 ring-slate-950/5 backdrop-blur-md ${className}`}
    >
      <Image
        src="/images/glosource-logo-transparent.png"
        alt="GloSource AI"
        width={compact ? 112 : 146}
        height={compact ? 44 : 56}
        className={`${imageSize} object-contain drop-shadow-[0_1px_1px_rgba(255,255,255,0.25)]`}
        priority={false}
      />
    </span>
  );
}
