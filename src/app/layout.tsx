import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/components/sites/nortonpark/styles/fonts.css";
import "@/components/sites/nortonpark/styles/brand-tokens.css";
import "@/components/sites/nortonpark/styles/page.css";
import "@/components/sites/nortonpark/styles/legal.css";
// Decorative layer: must load after page.css to override section z-index/overflow.
import "@/components/sites/nortonpark/styles/decor.css";
import "@/components/sites/nortonpark/styles/chat-widget.css";
import "@/components/sites/nortonpark/styles/content-protection.css";
import "@/components/sites/nortonpark/styles/clone.css";
import "@/components/sites/nortonpark/styles/savills.css";
import "../../public/sites/nortonpark/interaction-colors.css";
import "@/components/sites/nortonpark/styles/interactions.css";
import "@/components/sites/nortonpark/styles/feedback.css";
import { InlineScript } from "@/components/sites/nortonpark/InlineScript";

export const metadata: Metadata = {
  title: "Norton Park — Gamuda Land | Toạ độ xứng tầm tại Bình Dương",
  description:
    "Website chính thức Norton Park bởi Gamuda Land tại Số 5 Đại lộ Bình Dương, P. Thuận Giao, TP.HCM. Quy mô 7,9 ha, mật độ xây dựng 20%, kế cận AEON & VSIP 1.",
  authors: [{ name: "Gamuda Land" }],
  icons: { icon: "/sites/nortonpark/assets/logos/quacho-symbol-bronze.png" },
  openGraph: {
    title: "Norton Park | A Gamuda Land Community",
    description:
      "Không gian sống mật độ thấp trên Đại lộ Bình Dương, kế cận VSIP 1 và AEON Mall Thuận Giao. Quy mô 7,9 ha, mật độ xây dựng 20% và 2,5 ha diện tích cảnh quan.",
    type: "website",
    siteName: "Norton Park",
    locale: "vi_VN",
  },
};

export const viewport: Viewport = {
  themeColor: "#DCD3C0",
};

/* Motion bootstrap, same as the source <head> script: mark html.mo before
   first paint (skipped for reduced motion). The site's motion hook adds
   .mo-ready once it runs; if it never does, drop .mo so content stays visible. */
const MOTION_BOOT =
  "(function(d){if(!window.matchMedia||!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('mo');" +
  "setTimeout(function(){d.classList.add('mo-ok');if(!d.classList.contains('mo-ready'))d.classList.remove('mo')},6000)}})(document.documentElement)";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <InlineScript html={MOTION_BOOT} />
        <link rel="preload" href="/sites/nortonpark/fonts/seasons-400.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/sites/nortonpark/fonts/gotham-400.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link
          rel="preload"
          href="/sites/nortonpark/assets/images/cgi/design-story-facade.jpg"
          as="image"
          media="(min-width:1041px), (min-width:641px) and (orientation:landscape)"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
