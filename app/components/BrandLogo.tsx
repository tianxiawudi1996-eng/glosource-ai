import Image from 'next/image';

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/images/glosource-logo.png"
        alt="GloSource AI"
        width={compact ? 112 : 146}
        height={compact ? 44 : 56}
        className={`${compact ? 'h-8 w-[82px] sm:w-[112px]' : 'h-9 w-[118px] sm:w-[146px]'} rounded-md bg-white object-contain px-1.5 py-0.5 shadow-sm ring-1 ring-slate-200/40`}
        priority={false}
      />
    </span>
  );
}
