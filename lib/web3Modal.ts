import { projectId, wagmiConfig } from "@/lib/config";
import { createWeb3Modal } from "@web3modal/wagmi";

// Do you have an .env file?
if (!projectId) throw new Error("Project ID is not defined");

export const web3Modal = createWeb3Modal({
    wagmiConfig,
    projectId,
    enableAnalytics: true,
    enableOnramp: true,
});