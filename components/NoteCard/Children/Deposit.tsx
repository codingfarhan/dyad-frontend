import EditVaultModal from "@/components/Modals/NoteCardModals/DepositModals/EditVault/EditVaultModal";
import EditVaultTabContent from "@/components/Modals/NoteCardModals/DepositModals/EditVault/EditVaultTabContent";
import {
  useReadVaultManagerCollatRatio,
  useReadVaultManagerHasVault,
  vaultManagerAbi,
  vaultManagerAddress,
  wEthVaultAbi,
} from "@/generated";
import { defaultChain } from "@/lib/config";
import { useReadContract, useReadContracts } from "wagmi";
import { Address, formatEther, maxUint256 } from "viem";
import { formatNumber, fromBigNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TabsDataModel } from "@/models/TabsModel";
import { VaultInfo, vaultInfo } from "@/lib/constants";
import AddVaultModal from "@/components/Modals/NoteCardModals/DepositModals/AddVault/AddVaultModal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { vaultAbi } from "@/lib/abi/Vault";
import { Tooltip } from "@nextui-org/react";

interface DepositProps {
  tokenId: string;
  total_collateral: string;
  collateralization_ratio: bigint | undefined;
}

export const supportedVaults = vaultInfo.map((info) => info.vaultAddress);

