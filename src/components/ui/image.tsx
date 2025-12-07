import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

export default function Image({ src, alt, width, height, className, fill, style, ...props }: ImageProps) {
  // Handle "fill" prop which is common in Next.js
  const fillStyle: React.CSSProperties = fill ? {
    position: 'absolute',
    height: '100%',
    width: '100%',
    inset: 0,
    objectFit: 'cover',
    ...style
  } : (style || {});

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={fillStyle}
      loading={props.priority ? "eager" : "lazy"}
      {...props}
    />
  );
}
