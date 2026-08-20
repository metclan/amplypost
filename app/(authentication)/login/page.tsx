import LoginForm from "./login";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Amplypost",
    description: "Login to your account",
}
export default function LoginPage() {
    return <LoginForm />;
}
