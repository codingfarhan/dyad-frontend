import Link from "next/link";
import { cn } from "@/lib/utils";
import useEthPrice from "@/hooks/useEthPrice";
import useTvl from "@/hooks/useTvl";
import useKerosenePrice from "@/hooks/useKerosenePrice";
import { useReadKeroseneVaultV2AssetPrice } from "@/generated";
import { fromBigNumber } from "@/lib/utils";
import React from 'react';

export const MainNav = React.memo(function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const {
    ethPrice,
    isLoading: ethPriceLoading,
    error: ethPriceError,
  } = useEthPrice();
  const {
    kerosenePrice,
    isLoading: kerosenePriceLoading,
    error: kerosenePriceError,
  } = useKerosenePrice();

  const {
    data: keroseneVaultAssetPrice,
    isLoading: keroseneVaultLoading,
    error: keroseneVaultError,
  } = useReadKeroseneVaultV2AssetPrice();
  const { tvl, isLoading: tvlLoading, error: tvlError } = useTvl();

  const ethPriceDisplay = ethPriceError
    ? "N/A"
    : ethPriceLoading
      ? "Loading..."
      : `$${ethPrice?.toFixed(0)}`;
  const kerosenePriceDisplay = kerosenePriceError
    ? "N/A"
    : kerosenePriceLoading
      ? "Loading..."
      : `$${kerosenePrice?.toFixed(4)}`;
  const tvlDisplay = tvlError
    ? "N/A"
    : tvlLoading
      ? "Loading..."
      : `$${(tvl / 1000000).toFixed(2)}M`;
  const keroseneVaultDisplay = keroseneVaultError
    ? "N/A"
    : keroseneVaultLoading
      ? "Loading..."
      : `$${fromBigNumber(keroseneVaultAssetPrice, 8).toFixed(4)}`;

  return (
    <nav
      className={cn("flex justify-start items-center ", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-2xl font-bold transition-colors hover:text-primary"
      >
        DYAD
      </Link>
      <a
        href="https://www.coingecko.com/en/coins/ethereum"
        target="_blank"
        rel="noopener noreferrer"
        className="flex text-gray-400 text-xs pl-4"
      >
        <div className="font-semibold">ETH:</div>
        <div className="pl-1">{ethPriceDisplay}</div>
      </a>
      <a
        href="https://defillama.com/protocol/dyad#information"
        target="_blank"
        rel="noopener noreferrer"
        className="flex text-gray-400 text-xs pl-2"
      >
        <div className="font-semibold">TVL:</div>
        <div className="pl-1">{tvlDisplay}</div>
      </a>
      <a
        href="https://www.coingecko.com/en/coins/kerosene"
        target="_blank"
        rel="noopener noreferrer"
        className="flex text-gray-400 text-xs pl-6"
      >
        <div className="font-semibold">KERO:</div>
        <div className="pl-1">{kerosenePriceDisplay}</div>
      </a>
      <div className="flex text-gray-400 text-xs pl-1">
        <div className="font-semibold">DV:</div>
        <div className="pl-1">{keroseneVaultDisplay}</div>
      </div>
    </nav>
  );
})