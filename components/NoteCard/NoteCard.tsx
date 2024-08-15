"use client";

import React, { useMemo } from "react";
import NoteCardsContainer from "../reusable/NoteCardsContainer";
import TabsComponent from "../reusable/TabsComponent";
import {
  useReadDyadMintedDyad,
  useReadVaultManagerCollatRatio,
  useReadVaultManagerGetTotalValue,
  useReadVaultManagerMinCollatRatio,
  vaultManagerAbi,
  vaultManagerAddress,
  wEthVaultAbi,
  useReadVaultManagerGetVaultsValues,
} from "@/generated";
import { defaultChain } from "@/lib/config";
import NoteNumber from "./Children/NoteNumber";
import { NoteNumberDataColumnModel } from "@/models/NoteCardModels";
import { TabsDataModel } from "@/models/TabsModel";
import Deposit, { supportedVaults } from "./Children/Deposit";
import Mint from "./Children/Mint";
import { useReadContract, useReadContracts } from "wagmi";
import { maxUint256 } from "viem";
import { formatNumber, fromBigNumber } from "@/lib/utils";
import { vaultInfo } from "@/lib/constants";

function NoteCard({ tokenId }: { tokenId: string }) {
  // Fetch collateralization ratio
  const { data: collatRatio, isError: collatRatioError } =
    useReadVaultManagerCollatRatio({
      args: [BigInt(tokenId)],
      chainId: defaultChain.id,
    });

  // Fetch exogenous collateral value
  const { data: exoCollat, isError: exoCollatError } =
    useReadVaultManagerGetVaultsValues({
      args: [BigInt(tokenId)],
    });

  // Fetch minted DYAD
  const { data: mintedDyad, isError: mintedDyadError } = useReadDyadMintedDyad({
    args: [BigInt(tokenId)],
    chainId: defaultChain.id,
  });

  // Fetch collateral value
  const { data: collateralValue, isError: collateralValueError } =
    useReadVaultManagerGetTotalValue({
      args: [BigInt(tokenId)],
      chainId: defaultChain.id,
    });

  // Check if the vault exists
  const { data: hasVaultData, isError: hasVaultError } = useReadContracts({
    contracts: supportedVaults.map((address) => ({
      address: vaultManagerAddress[defaultChain.id],
      abi: vaultManagerAbi,
      functionName: "hasVault",
      args: [BigInt(tokenId), address],
      chainId: defaultChain.id,
    })),
    allowFailure: false,
  });
  const hasVault = (hasVaultData?.filter((data) => !!data)?.length || 0) > 0;

  // Fetch vault collateral values
  const { data: vaultCollateral, isError: vaultCollateralError } =
    useReadContracts({
      contracts: supportedVaults.map((address) => ({
        address: address,
        abi: wEthVaultAbi,
        functionName: "getUsdValue",
        args: [BigInt(tokenId)],
        chainId: defaultChain.id,
      })),
      allowFailure: false,
    });

  // Calculate vault USD values
  const vaultUsd = vaultCollateral
    ?.map((value, i) => ({
      value: fromBigNumber(value),
      label: vaultInfo[i].symbol,
    }))
    .filter((data) => !!data.value);

  // Fetch minimum collateralization ratio
  const {
    data: minCollateralizationRatio,
    isError: minCollateralizationRatioError,
  } = useReadVaultManagerMinCollatRatio({
    chainId: defaultChain.id,
  });

  // Calculate total collateral and collateralization ratio
  const totalCollateral =
    collateralValueError || !collateralValue
      ? "N/A"
      : `$${formatNumber(fromBigNumber(collateralValue))}`;
  const collateralizationRatio =
    collatRatioError || !collatRatio
      ? "N/A"
      : collatRatio === maxUint256
        ? "Infinity"
        : `${formatNumber(fromBigNumber(collatRatio, 16))}%`;

  // Calculate total DYAD
  const totalDyad =
    mintedDyadError || !mintedDyad ? "N/A" : `${fromBigNumber(mintedDyad)}`;

  // Calculate mintable DYAD
  const mintableDyad = useMemo(() => {
    if (
      collateralValueError ||
      minCollateralizationRatioError ||
      mintedDyadError ||
      !collateralValue ||
      !minCollateralizationRatio ||
      !mintedDyad
    ) {
      return "N/A";
    }
    const maxDyad =
      ((collateralValue || 0n) * 1000000000000000000n) /
      (minCollateralizationRatio || 1n);
    return maxDyad - (mintedDyad || 0n);
  }, [
    collateralValue,
    minCollateralizationRatio,
    mintedDyad,
    collateralValueError,
    minCollateralizationRatioError,
    mintedDyadError,
  ]);

  // Prepare data for the note
  const noteData: NoteNumberDataColumnModel[] = [
    {
      text: "Collateralization ratio",
      value: collateralizationRatio,
      highlighted: true,
    },
    {
      text: "DYAD minted",
      value: totalDyad,
      highlighted: false,
    },
    {
      text: "Collateral",
      value: totalCollateral,
      highlighted: false,
    },
    {
      text: "Exogenous Collateral",
      value:
        exoCollatError || !exoCollat
          ? "N/A"
          : `$${formatNumber(fromBigNumber(exoCollat[0]))}`,
      highlighted: false,
    },
  ];

  // Prepare tabs data
  const tabData: TabsDataModel[] = [
    {
      label: `Note Nº ${tokenId}`,
      tabKey: `Note Nº ${tokenId}`,
      content: hasVault ? (
        <NoteNumber
          data={noteData}
          dyad={[fromBigNumber(mintableDyad), fromBigNumber(mintedDyad)]}
          collateral={vaultUsd as any}
        />
      ) : (
        <p>Deposit collateral to open vault</p>
      ),
    },
    {
      label: "Deposit & Withdraw",
      tabKey: "Deposit and Withdraw",
      content: (
        <Deposit
          total_collateral={totalCollateral}
          collateralization_ratio={collatRatio}
          tokenId={tokenId}
        />
      ),
    },
    {
      label: "Mint & Burn",
      tabKey: "Mint DYAD",
      content: (
        <Mint
          dyadMinted={totalDyad}
          currentCr={collatRatio}
          tokenId={tokenId}
        />
      ),
    },
  ];

  return (
    <NoteCardsContainer>
      <TabsComponent tabsData={tabData} />
    </NoteCardsContainer>
  );
}

export default NoteCard;
