import { mainnet } from "viem/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { walletConnectWallet, coinbaseWallet, injectedWallet, safeWallet, metaMaskWallet, rabbyWallet } from "@rainbow-me/rainbowkit/wallets";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { createConfig, fallback, http } from "wagmi";
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;
export const defaultChain = mainnet;

if (!projectId) throw new Error("Project ID is not defined");

const chains = [defaultChain] as const;

let defaultTransport;
if (process.env.NEXT_PUBLIC_RPC_URL) {
  defaultTransport = fallback(
    [
      http(process.env.NEXT_PUBLIC_RPC_URL),
      http()
    ]
  )
}
else {
  defaultTransport = http();
}

const wallets = getDefaultWallets({
  appName: "DYAD",
  projectId: projectId,
  appDescription: "DYAD Stablecoin",
  appUrl: "https://app.dyadstable.xyz",
  appIcon: "https://app.dyadstable.xyz/favicon-32x32.png",
});

wallets.wallets.unshift({
  groupName: "Recommended",
  wallets: [
    metaMaskWallet,
    rabbyWallet,
    coinbaseWallet,
    walletConnectWallet,
    safeWallet,
  ],
})

const connectors = connectorsForWallets(wallets.wallets, {
  projectId: projectId,
  appName: "DYAD",
  appDescription: "DYAD Stablecoin",
  appUrl: "https://app.dyadstable.xyz",
  appIcon: "https://app.dyadstable.xyz/favicon-32x32.png",
})

export const wagmiConfig = createConfig({
  connectors: connectors,
  chains,
  transports: {
    [defaultChain.id]: defaultTransport,
  }
});
