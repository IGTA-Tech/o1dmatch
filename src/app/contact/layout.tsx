// src/app/contact/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | O1DMatch",
  description:
    "Get in touch with O1DMatch. Questions about the O-1 visa process, employer partnerships, or our platform? We're here to help.",
  openGraph: {
    title: "Contact Us | O1DMatch",
    description:
      "Get in touch with O1DMatch. Questions about the O-1 visa process, employer partnerships, or our platform? We're here to help.",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}