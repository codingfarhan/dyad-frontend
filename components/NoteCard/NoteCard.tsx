"use client";

import React, { useMemo } from "react";
import NoteCardsContainer from "../reusable/NoteCardsContainer";
import TabsComponent from "../reusable/TabsComponent";
import {
  vaultManagerAbi,
  vaultManagerAddress,
  wEthVaultAbi,
  dyadAbi,
  dyadAddress,
} from "@/generated";
import { defaultChain } from "@/lib/config";
import NoteNumber from "./Children/NoteNumber";
import { NoteNumberDataColumnModel } from "@/models/NoteCardModels";
import { TabsDataModel } from "@/models/TabsModel";
import Deposit, { supportedVaults } from "./Children/Deposit";
import Mint from "./Children/Mint";
import { useReadContracts } from "wagmi";
import { maxUint256 } from "viem";
import { formatNumber, fromBigNumber } from "@/lib/utils";
import { vaultInfo } from "@/lib/constants";

type ContractData = {
  collatRatio?: bigint;
  exoCollateralValue?: bigint;
  keroCollateralValue?: bigint;
  totalCollateralValue?: bigint;
  minCollatRatio?: bigint;
  mintedDyad?: bigint;
};

function NoteCard({ tokenId }: { tokenId: string }) {
  // Fetch collateralization ratio

  const {
    data: contractData,
    isSuccess: dataLoaded,
    isError: loadDataError,
  } = useReadContracts({
    contracts: [
      {
        address: vaultManagerAddress[defaultChain.id],
        abi: vaultManagerAbi,
        functionName: "collatRatio",
        args: [BigInt(tokenId)],
      },
      {
        address: vaultManagerAddress[defaultChain.id],
        abi: vaultManagerAbi,
        functionName: "getVaultsValues",
        args: [BigInt(tokenId)],
      },
      {
        address: vaultManagerAddress[defaultChain.id],
        abi: vaultManagerAbi,
        functionName: "MIN_COLLAT_RATIO",
      },
      {
        address: dyadAddress[defaultChain.id],
        abi: dyadAbi,
        functionName: "mintedDyad",
        args: [BigInt(tokenId)],
      },
    ],
    allowFailure: false,
    query: {
      select: (data) => {
        const collatRatio = data[0];
        const exoCollateralValue = data[1][0];
        const keroCollateralValue = data[1][1];
        const minCollatRatio = data[2];
        const mintedDyad = data[3];
        const totalCollateralValue = exoCollateralValue + keroCollateralValue;

        return {
          collatRatio,
          exoCollateralValue,
          keroCollateralValue,
          totalCollateralValue,
          minCollatRatio,
          mintedDyad,
        };
      },
    },
  });

  const {
    collatRatio,
    exoCollateralValue,
    keroCollateralValue,
    totalCollateralValue,
    minCollatRatio,
    mintedDyad,
  } = useMemo<ContractData>(() => {
    if (contractData) {
      return contractData;
    } else {
      return {};
    }
  }, [contractData]);

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

  // Calculate total collateral and collateralization ratio
  const totalCollateral = dataLoaded
    ? `$${formatNumber(fromBigNumber(totalCollateralValue))}`
    : "N/A";

  const collateralizationRatio = dataLoaded
    ? collatRatio === maxUint256
      ? "Infinity"
      : `${formatNumber(fromBigNumber(contractData.collatRatio, 16))}%`
    : "N/A";

  // Calculate total DYAD
  const totalDyad = contractData?.mintedDyad
    ? `${fromBigNumber(contractData.mintedDyad)}`
    : "N/A";

  // Calculate mintable DYAD
  const mintableDyad = useMemo(() => {
    if (
      !dataLoaded ||
      totalCollateralValue === undefined ||
      minCollatRatio === undefined ||
      mintedDyad === undefined ||
      exoCollateralValue === undefined ||
      keroCollateralValue === undefined
    ) {
      return "N/A";
    }
    let usableKero = keroCollateralValue;
    if (keroCollateralValue > exoCollateralValue) {
      usableKero = exoCollateralValue;
    }
    let maxDyad =
      ((usableKero + exoCollateralValue) * 1000000000000000000n) /
      minCollatRatio;

    if (maxDyad > exoCollateralValue) {
      maxDyad = exoCollateralValue;
    }

    return maxDyad - (mintedDyad || 0n);
  }, [
    dataLoaded,
    totalCollateralValue,
    minCollatRatio,
    mintedDyad,
    exoCollateralValue,
    keroCollateralValue,
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
      value: !dataLoaded
        ? "N/A"
        : `$${formatNumber(fromBigNumber(exoCollateralValue))}`,
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
      content: <Mint currentCr={collatRatio} tokenId={tokenId} />,
    },
  ];

  return (
    <NoteCardsContainer>
      <TabsComponent tabsData={tabData} />
    </NoteCardsContainer>
  );
}

export default NoteCard;
