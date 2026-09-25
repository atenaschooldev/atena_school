import React from "react";

export interface SocialIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  weight?: "regular" | "bold" | "fill";
}

export function TikTokLogo({ size = 18, className, ...props }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.89 2.89 2.895 2.895 0 0 1-2.89-2.89 2.895 2.895 0 0 1 2.89-2.89c.306 0 .598.05.872.14V9.418a6.34 6.34 0 0 0-.872-.06A6.342 6.342 0 0 0 3 15.672 6.342 6.342 0 0 0 9.342 22a6.342 6.342 0 0 0 6.342-6.328V9.172a8.21 8.21 0 0 0 4.88 1.585V7.324a4.838 4.838 0 0 1-.975-.638z" />
    </svg>
  );
}

export function YoutubeLogo({ size = 18, className, ...props }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
