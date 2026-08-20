"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2, LayoutDashboard, ArrowLeft, CreditCard } from "lucide-react";

type StatusType = 'loading' | 'success' | 'failed' | 'pending' | 'abandoned' | 'reversed' | 'ongoing' | 'processing' | 'queued' | 'processed';

export function PaymentStatus() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get('reference');
    const subscriptionId = searchParams.get('subscription_id');
    const [status, setStatus] = useState<StatusType>('loading');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        async function checkPaymentStatus(ref: string) {
            try {
                if (reference) {
                    const response = await fetch(`/api/payments/payment-status/${ref}?payment-processor=paystack`);
                    const data = await response.json();

                    if (data.status) {
                        setStatus(data.status);
                    } else if (data.success) {
                        setStatus('success');
                    } else {
                        setStatus('failed');
                    }

                    if (data.message) {
                        setMessage(data.message);
                    }
                } else if (subscriptionId) {
                    const response = await fetch(`/api/payments/payment-status/${subscriptionId}?payment-processor=dodo`);
                    const data = await response.json();

                    if (data.status) {
                        setStatus(data.status);
                    } else if (data.success) {
                        setStatus('success');
                    } else {
                        setStatus('failed');
                    }

                    if (data.message) {
                        setMessage(data.message);
                    }
                }

            } catch (error) {
                setStatus('failed');
                setMessage('Failed to verify payment status. Please contact support.');
            }
        }

        if (reference) {
            checkPaymentStatus(reference);
        } else if (subscriptionId) {
            checkPaymentStatus(subscriptionId)
        } else {
            setStatus('failed');
            setMessage('No payment reference found.');
        }
    }, [reference]);

    const getStatusContent = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />,
                    title: 'Payment Successful',
                    description: 'Your subscription has been successfully updated. You can now enjoy all the features of your new plan.',
                    bg: 'bg-green-500/10'
                };
            case 'processed':
                return {
                    icon: <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />,
                    title: 'Payment Already Verified',
                    description: 'This transaction has already been processed and your subscription is active. No further action is needed.',
                    bg: 'bg-blue-500/10'
                };
            case 'failed':
                return {
                    icon: <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />,
                    title: 'Payment Failed',
                    description: message !== 'Verification successful' ? message : 'The transaction failed. Please try again.',
                    bg: 'bg-red-500/10'
                };
            case 'abandoned':
                return {
                    icon: <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600" />,
                    title: 'Payment Abandoned',
                    description: 'You did not complete the transaction. Please try again if you wish to upgrade.',
                    bg: 'bg-orange-500/10'
                };
            case 'pending':
            case 'ongoing':
            case 'processing':
            case 'queued':
                return {
                    icon: <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 animate-spin" />,
                    title: 'Payment Processing',
                    description: 'Your payment is currently being processed. We will notify you once it is completed.',
                    bg: 'bg-blue-500/10'
                };
            case 'reversed':
                return {
                    icon: <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-600" />,
                    title: 'Payment Reversed',
                    description: 'The transaction was reversed. If this was a mistake, please contact your bank.',
                    bg: 'bg-yellow-500/10'
                };
            default:
                return {
                    icon: <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin" />,
                    title: 'Verifying Payment',
                    description: 'Please wait while we verify your payment status...',
                    bg: 'bg-secondary'
                };
        }
    };

    const content = getStatusContent();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-sm p-6 sm:p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-full ${content.bg}`}>
                        {content.icon}
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-3">{content.title}</h1>
                <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed">
                    {content.description}
                </p>

                <div className="space-y-3">
                    {status === 'success' || status === 'processed' ? (
                        <>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/billing')}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg font-medium transition-colors"
                            >
                                <CreditCard className="h-4 w-4" />
                                View Billing Details
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => router.push('/billing')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Return to Billing
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}