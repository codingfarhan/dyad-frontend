import { useEffect, useMemo, useState } from "react";
import {
  encodeAbiParameters,
  formatEther,
  getAddress,
  keccak256,
  parseEther,
} from "viem";
import claimData from "@/lib/snapshot-data.json";
import MerkleTree from "merkletreejs";
import { useAccount } from "wagmi";
import {
  keroseneDnftClaimAddress,
  useReadDNftBalanceOf,
  useReadKeroseneAllowance,
  useReadKeroseneBalanceOf,
  useReadKeroseneDnftClaimPrice,
  useReadKeroseneDnftClaimPurchased,
  useReadMerkleClaimErc20HasClaimed,
  useSimulateKeroseneApprove,
  useSimulateKeroseneDnftClaimBuyNote,
  useWriteKeroseneApprove,
  useWriteKeroseneDnftClaimBuyNote,
} from "@/generated";
import { defaultChain } from "@/lib/config";
import ButtonComponent from "./reusable/ButtonComponent";

export const BuyNoteWithKerosene = () => {
  const [dontShowBuyNoteWithKerosene, setDontShowBuyNoteWithKerosene] =
    useState(() => {
        return localStorage.getItem("dontShowBuyNoteWithKerosene") === "true";
    });
  const getBuyLeaf = (address: string) =>
    keccak256(
      encodeAbiParameters([{ type: "address" }], [getAddress(address)])
    );

  const buyNoteTree = useMemo(() => {
    const leaves = claimData.map((data) => getBuyLeaf(data.address));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });

    return tree;
  }, []);

  const { address } = useAccount();

  const claimAmount = useMemo(() => {
    const data = claimData.find(
      (data) => data.address.toLowerCase() === address?.toLowerCase()
    );
    return parseEther(data?.amount || "0");
  }, [address]);

  const { data: hasClaimed, refetch: reloadHasClaimed } =
    useReadMerkleClaimErc20HasClaimed({
      args: [address!],
      chainId: defaultChain.id,
      query: {
        enabled: !!address,
      },
    });

  const { data: buyNotePrice } = useReadKeroseneDnftClaimPrice({
    chainId: defaultChain.id,
  });

  const { data: remainingPurchases } = useReadDNftBalanceOf({
    args: [keroseneDnftClaimAddress[defaultChain.id]],
  });

  const { data: purchasedNote, refetch: reloadPurchaseStatus } =
    useReadKeroseneDnftClaimPurchased({
      args: [address!],
      chainId: defaultChain.id,
      query: {
        enabled: !!address,
      },
    });

  const { data: keroseneBalance, refetch: reloadKeroseneBalance } =
    useReadKeroseneBalanceOf({
      chainId: defaultChain.id,
      args: [address!],
      query: {
        enabled: !!address,
        refetchInterval: 10000,
      },
    });

  const { data: keroseneAllowance, refetch: reloadAllowance } =
    useReadKeroseneAllowance({
      chainId: defaultChain.id,
      args: [address!, keroseneDnftClaimAddress[defaultChain.id]],
      query: {
        enabled: !!address,
      },
    });

  const { data: keroseneApprovalConfig, error: keroseneApprovalError } =
    useSimulateKeroseneApprove({
      args: [keroseneDnftClaimAddress[defaultChain.id], buyNotePrice || 0n],
      query: {
        enabled: !!address && (keroseneAllowance || 0n) < buyNotePrice!,
      },
    });

  const {
    writeContract: approveKerosene,
    data: approveKeroseneTransactionHash,
  } = useWriteKeroseneApprove();

  const buyProof = useMemo(() => {
    if (!address) return [];

    return buyNoteTree
      .getHexProof(getBuyLeaf(address))
      .map((p) => p as `0x${string}`);
  }, [address, buyNoteTree]);

  const { data: buyNoteConfig, error: buyNoteError } =
    useSimulateKeroseneDnftClaimBuyNote({
      query: {
        enabled: !!address && purchasedNote === false,
      },
      args: [buyProof],
    });

  const { writeContract: buyNoteWithKerosene, data: buyNoteTransactionHash } =
    useWriteKeroseneDnftClaimBuyNote();

  return (
    <>
      {!dontShowBuyNoteWithKerosene &&
        address &&
        buyProof.length > 0 &&
        !purchasedNote &&
        remainingPurchases !== undefined &&
        remainingPurchases !== 0n && (
          <div className="bg-[#1A1A1A] p-7 rounded-[10px] mt-6">
            <details>
              <summary className="text-[#A1A1AA] relative">
                Buy Note with Kerosene{" "}
                <b>({remainingPurchases?.toString() || "0"} left)</b>
                <div className="absolute right-0 -top-1.5">
                  <button
                    className="rounded-[5px] p-2 text-sm bg-[#282828] hover:bg-[#393939]"
                    onClick={(evt) => {
                      localStorage.setItem(
                        "dontShowBuyNoteWithKerosene",
                        "true"
                      );
                      setDontShowBuyNoteWithKerosene(true);
                    }}
                  >
                    Don&apos;t show again
                  </button>
                </div>
              </summary>
              <div className="flex flex-col gap-4 mt-6">
                {keroseneBalance !== undefined &&
                  buyNotePrice !== undefined &&
                  (keroseneBalance >= buyNotePrice ? (
                    (keroseneAllowance || 0n) >= buyNotePrice ? (
                      <ButtonComponent
                        disabled={buyNoteConfig === undefined || !!buyNoteError}
                        onClick={() => {
                          buyNoteWithKerosene(buyNoteConfig!.request);
                        }}
                      >
                        Buy note for {formatEther(buyNotePrice || 0n)} KEROSENE
                      </ButtonComponent>
                    ) : (
                      <ButtonComponent
                        onClick={() => {
                          approveKerosene(keroseneApprovalConfig!.request);
                        }}
                      >
                        Approve {formatEther(buyNotePrice || 0n)} KEROSENE
                      </ButtonComponent>
                    )
                  ) : (
                    <>
                      <p>
                        Eligible to buy a note for{" "}
                        {formatEther(buyNotePrice || 0n)} KEROSENE. Current
                        balance is {formatEther(keroseneBalance)} KEROSENE.
                        Please acquire{" "}
                        {formatEther(buyNotePrice - keroseneBalance)} additional
                        KEROSENE.
                      </p>
                      <ButtonComponent
                        onClick={() =>
                          window.open(
                            `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xf3768D6e78E65FC64b8F12ffc824452130BD5394&exactField=output&exactAmount=${formatEther(buyNotePrice - keroseneBalance)}`
                          )
                        }
                      >
                        Buy on Uniswap
                      </ButtonComponent>
                    </>
                  ))}
              </div>
            </details>
          </div>
        )}
    </>
  );
};
