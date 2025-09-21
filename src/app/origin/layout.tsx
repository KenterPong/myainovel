import type { Metadata } from "next";

export const metadata: Metadata = {
  title: '故事起源',
  description: '依照讀者投票結果，產生故事起源。',
};

export default function OriginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
