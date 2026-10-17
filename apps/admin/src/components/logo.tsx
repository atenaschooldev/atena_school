import * as React from "react"

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number
}

export function Logo({ size = 24, className, style, ...props }: LogoProps) {
  return (
    <img
      src="/athena-logo.webp"
      alt="Atena School"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", ...style }}
      className={className}
      {...props}
    />
  )
}