const Deposit: React.FC<DepositProps> = ({
  tokenId,
  total_collateral,
  collateralization_ratio,
}) => {
  const { data: vaultData } = useReadContracts({
    contracts: supportedVaults.map((address) => ({
      address: vaultManagerAddress[defaultChain.id],
      abi: vaultManagerAbi,
      functionName: "hasVault",
      args: [BigInt(tokenId), address],
      chainId: defaultChain.id,
    })),
    allowFailure: false,
  });

  const { data: vaultAssets } = useReadContracts({
    contracts: supportedVaults
      .map((address) => [
        {
          address,
          abi: vaultAbi,
          functionName: "id2asset",
          args: [BigInt(tokenId)],
          chainId: defaultChain.id,
        },
        {
          address,
          abi: vaultAbi,
          functionName: "getUsdValue",
          args: [BigInt(tokenId)],
          chainId: defaultChain.id,
        },
      ])
      .flatMap((contract) => contract),
    allowFailure: false,
    query: {
      select: (data) => {
        const result: Record<string, { asset: string; usdValue: string }> = {};
        for (let i = 0; i < data.length; i += 2) {
          const asset = Number(formatEther(data[i] as bigint)).toFixed(4);
          const usdValue = Number(formatEther(data[i + 1] as bigint)).toFixed(
            2
          );
          result[supportedVaults[i / 2]] = { asset, usdValue };
        }
        return result;
      },
    },
  });

  const emptyVaultMap = vaultData?.map((data) => !data) || [];

  const emptyVaults = emptyVaultMap
    .map((emptyVault, i) => (!emptyVault ? null : supportedVaults[i]))
    .filter((data) => !!data);

  const availableVaults = 6 - emptyVaultMap.filter((data) => !data).length;

  const vaultTableHeaders = [
    {
      label: "Currency",
      columnKey: "currency",
    },
    {
      label: "Tokens deposited",
      columnKey: "tokensDeposited",
    },
    {
      label: "Total value (USD)",
      columnKey: "totalValueUsd",
    },
    {
      label: "Asset yield",
      columnKey: "assetYield",
    },
    {
      label: "",
      columnKey: "actionOptions",
    },
  ];

  const [assetYields, setAssetYields] = useState();

  const getYields = async () => {
    const yields = await vaultInfo.map(async (vault) => {
      let apr = undefined;
      if (vault.getApr) {
        try {
          const aprValue = await vault.getApr();
          if (aprValue) {
            apr = `${aprValue.toFixed(2)}%`;
          }
        } catch {}
      }

      setAssetYields((prevState: any) => ({
        ...prevState,
        [vault.vaultAddress]: [apr, vault.additionalYield]
          .filter((item) => item !== undefined)
          .join(" + "),
      }));
    });

    return yields;
  };

  useEffect(() => {
    getYields();
  }, []);

  const renderVaultTable = (vaultData: VaultInfo[]) => {
    return (
      <div>
        <div className="hidden justify-between text-xs tracking-wider md:grid md:grid-cols-9 md:gap-x-2 mt-2 py-2 px-2 sticky top-0">
          {vaultTableHeaders.map((header) => (
            <div
              key={header.columnKey}
              className={`${header.columnKey === "actionOptions" ? "col-span-1" : "col-span-2"} my-auto ${header.columnKey !== "currency" ? "text-center" : "pl-2"}`}
            >
              {header.label}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-1 gap-y-2">
          {vaultInfo
            .filter((_, i) => !!vaultData?.at(i))
            .map((vault, i) => {
              return (
                <Vault
                  key={i}
                  tokenId={tokenId}
                  vault={vault}
                  assetYield={assetYields && assetYields[vault.vaultAddress]}
                  vaultAssets={vaultAssets}
                />
              );
            })}
        </div>
        {availableVaults > 0 &&
          Array.apply(null, Array(availableVaults)).map((_, i) => (
            <AddVault
              key={i}
              tokenId={tokenId}
              vaultAddresses={emptyVaults as Address[]}
            />
          ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="block md:flex justify-between text-sm font-semibold my-6 md:my-[37px] md:px-[15px]">
        <div className="flex justify-between text-[#A1A1AA] mb-2 md:mb-0">
          <div className="mr-[5px]">Total collateral: </div>
          <div>{total_collateral}</div>
        </div>
        <div className="flex justify-between text-[#FAFAFA]">
          <div className="mr-[5px]">Collateralization ratio:</div>
          <p className="mt-auto">
            {collateralization_ratio === maxUint256
              ? "Infinity"
              : `${formatNumber(fromBigNumber(collateralization_ratio, 16))}%`}
          </p>
        </div>
      </div>
      {renderVaultTable(vaultInfo)}
    </div>
  );
};
export default Deposit;

const Vault = ({
  vault,
  tokenId,
  assetYield,
  vaultAssets,
}: {
  vault: VaultInfo;
  tokenId: string;
  assetYield: string | undefined;
  vaultAssets:
    | Record<
        string,
        {
          asset: string;
          usdValue: string;
        }
      >
    | undefined;
}) => {
  const [isEditVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  const [selectedEditVaultTab, setSelectedEditVaultTab] = useState<
    "Deposit" | "Withdraw"
  >("Deposit");
  const { data: hasVault } = useReadVaultManagerHasVault({
    chainId: defaultChain.id,
    args: [BigInt(tokenId), vault.vaultAddress],
  });
  const { data: collateralValue, isLoading: collateralLoading } =
    useReadContract({
      address: vault.vaultAddress,
      abi: wEthVaultAbi,
      args: [BigInt(tokenId)],
      functionName: "getUsdValue",
      chainId: defaultChain.id,
    });

  const { data: collatRatio } = useReadVaultManagerCollatRatio({
    args: [BigInt(tokenId)],
    chainId: defaultChain.id,
  });

  const { tokenAddress: collateralAddress, symbol: collateralString } =
    vaultInfo.filter((value) => value.vaultAddress === vault.vaultAddress)[0];

  const tabs: TabsDataModel[] = [
    {
      label: "Deposit",
      tabKey: "Deposit",
      content: (
        <EditVaultTabContent
          action="deposit"
          token={collateralAddress}
          symbol={collateralString}
          collateralizationRatio={collatRatio}
          tokenId={tokenId}
          vault={vault}
        />
      ),
    },
    {
      label: "Withdraw",
      tabKey: "Withdraw",
      content: (
        <EditVaultTabContent
          action="withdraw"
          token={collateralAddress}
          symbol={collateralString}
          collateralizationRatio={collatRatio}
          tokenId={tokenId}
          vault={vault}
        />
      ),
    },
  ];

  if (!hasVault) {
    return null;
  }
  if (collateralLoading) {
    return (
      <Skeleton className="rounded-md md:rounded-none w-full md:w-[100px] h-9 md:h-[100px]" />
    );
  }

  const renderActionButton = () => (
    <Dialog
      open={isEditVaultModalOpen}
      onOpenChange={() =>
        setIsVaultModalOpen((prevState: boolean) => !prevState)
      }
    >
      <DialogContent className="max-w-[90vw] md:max-w-lg px-[0px] md:px-8 pt-8 ml-auto">
        <EditVaultModal
          tabsData={tabs}
          logo={collateralString}
          selectedTab={selectedEditVaultTab}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <div
      className="bg-[#282828] rounded rounded-lg p-2"
      key={vault.tokenAddress}
    >
      {renderActionButton()}
      <div className="md:hidden justify-between mb-4 flex">
        <div className=" my-auto flex">
          <div className="text-xs text-[#A1A1AA] my-auto">
            <Image
              src={vault.icon}
              width={20}
              height={20}
              alt={`${vault.symbol} icon`}
            />
          </div>
          <div className="text-md ml-2 flex font-bold">{vault.symbol}</div>
        </div>
        <div className="my-auto">
          <div className="flex justify-between text-xs">
            <div
              className="cursor-pointer mr-2 h-6 w-6 rounded-[50%] bg-[#1A1A1A] flex"
              onClick={() => {
                setIsVaultModalOpen(true);
                setSelectedEditVaultTab("Withdraw");
              }}
            >
              <div className="m-auto">-</div>
            </div>
            <div
              className="cursor-pointer ml-auto h-6 w-6 rounded-[50%] bg-[#1A1A1A] flex"
              onClick={() => {
                setIsVaultModalOpen(true);
                setSelectedEditVaultTab("Deposit");
              }}
            >
              <div className="m-auto">+</div>
            </div>
          </div>
        </div>
      </div>
      <div className="justify-between text-xs text-[#A1A1AA] tracking-wider flex md:hidden">
        <div className="block w-full text-xs ">
          <div className="mb-2 flex justify-between">
            <div>Tokens deposited</div>
            <div className="flex text-white">
              <div>{vaultAssets?.[vault.vaultAddress]?.asset}</div>
            </div>
          </div>
          <div className="mb-2 flex justify-between">
            <div>Total value (USD)</div>
            <div className="text-white">
              <span>{vaultAssets?.[vault.vaultAddress]?.usdValue}</span>
            </div>
          </div>
          <div className="mb-2 flex justify-between">
            <div>Asset yield</div>
            <div className="text-white w-1/2 text-right">
              <span>{assetYield}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden justify-between text-xs tracking-wider md:grid md:grid-cols-9 md:gap-x-2 text-center items-center h-9">
        <div className="col-span-2 flex pl-2 items-center">
          <div>
            <Image
              src={vault.icon}
              width={20}
              height={20}
              alt={`${vault.symbol} icon`}
            />
          </div>
          <div className="ml-2">{vault.symbol}</div>
        </div>
        <div className="col-span-2 flex justify-center">
          <div>{vaultAssets?.[vault.vaultAddress]?.asset}</div>
        </div>
        <div className="col-span-2 ">
          ${vaultAssets?.[vault.vaultAddress]?.usdValue}
        </div>
        <div className="col-span-2 ">{assetYield}</div>
        <div className="col-span-1 ">
          <div className="flex justify-between">
            <Tooltip content="Withdraw" closeDelay={200}>
              <div
                className="cursor-pointer ml-auto h-6 w-6 rounded-[50%] bg-[#1A1A1A] flex hover:scale-110 transition-[scale]"
                onClick={() => {
                  setIsVaultModalOpen(true);
                  setSelectedEditVaultTab("Withdraw");
                }}
              >
                <div className="m-auto">-</div>
              </div>
            </Tooltip>
            <Tooltip content="Deposit" closeDelay={200}>
              <div
                className="cursor-pointer ml-auto h-6 w-6 rounded-[50%] bg-[#1A1A1A] flex hover:scale-110 transition-[scale]"
                onClick={() => {
                  setIsVaultModalOpen(true);
                  setSelectedEditVaultTab("Deposit");
                }}
              >
                <div className="m-auto">+</div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddVault = ({
  tokenId,
  vaultAddresses,
}: {
  tokenId: string;
  vaultAddresses: Address[];
}) => {
  return (
    <Dialog>
      <DialogTrigger className="h-full w-full mt-2">
        <div
          className={`font-semibold text-[#FAFAFA] text-sm items-center justify-center flex flex-col rounded-md gap-2 w-full h-9 bg-transparent border border-white/30`}
        >
          <p>+</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-fit">
        <AddVaultModal vaults={vaultAddresses} tokenId={tokenId} />
      </DialogContent>
    </Dialog>
  );
};
