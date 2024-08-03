"use client";

import { useState } from "react";
import ButtonComponent from "@/components/reusable/ButtonComponent";
import { BigIntInput } from "@/components/reusable/BigIntInput";
import { useTransactionStore } from "@/lib/store";
import {
  useReadDyadBalanceOf,
  useReadDyadMintedDyad,
  useReadVaultManagerGetTotalValue,
  useReadVaultManagerMinCollatRatio,
  vaultManagerAbi,
  useReadVaultManagerGetVaultsValues,
  vaultManagerAddress,
} from "@/generated";
import { defaultChain } from "@/lib/config";
import { useAccount } from "wagmi";
import { formatNumber, fromBigNumber, toBigNumber } from "@/lib/utils";
import { maxUint256 } from "viem";

interface MintProps {
  tokenId: string;
  dyadMinted: string;
  currentCr: bigint | undefined;
}

const Mint: React.FC<MintProps> = ({ dyadMinted, currentCr, tokenId }) => {
  const [mintInputValue, setMintInputValue] = useState("");
  const [burnInputValue, setBurnInputValue] = useState("");
  const { setTransactionData } = useTransactionStore();

  const { address } = useAccount();

  const { data: exoCollat } = useReadVaultManagerGetVaultsValues({
    args: [BigInt(tokenId)],
  });

  const { data: mintedDyad } = useReadDyadMintedDyad({
    args: [BigInt(tokenId)],
    chainId: defaultChain.id,
  });

  const { data: dyadBalance } = useReadDyadBalanceOf({
    args: [address!],
    chainId: defaultChain.id,
    query: {
      enabled: !!address,
    },
  });

  const { data: collateralValue } = useReadVaultManagerGetTotalValue({
    args: [BigInt(tokenId)],
    chainId: defaultChain.id,
  });

  const { data: minCollateralizationRatio } = useReadVaultManagerMinCollatRatio(
    { chainId: defaultChain.id }
  );

  const newCr =
    (mintedDyad || 0n) +
      (BigInt(mintInputValue) || 0n) -
      (BigInt(burnInputValue) || 0n) !==
    0n
      ? ((collateralValue || 0n) * 100n) /
        ((mintedDyad || 0n) +
          (BigInt(mintInputValue) || 0n) -
          (BigInt(burnInputValue) || 0n))
      : 0n;

  const onMaxMintHandler = () => {
    const collateral = fromBigNumber(collateralValue);
    const minCollatRatio = fromBigNumber(minCollateralizationRatio);
    const mintedDyadAmount = fromBigNumber(mintedDyad);

    // Calculate mintable DYAD from Collateral Ratio (CR)
    const mintableDyadFromCR = toBigNumber(
      Math.round(
        (collateral - minCollatRatio * mintedDyadAmount) / minCollatRatio
      )
    );

    // Get exogenous collateral if available, else set to 0
    const exoCollatValue = exoCollat ? fromBigNumber(exoCollat[0]) : 0n;

    // Calculate mintable DYAD from exogenous collateral
    const mintableDyadFromExoCollat = exoCollatValue - mintedDyadAmount;

    // Set the mint input value to the smaller of the two calculated values
    const mintableDyad =
      mintableDyadFromExoCollat > mintableDyadFromCR
        ? mintableDyadFromCR
        : toBigNumber(Math.round(mintableDyadFromExoCollat));

    setMintInputValue(mintableDyad.toString());
  };

  const onMaxBurnHandler = () => {
    const minted = mintedDyad || 0n;
    const balance = dyadBalance || 0n;
    const min = minted < balance ? minted : balance;
    setBurnInputValue(min.toString());
  };

  if (collateralValue === 0n && !collateralValue) {
    return <p>Deposit collateral to mint DYAD</p>;
  }

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
                description: `Mint ${fromBigNumber(mintInputValue)} DYAD increasing collateralization ratio to ~${newCr.toString()}%`,
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
                description: `Burn ${fromBigNumber(burnInputValue)} DYAD to reduce collateralization ratio to ~${newCr.toString()}%`,
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
        <div className="flex">
          <div className="mr-[5px]">DYAD minted:</div>
          <div>{dyadMinted}</div>
        </div>
        {exoCollat && (
          <div className="flex">
            <div className="mr-[5px]">Exogenous Collateral:</div>
            <div>${formatNumber(fromBigNumber(exoCollat[0], 18))}</div>
          </div>
        )}
        <div className="flex">
          <div className="mr-[5px]">Current CR:</div>
          <p>
            {currentCr === maxUint256
              ? "Infinity"
              : `${formatNumber(fromBigNumber(currentCr, 16))}%`}
          </p>
        </div>
        {(mintInputValue || burnInputValue) && (
          <div className="flex">
            <div className="mr-[5px]">New CR:</div>
            <div>{newCr === 0n ? "Infinity" : newCr.toString()}%</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Mint;
