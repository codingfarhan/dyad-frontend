import Link from "next/link";

import { cn } from "@/lib/utils";
import useEthPrice from "@/hooks/useEthPrice";
import useTvl from "@/hooks/useTvl";
import useKerosenePrice from "@/hooks/useKerosenePrice";
import { useReadKeroseneVaultV2AssetPrice } from "@/generated";
import { fromBigNumber } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { ethPrice } = useEthPrice();
  const { kerosenePrice } = useKerosenePrice();

  const { data: keroseneVaultAssetPrice } = useReadKeroseneVaultV2AssetPrice();
  const { tvl } = useTvl();

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
      <div className="flex text-gray-400 text-xs pl-4">
        <div className="font-semibold">ETH:</div>
        <div className="pl-1">${ethPrice.toFixed(0)}</div>
      </div>
      <div className="flex text-gray-400 text-xs pl-1">
        <div className="font-semibold">TVL:</div>
        <div className="pl-1">{formatCurrency(tvl)}</div>
      </div>
      <div className="flex text-gray-400 text-xs pl-6">
        <div className="font-semibold">KERO:</div>
        <div className="pl-1">${kerosenePrice.toFixed(3)}</div>
      </div>
      <div className="flex text-gray-400 text-xs pl-1">
        <div className="font-semibold">DV:</div>
        <div className="pl-1">
          ${fromBigNumber(keroseneVaultAssetPrice, 8).toFixed(4)}
        </div>
      </div>
    </nav>
  );
}
