import type { CSSProperties } from "react";
import { asset } from "./lib/dom";

type BrandLogoProps = {
  variant: "norton" | "savills" | "cobrand";
  tone?: "dark" | "light" | "auto";
  className?: string;
  nortonWidth?: string;
  savillsSize?: string;
  gap?: string;
  loading?: "eager" | "lazy";
  hidden?: boolean;
};

/** Official artwork only. Sizes and spacing belong to the placement, not to
 *  the asset; the Savills square is never recoloured or visually cropped. */
export function BrandLogo({ variant, tone = "dark", className = "", nortonWidth,
  savillsSize, gap, loading = "eager", hidden }: BrandLogoProps) {
  const style = {
    ...(nortonWidth ? { "--brand-norton-width": nortonWidth } : {}),
    ...(savillsSize ? { "--brand-savills-size": savillsSize } : {}),
    ...(gap ? { "--brand-logo-gap": gap } : {}),
  } as CSSProperties;
  const savills = <img className="brand-logo__savills" src={asset("assets/logos/savills-client.png")} alt="Savills" width={1181} height={1181} loading={loading} />;

  return (
    <span className={`brand-logo brand-logo--${variant} brand-logo--${tone} ${className}`.trim()} style={style} hidden={hidden}>
      {variant !== "savills" && (
        <span className="brand-logo__norton" role="img" aria-label="Norton Park, A Gamuda Land Community">
          <img className={tone === "auto" ? "brand-logo__norton-dark" : undefined} src={asset(tone === "light" ? "assets/logos/norton-park-logo-primary-beige.svg" : "assets/logos/norton-park-logo-primary.svg")} alt="" aria-hidden="true" width={1200} height={200} loading={loading} />
          {tone === "auto" && <img className="brand-logo__norton-light" src={asset("assets/logos/norton-park-logo-primary-beige.svg")} alt="" aria-hidden="true" width={1200} height={200} loading={loading} />}
        </span>
      )}
      {variant === "cobrand" && <span className="brand-logo__divider" aria-hidden="true" />}
      {variant !== "norton" && savills}
    </span>
  );
}
