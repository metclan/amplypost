import CreateAccountForm from "./create-account";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Account | Amplypost",
    description: "Create an account to get started",
}

export default function CreateAccountPage() {
    return <CreateAccountForm />;
}
