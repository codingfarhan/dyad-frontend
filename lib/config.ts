import { mainnet } from "viem/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;
export const defaultChain = mainnet;

if (!projectId) throw new Error("Project ID is not defined");

const chains = [defaultChain] as const;

export const wagmiConfig = getDefaultConfig({
  appName: "DYAD",
  projectId: projectId,
  chains,
  appDescription: "DYAD Stablecoin",
  appUrl: "https://app.dyadstable.xyz",
  appIcon: "https://app.dyadstable.xyz/favicon-32x32.png",
})

