import { mainnet } from "viem/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi";
import { fallback, http } from "viem";

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID;
export const defaultChain = mainnet;

if (!projectId) throw new Error("Project ID is not defined");

const metadata = {
  name: "Dyad",
  description: "Dyad Stablecoin",
  url: "https://dyadstable.xyz",
  icons: ["https://dyadstable.xyz/favicon-32x32.png"],
};


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

const chains = [defaultChain] as const;
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: {
    [mainnet.id]: defaultTransport
  },
});
