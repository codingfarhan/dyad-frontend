import ButtonComponent from "@/components/reusable/ButtonComponent";
import NoteCardsContainer from "../components/reusable/NoteCardsContainer";
import { ClaimModalContent } from "./claim-modal-content";
import { useMerklCampaign } from "@/hooks/useMerklCampaign";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useMerklRewards } from "@/hooks/useMerklRewards";
import { formatEther } from "viem";
import {
  keroseneAddress,
  useSimulateDistributorClaim,
  useWriteDistributorClaim,
} from "@/generated";
import { defaultChain } from "@/lib/config";
import useKerosenePrice from "@/hooks/useKerosenePrice";
import { ReactNode, useEffect, useMemo } from "react";

export function EarnKeroseneContent() {
  const { address } = useAccount();

  const { currentCampaign: merklData } = useMerklCampaign();
  const { merklRewards, error, loading, refetch } = useMerklRewards({
    address,
  });

  const { data: claimMerklRewardsConfig, error: claimError } =
    useSimulateDistributorClaim({
      args: [
        [address!],
        [keroseneAddress[defaultChain.id]],
        [merklRewards?.accumulated || 0n],
        [merklRewards?.proof || []],
      ],
      query: {
        enabled:
          address !== undefined &&
          merklRewards !== undefined &&
          merklRewards.accumulated > 0n,
      },
    });

  const { kerosenePrice, error: kerosenePriceError } = useKerosenePrice();

  const { totalUsd, claimableUsd } = useMemo(() => {
    if (!merklRewards || !kerosenePrice) {
      return { totalUsd: "0", claimableUsd: "0" };
    }

    try {
      const totalUsd =
        Number(formatEther(merklRewards.accumulated || 0n)) * kerosenePrice;
      const claimableUsd =
        Number(formatEther(merklRewards.unclaimed || 0n)) * kerosenePrice;

      return {
        totalUsd: totalUsd.toFixed(2).toLocaleString(),
        claimableUsd: claimableUsd.toFixed(2).toLocaleString(),
      };
    } catch (e) {
      console.error("Error calculating USD values", e);
      return { totalUsd: "0", claimableUsd: "0" };
    }
  }, [merklRewards, kerosenePrice]);

  const {
    writeContract: claimMerklRewards,
    data: claimTransactionHash,
    isPending: writingClaim,
  } = useWriteDistributorClaim();

  const { data: claimTransaction, isPending: transactionPending } =
    useWaitForTransactionReceipt({
      hash: claimTransactionHash,
    });

  useEffect(() => {
    if (!!address && claimTransaction?.status === "success") {
      refetch(address);
    }
  }, [address, claimTransaction, refetch]);

  const renderCard = (
    step: string,
    description: string,
    bottomComponent: ReactNode,
    renderKey: any
  ) => (
    <NoteCardsContainer key={renderKey}>
      <div className="text-sm font-semibold text-[#A1A1AA]">
        <div className="flex w-full flex justify-between items-center">
          <div className="text-lg w-1/3 md:w-auto md:text-2xl text-[#FAFAFA] transition-all">
            {step}
          </div>
          <div className="text-xs md:text-base w-2/3 md:w-auto md:text-md text-right">
            {description}
          </div>
        </div>
        {bottomComponent}
      </div>
    </NoteCardsContainer>
  );

  const cardsData = [
    {
      step: "Step 1",
      description: "Claim or buy a Note",
      bottomComponent: (
        <div className="flex justify-between mt-[32px] w-full">
          <div className="w-full flex gap-4">
            <ClaimModalContent />
          </div>
        </div>
      ),
    },
    {
      step: "Step 2",
      description: "Deposit collateral and mint DYAD",
      bottomComponent: (
        <div className="flex justify-between mt-[32px] w-full">
          <div className="w-full">
            <ButtonComponent
              onClick={() => {
                window.open(window.location.origin + "?tab=notes", "_self");
              }}
            >
              <div className="text-xs md:text-[0.875rem] transition-all">
                Switch to Manage Notes tab
              </div>
            </ButtonComponent>
          </div>
        </div>
      ),
    },
    {
      step: "Step 3",
      description: "Provide liquidity to USDC - DYAD on Uniswap v3",
      bottomComponent: (
        <div className="flex justify-between mt-[32px] w-full">
          <div className="w-full">
            <ButtonComponent
              onClick={() =>
                window.open(
                  "https://app.uniswap.org/add/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/0xFd03723a9A3AbE0562451496a9a394D2C4bad4ab/500?minPrice=1.003256&maxPrice=1.005265"
                )
              }
            >
              <div className="text-xs md:text-[0.875rem] transition-all">
                LP USDC - DYAD on Uniswap V3
              </div>
            </ButtonComponent>
          </div>
        </div>
      ),
    },
    {
      step: "Step 4",
      description: "Claim rewards from Merkl",
      bottomComponent: (
        <div className="flex flex-col gap-4 justify-between mt-[32px] w-full">
          {address === undefined ? (
            <>
              <p className="text-xs md:text-[0.875rem] transition-all">
                Connect Wallet to see rewards or
              </p>
              <ButtonComponent
                onClick={() => window.open("https://merkl.angle.money/user/")}
              >
                <div className="text-xs md:text-[0.875rem] transition-all">
                  Check your earnings on Merkl
                </div>
              </ButtonComponent>
            </>
          ) : (
            <>
              <div className="w-full grid grid-cols-3">
                {loading ? (
                  <p className="text-xs md:text-[0.875rem] transition-all">
                    Loading...
                  </p>
                ) : error ? (
                  <p className="col-span-3 text-xs md:text-[0.875rem] transition-all">
                    {error.message || "An error occurred"}
                  </p>
                ) : kerosenePriceError ? (
                  <p className="col-span-3 text-xs md:text-[0.875rem] transition-all">
                    {kerosenePriceError.message || "Failed to load price"}
                  </p>
                ) : (
                  <>
                    <p className="text-xs md:text-[0.875rem] transition-all">
                      Your total earnings
                    </p>
                    <p className="text-xs md:text-[0.875rem] transition-all">
                      {Number(
                        formatEther(merklRewards?.accumulated || 0n)
                      ).toLocaleString()}{" "}
                      KEROSENE
                    </p>
                    <p className="text-xs md:text-[0.875rem] transition-all">{`$${totalUsd}`}</p>
                    <p className="text-xs md:text-[0.875rem] transition-all">
                      Total claimable
                    </p>
                    <p className="text-xs md:text-[0.875rem] transition-all">
                      {Number(
                        formatEther(merklRewards?.unclaimed || 0n)
                      ).toLocaleString()}{" "}
                      KEROSENE
                    </p>
                    <p className="text-xs md:text-[0.875rem] transition-all">{`$${claimableUsd}`}</p>
                  </>
                )}
              </div>
              {merklRewards &&
                claimMerklRewardsConfig !== undefined &&
                claimError === null && (
                  <div className="w-full flex gap-4">
                    <ButtonComponent
                      disabled={
                        merklRewards.unclaimed === 0n ||
                        writingClaim ||
                        (claimTransactionHash && transactionPending)
                      }
                      onClick={() => {
                        claimMerklRewards(claimMerklRewardsConfig.request);
                      }}
                    >
                      <div className="text-xs md:text-[0.875rem] transition-all">
                        {merklRewards.unclaimed === 0n
                          ? "Nothing to claim"
                          : writingClaim ||
                              (claimTransactionHash && transactionPending)
                            ? "Claiming..."
                            : "Claim"}
                      </div>
                    </ButtonComponent>
                    <ButtonComponent
                      onClick={() => {
                        window.open(
                          `https://merkl.angle.money/ethereum/pool/0x8B238f615c1f312D22A65762bCf601a37f1EeEC7?campaignId=${merklData?.campaignId}`
                        );
                      }}
                    >
                      <div className="text-xs md:text-[0.875rem] transition-all">
                        View campaign on Merkl
                      </div>
                    </ButtonComponent>
                  </div>
                )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {merklData && (
        <div className="flex justify-between md:text-2xl p-2 pb-4 md:p-[2rem] md:pl-[5rem] md:pr-[5rem] font-bold transition-all">
          <div className="flex">
            <span>{merklData.apr?.toFixed(0) || 0}%</span>
            <span className="ml-2">APR</span>
          </div>
          <div className="flex">
            <span>Liquidity:</span>{" "}
            <span className="ml-2">
              ${Number(merklData.tvl?.toFixed(0) || 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        {cardsData.map((data) =>
          renderCard(
            data.step,
            data.description,
            data.bottomComponent,
            data.step
          )
        )}
      </div>
    </div>
  );
}
