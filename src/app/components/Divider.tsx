import Image from 'next/image';

interface DividerProps {
  /** Image path (e.g. '/images/dividers/divider1.png') */
  src: string;
  /** Optional wrapper className. Default: my-10 w-[80%] mx-auto */
  className?: string;
}

export default function Divider({ src, className = 'my-10 w-[80%] mx-auto' }: DividerProps) {
  return (
    <div className={className} aria-hidden role="presentation">
      <Image
        src={src}
        alt=""
        width={768}
        height={120}
        className="w-full h-auto object-contain"
      />
    </div>
  );
}
