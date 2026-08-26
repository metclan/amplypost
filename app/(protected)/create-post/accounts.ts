import { fetchAccounts, type ConnectedAccount } from "@/lib/client-data";

export type { ConnectedAccount };

export async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
    return fetchAccounts();
}
