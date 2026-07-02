import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./_components/AdminLayoutClient";

export const metadata = {
  title: "Admin Panel — InterviewAI",
  description: "Monitor users, interviews, and platform activity",
};

export default async function AdminLayout({ children }) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses?.[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!email || !adminEmail || email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
    redirect("/dashboard");
  }

  return <AdminLayoutClient userEmail={email}>{children}</AdminLayoutClient>;
}
