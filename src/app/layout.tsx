import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";
import "./app.css";

export const metadata: Metadata = {
  title: "Summarist",
  description: "Gain more knowledge in less time — great summaries for busy people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
