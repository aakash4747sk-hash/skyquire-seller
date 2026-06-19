import { redirect } from "next/navigation";

export default function Home() {
  // Seller app entry → straight to the dashboard (middleware bounces to /login if needed).
  redirect("/dashboard");
}
