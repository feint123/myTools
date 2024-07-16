import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};


export interface ChangeLoadingPayload {
  isLoading: boolean;
  tips: string;
}