import useEthPrice from "@/hooks/useEthPrice";
import useTvl from "@/hooks/useTvl";
import useKerosenePrice from "@/hooks/useKerosenePrice";
import { useReadKeroseneVaultV2AssetPrice } from "@/generated";
import React from "react";
import { fromBigNumber } from "@/lib/utils";

function MobileNotSupported() {
  const { ethPrice } = useEthPrice();
  const { kerosenePrice } = useKerosenePrice();
  const { data: kerosene } = useReadKeroseneVaultV2AssetPrice();
  const { tvl } = useTvl();

  return (
    <main className="mobile-view">
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-2xl text-center">
          <h3 className="text-4xl font-bold mb-[30px]">DYAD</h3>
          <div className="flex flex-col gap-4 items-center">
            <a
              href="https://www.coingecko.com/en/coins/ethereum"
              target="_blank"
              rel="noopener noreferrer"
              className="flex text-gray-400 text-xs "
            >
              <div className="font-semibold">ETH:</div>
              <div className="pl-1">${ethPrice.toFixed(0)}</div>
            </a>
            <a
              href="https://defillama.com/protocol/dyad#information"
              target="_blank"
              rel="noopener noreferrer"
              className="flex text-gray-400 text-xs "
            >
              <div className="font-semibold">TVL:</div>
              <div className="pl-1">${(tvl / 1000000).toFixed(2) + "M"}</div>
            </a>
            <a
              href="https://www.coingecko.com/en/coins/kerosene"
              target="_blank"
              rel="noopener noreferrer"
              className="flex text-gray-400 text-xs "
            >
              <div className="font-semibold">KERO:</div>
              <div className="pl-1">${kerosenePrice.toFixed(3)}</div>
            </a>
            <div className="flex text-gray-400 text-xs ">
              <div className="font-semibold">DV:</div>
              <div className="pl-1">
                ${fromBigNumber(kerosene, 8).toFixed(4)}
              </div>
            </div>
            <div className="mt-4 text-sm">
              Use the web app to interact with your Notes.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MobileNotSupported;
