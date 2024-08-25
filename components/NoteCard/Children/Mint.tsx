"use client";

import { useMemo, useState } from "react";
import ButtonComponent from "@/components/reusable/ButtonComponent";
import { BigIntInput } from "@/components/reusable/BigIntInput";
import { useTransactionStore } from "@/lib/store";
import {
  vaultManagerAbi,
  vaultManagerAddress,
  dyadAbi,
  dyadAddress,
} from "@/generated";
import { defaultChain } from "@/lib/config";
import { useAccount, useReadContracts } from "wagmi";
import { formatNumber, fromBigNumber, toBigNumber } from "@/lib/utils";
import { maxUint256 } from "viem";

interface MintProps {
  tokenId: string;
  currentCr: bigint | undefined;
}

const Mint = ({ currentCr, tokenId }: MintProps) => {
  const [mintInputValue, setMintInputValue] = useState("");
  const [burnInputValue, setBurnInputValue] = useState("");
  const { setTransactionData } = useTransactionStore();

  const { address } = useAccount();

  const { data: contractData } = useReadContracts({
    contracts: [
      {
        address: vaultManagerAddress[defaultChain.id],
        abi: vaultManagerAbi,
        functionName: "getVaultsValues",
        args: [BigInt(tokenId)],
      },
      {
        address: dyadAddress[defaultChain.id],
        abi: dyadAbi,
        functionName: "mintedDyad",
        args: [BigInt(tokenId)],
      },
      {
        address: dyadAddress[defaultChain.id],
        abi: dyadAbi,
        functionName: "balanceOf",
        args: [address!],
      },
      {
        address: vaultManagerAddress[defaultChain.id],
        abi: vaultManagerAbi,
        functionName: "MIN_COLLAT_RATIO",
        args: [],
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!address,
      select: (data) => {
        const exoCollat = data[0][0];
        const keroCollat = data[0][1];
        const mintedDyad = data[1];
        const dyadBalance = data[2];
        const minCollateralizationRatio = data[3];

        return {
          exoCollat,
          keroCollat,
          totalCollateral: exoCollat + keroCollat,
          mintedDyad,
          dyadBalance,
          minCollateralizationRatio,
        };
      },
    },
  });

  const newCr = useMemo(() => {

    let burnAmount = fromBigNumber(burnInputValue);
    let mintAmount = fromBigNumber(mintInputValue);

    if (isNaN(burnAmount)) burnAmount = 0;
    if (isNaN(mintAmount)) mintAmount = 0
    
    const newMintedDyad = fromBigNumber(contractData?.mintedDyad) + mintAmount - burnAmount;
    if (newMintedDyad < 0) return 0;

    const collateral = fromBigNumber(contractData?.totalCollateral);
    return collateral / newMintedDyad * 100;

  }, [burnInputValue, mintInputValue, contractData]);

  const onMaxMintHandler = () => {
    const exoCollateral = fromBigNumber(contractData?.exoCollat);
    const collateral = fromBigNumber(contractData?.totalCollateral);
    const minCollatRatio = fromBigNumber(
      contractData?.minCollateralizationRatio
    ) + 0.01;
    const mintedDyadAmount = fromBigNumber(contractData?.mintedDyad);

    // Calculate mintable DYAD from total eligible collateral
    // even with kerosene, user can mint at most dyad matching their exogenous collateral value
    const mintableDyad = Math.min(
      collateral / minCollatRatio - mintedDyadAmount,
      (exoCollateral - mintedDyadAmount) * 0.995 // 0.995 for safety factor/floating point
    );

    if (mintableDyad < 0) {
      setMintInputValue("0");
      return;
    }

    setMintInputValue(toBigNumber(mintableDyad.toString(), 18).toString());
  };

  const onMaxBurnHandler = () => {
    const minted = contractData?.mintedDyad || 0n;
    const balance = contractData?.dyadBalance || 0n;
    const min = minted < balance ? minted : balance;
    setBurnInputValue(min.toString());
  };

  if (contractData?.exoCollat === 0n && !contractData?.exoCollat) {
    return <p>Deposit collateral to mint DYAD</p>;
  }

  const StackedValue = ({
    description,
    value,
  }: {
    description: string;
    value: string;
  }) => {
    return (
      <div className="flex flex-col">
        <div className="mr-[5px]">{description}:</div>
        <div>{value}</div>
      </div>
    );
  };

  return (
    <div className="text-sm font-semibold text-[#A1A1AA]">
      <div className="flex justify-between mt-[32px] w-full">
        <div className="w-[380px] ">
          <BigIntInput
            value={mintInputValue}
            onChange={(value) => setMintInputValue(value)}
            placeholder="Amount of DYAD to mint..."
          />
        </div>
        <div className="w-[74px]">
          <ButtonComponent variant="bordered" onClick={onMaxMintHandler}>
            Max
          </ButtonComponent>
        </div>
        <div className="w-[128px]">
          <ButtonComponent
            onClick={() => {
              setTransactionData({
                config: {
                  address: vaultManagerAddress[defaultChain.id],
                  abi: vaultManagerAbi,
                  functionName: "mintDyad",
                  args: [tokenId, mintInputValue, address],
                },
                description: `Mint ${fromBigNumber(mintInputValue)} DYAD decreasing collateralization ratio to ~${newCr.toString()}%`,
              });
              setMintInputValue("");
            }}
            disabled={!mintInputValue}
          >
            Mint
          </ButtonComponent>
        </div>
      </div>
      <div className="flex justify-between mt-[32px] w-full">
        <div className="w-[380px] ">
          <BigIntInput
            value={burnInputValue}
            onChange={(value) => setBurnInputValue(value)}
            placeholder="Amount of DYAD to burn..."
          />
        </div>
        <div className="w-[74px]">
          <ButtonComponent variant="bordered" onClick={onMaxBurnHandler}>
            Max
          </ButtonComponent>
        </div>
        <div className="w-[128px]">
          <ButtonComponent
            onClick={() => {
              setTransactionData({
                config: {
                  address: vaultManagerAddress[defaultChain.id],
                  abi: vaultManagerAbi,
                  functionName: "burnDyad",
                  args: [tokenId, burnInputValue],
                },
                description: `Burn ${fromBigNumber(burnInputValue)} DYAD to increase collateralization ratio to ~${newCr.toString()}%`,
              });
              setBurnInputValue("");
            }}
            disabled={!burnInputValue}
          >
            Burn
          </ButtonComponent>
        </div>
      </div>
      <div className="flex justify-between mt-[32px]">
        <StackedValue
          description="DYAD minted"
          value={formatNumber(
            fromBigNumber(contractData?.mintedDyad).toFixed(2)
          )}
        />
        <StackedValue
          description="Exo Collateral"
          value={formatNumber(
            fromBigNumber(contractData?.exoCollat).toFixed(2)
          )}
        />
        <StackedValue
          description="Kero Collateral"
          value={formatNumber(fromBigNumber(contractData?.keroCollat))}
        />
        <StackedValue
          description="Current CR"
          value={
            currentCr === maxUint256
              ? "Infinity"
              : `${formatNumber(fromBigNumber(currentCr, 16))}%`
          }
        />

        {(mintInputValue || burnInputValue) && (
          <StackedValue
            description="New CR"
            value={newCr === 0 ? "Infinity" : `${formatNumber(newCr)}%`}
          />
        )}
      </div>
    </div>
  );
};
export default Mint;
