"use client";

import {useState, useEffect} from "react";
import { fetchConnectedAccounts, type ConnectedAccount } from "./accounts";
import ShortVideoClient from "./short-video/client";

export default function CreatePost() {
    const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

    useEffect(() => {
        async function fetchAccounts() {
            try {
                setIsLoadingAccounts(true);
                setAccounts(await fetchConnectedAccounts());
            } catch (error) {
                console.error("Failed to fetch connected accounts:", error);
            } finally {
                setIsLoadingAccounts(false);
            }
        }
        fetchAccounts();
    }, []);

    return (
        <div className="relative space-y-6 text-foreground">
            {/* No Accounts Modal Overlay */}
            {!isLoadingAccounts && accounts.length === 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8 text-center space-y-8">
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">Connect Your Accounts</h2>
                            <p className="mt-2 text-muted-foreground">You need to connect at least one social media account to start creating and scheduling posts.</p>
                        </div>
                    </div>
                </div>
            )}
            
            <ShortVideoClient />
        </div>
    );
}
