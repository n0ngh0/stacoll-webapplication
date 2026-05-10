import type { Metadata } from "next";
import SigninClient from "./SigninClient";

export const metadata: Metadata = {
  title: "Sign In - STACOLL",
  description: "Log in to access your Skill Wallet.",
};

export default function SignInPage() {
  return <SigninClient />;
}