import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/ThemeProvider.tsx"

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

export const metadata = {
  title: "InterviewAI - Master Your Interview Skills",
  description: "Practice with AI-powered mock interviews, get real-time feedback, and nail your dream job. Powered by Gemini AI.",
  keywords: "interview prep, mock interview, AI interview, job preparation, interview practice",
  authors: [{ name: "InterviewAI Team" }],
  openGraph: {
    title: "InterviewAI - Master Your Interview Skills",
    description: "Practice with AI-powered mock interviews and get instant feedback",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    
    <ClerkProvider >
      <html lang="en">
        <body className={`${poppins.className} bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950`}>
          <Toaster />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          </body>
      </html>
    </ClerkProvider>
  );
}
