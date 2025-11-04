import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "./ReduxProvider";
import { FontSizeProvider } from "./_components/fontSize";
import { Toaster } from "sonner"; // Import Sonner

export const metadata: Metadata = {
  title:
    "MCH Mumbai – Homoeopathy Practitioner Registration, Notifications & Acts",
  description:
    "Official site of the Maharashtra Council of Homoeopathy (M.C.H.), Mumbai. Offers online registration (provisional, permanent), CCMP applications, Acts & rules, notifications, RTI, FAQs, and more for homoeopathic practitioners in Maharashtra.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`noto-sans-semibold antialiased`}
        suppressHydrationWarning={true}
      >
        <ReduxProvider>
          <FontSizeProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </FontSizeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
