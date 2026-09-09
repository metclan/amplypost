import VerifyEmailForm from "./verify-email";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Verify Email | Amplypost",
    description: "Verify your email address",
};

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailForm />
        </Suspense>
    );
}
