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
  weEthVaultAddress,
  weEthAddress,
} from "@/generated";
import { defaultChain } from "@/lib/config";

export const vaultInfo = [
  {
    vaultAddress: wEthVaultAddress[defaultChain.id],
    symbol: "wETH",
    tokenAddress: wethAddress[defaultChain.id],
    decimals: 8,
  },
  {
    vaultAddress: wstEthVaultAddress[defaultChain.id],
    symbol: "wstETH",
    tokenAddress: wstEthAddress[defaultChain.id],
    decimals: 8,
  },
  {
    vaultAddress: keroseneVaultV2Address[defaultChain.id],
    symbol: "KEROSENE",
    tokenAddress: keroseneAddress[defaultChain.id],
    decimals: 8,
  },
  {
    vaultAddress: tBtcVaultAddress[defaultChain.id],
    symbol: "tBTC",
    tokenAddress: tBtcAddress[defaultChain.id],
    decimals: 8,
  },
  {
    vaultAddress: sUsDeVaultAddress[defaultChain.id],
    symbol: "sUSDe",
    tokenAddress: sUsDeAddress[defaultChain.id],
    decimals: 8,
  },
  {
    vaultAddress: weEthVaultAddress[defaultChain.id],
    symbol: "weETH",
    tokenAddress: weEthAddress[defaultChain.id],
    decimals: 18,
  },
];
