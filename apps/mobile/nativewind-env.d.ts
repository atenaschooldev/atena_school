/// <reference types="react-native-css/types" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
