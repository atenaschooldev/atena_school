import tokensData from "./tokens.json";

export interface DesignToken<T = string> {
  value: T;
  type: string;
  description?: string;
  pixelValue?: string;
}

export interface ColorToken {
  oklch: DesignToken;
  hex: DesignToken;
}

export interface DesignTokens {
  info: {
    name: string;
    version: string;
    description: string;
  };
  color: {
    light: {
      background: ColorToken;
      foreground: ColorToken;
      primary: ColorToken;
      primaryForeground: ColorToken;
      secondary: ColorToken;
      sidebar: ColorToken;
      sidebarPrimary: ColorToken;
    };
    dark: {
      background: ColorToken;
      foreground: ColorToken;
      primary: ColorToken;
      sidebar: ColorToken;
    };
    semantic: {
      success: ColorToken;
      warning: ColorToken;
      destructive: ColorToken;
    };
  };
  radius: {
    sm: DesignToken;
    md: DesignToken;
    lg: DesignToken;
    xl: DesignToken;
  };
  spacing: {
    xs: DesignToken & { pixelValue: string };
    sm: DesignToken & { pixelValue: string };
    md: DesignToken & { pixelValue: string };
    lg: DesignToken & { pixelValue: string };
    xl: DesignToken & { pixelValue: string };
  };
  font: {
    sans: DesignToken;
    mono: DesignToken;
  };
  shadow: {
    island: DesignToken;
  };
}

export const designTokens: DesignTokens = tokensData as unknown as DesignTokens;

export default designTokens;
