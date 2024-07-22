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
        <div>ETH: $</div>
        <div>{ethPrice.toFixed(0)}</div>
      </div>
      <div className="flex text-gray-400 text-xs pl-2">
        <div>KERO: $</div>
        <div>{kerosenePrice.toFixed(3)}</div>
      </div>
      <div className="flex text-gray-400 text-xs pl-2">
        <div>DV: $</div>
        <div>{fromBigNumber(keroseneVaultAssetPrice, 8).toFixed(4)}</div>
      </div>
      <div className="flex text-gray-400 text-xs pl-2">
        <div>TVL:</div> <div className="pl-1">{formatCurrency(tvl)}</div>
      </div>
    </nav>
  );
}
