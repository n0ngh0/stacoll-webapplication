import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Sign Up - STACOLL",
  description: "Create an account  to access your Skill Wallet.",
};

export default function SignUpPage() {
  return <SignupClient />;
}