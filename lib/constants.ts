import {
  wEthVaultAddress,
  wstEthAddress,
  wethAddress,
  wstEthVaultAddress,
  keroseneAddress,
  keroseneVaultAddress,
  keroseneVaultV2Address,
  tBtcVaultAddress,
  tBtcAddress,
  sUsDeVaultAddress,
  sUsDeAddress,
} from "@/generated";
import { defaultChain } from "@/lib/config";

type ColorCode = `#${string}`

export type VaultInfo = {
  vaultAddress: `0x${string}`;
  symbol: string;
  tokenAddress: `0x${string}`;
  color: ColorCode;
  decimals: number;
  getApr?: () => Promise<number>;
};

export const vaultInfo: VaultInfo[] = [
  {
    vaultAddress: wEthVaultAddress[defaultChain.id],
    symbol: "wETH",
    tokenAddress: wethAddress[defaultChain.id],
    color: "#676767",
    decimals: 8
  },
  {
    vaultAddress: wstEthVaultAddress[defaultChain.id],
    symbol: "wstETH",
    tokenAddress: wstEthAddress[defaultChain.id],
    color: "#00A3FF",
    decimals: 8,
    getApr: async () => {
      const resp = await fetch("https://eth-api.lido.fi/v1/protocol/steth/apr/sma");
      const data = await resp.json();
      return data.data.smaApr;
    }
  },
  {
    vaultAddress: keroseneVaultV2Address[defaultChain.id],
    symbol: "KEROSENE",
    tokenAddress: keroseneAddress[defaultChain.id],
    color: "#EDEDED",
    decimals: 8
  },
  {
    vaultAddress: tBtcVaultAddress[defaultChain.id],
    symbol: "tBTC",
    tokenAddress: tBtcAddress[defaultChain.id],
    color: "#FF9900",
    decimals: 8
  },
  {
    vaultAddress: sUsDeVaultAddress[defaultChain.id],
    symbol: "sUSDe",
    tokenAddress: sUsDeAddress[defaultChain.id],
    color: "#2A2A2A",
    decimals: 8,
    getApr: async () => {
      const resp = await fetch("https://ethena.fi/api/yields/protocol-and-staking-yield");
      const data = await resp.json();
      return data.stakingYield.value;
    },
  },
  // {
  //   vaultAddress: weEthVaultAddress[defaultChain.id],
  //   symbol: "weETH",
  //   tokenAddress: weEthAddress[defaultChain.id],
  //   color: "#301267",
  //   decimals: 18,
  //   getApr: async () => {
  //       const resp = await fetch("https://www.etherfi.bid/api/etherfi/apr");
  //       const data = await resp.json();
  //       const lastValue = data.latest_aprs.slice(-1);
  //       const apr = parseFloat(lastValue) / 0.9 / 100;
  //       return apr;
  //   }
  // }
];
