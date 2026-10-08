import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'MessMeal - Smart Mess & Meal Tracker',
  description: 'Natural language mess meal and expense management web app. Track daily meals, bazar costs, utility bills, member deposits, and live meal rate calculations.',
  openGraph: {
    title: 'MessMeal - Smart Mess & Meal Tracker',
    description: 'Natural language mess meal and expense management web app. Track daily meals, bazar costs, utility bills, member deposits, and live meal rate calculations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MessMeal - Smart Mess & Meal Tracker',
    description: 'Natural language mess meal and expense management web app. Track daily meals, bazar costs, utility bills, member deposits, and live meal rate calculations.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
