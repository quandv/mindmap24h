import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindMap - Visual Thought Organizer',
  description: 'Simple local-only mind-map editor inspired by Whimsical',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-100 selection:text-indigo-800">
        {children}
      </body>
    </html>
  );
}
