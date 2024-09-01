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
import { Address, maxUint256 } from "viem";
import { formatNumber, fromBigNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TabsDataModel } from "@/models/TabsModel";
import { VaultInfo, vaultInfo } from "@/lib/constants";
import AddVaultModal from "@/components/Modals/NoteCardModals/DepositModals/AddVault/AddVaultModal";
import bitcoinIcon from "@/public/bitcoin-cryptocurrency.svg";
import Image from "next/image";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { DotsVerticalIcon } from "@radix-ui/react-icons";

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

  const dummyVaultData = [
    {
      currencyIcon: <Image src={bitcoinIcon} alt="bitcoin icon" width={20} />,
      currency: "wETH",
      tokensDeposited: 12,
      totalValueUsd: 30000,
      assetYield: "2.8% APY + 3x etherFi points",
    },
    // {
    //   currencyIcon: <Image src={bitcoinIcon} alt="bitcoin icon" width={20} />,
    //   currency: "wstETH",
    //   tokensDeposited: 3,
    //   totalValueUsd: 3000,
    //   assetYield: "2.8% APY + 3x etherFi points",
    // },
    // {
    //   currencyIcon: <Image src={bitcoinIcon} alt="bitcoin icon" width={20} />,
    //   currency: "KEROSENE",
    //   tokensDeposited: 5,
    //   totalValueUsd: 10000,
    //   assetYield: "2.8% APY",
    // },
    // {
    //   currencyIcon: <Image src={bitcoinIcon} alt="bitcoin icon" width={20} />,
    //   currency: "tBTC",
    //   tokensDeposited: 10,
    //   totalValueUsd: 50000,
    //   assetYield: "2.8% APY + 3x etherFi points",
    // },
    // {
    //   currencyIcon: <Image src={bitcoinIcon} alt="bitcoin icon" width={20} />,
    //   currency: "sUSDe",
    //   tokensDeposited: 8,
    //   totalValueUsd: 8000,
    //   assetYield: "2.8% APY + 3x etherFi points",
    // },
    // {
    //   currencyIcon: <Image src={bitcoinIcon} alt="bitcoin icon" width={20} />,
    //   currency: "weETH",
    //   tokensDeposited: 15,
    //   totalValueUsd: 5000,
    //   assetYield: "2.8% APY",
    // },
  ];

  const actionItems = [
    {
      label: "Deposit",
    },
    {
      label: "Withdraw",
    },
    {
      label: "Redeem",
    },
  ];

  const renderVaultTable = (vaultData: any) => {
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
        <div className="mt-2 grid grid-cols-1 gap-y-2 ">
          {vaultData.map((data: any) => (
            <div className="bg-[#282828] rounded rounded-lg p-2">
              <div className="md:hidden justify-between mb-4 flex">
                <div className=" my-auto flex">
                  <div className="text-xs text-[#A1A1AA] my-auto">
                    {data.currencyIcon}
                  </div>
                  <div className="text-md ml-2 flex font-bold">
                    {data.currency}
                  </div>
                </div>
                <div className="my-auto">
                  <Dropdown>
                    <DropdownTrigger>
                      <DotsVerticalIcon className="cursor-pointer ml-auto" />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Dropdown Variants">
                      {actionItems.map((item: { label: string }) => (
                        <DropdownItem
                          key={item.label}
                          onClick={() => {
                            console.log(item.label);
                          }}
                        >
                          {item.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>

              <div className="justify-between text-xs text-[#A1A1AA] tracking-wider flex md:hidden">
                <div className="block w-full text-xs ">
                  <div className="mb-2 flex justify-between">
                    <div>Tokens deposited</div>
                    <div className="flex text-white">
                      <div>{data.tokensDeposited}</div>
                      <div className="ml-1">{data.currency}</div>
                    </div>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <div>Total value (USD)</div>
                    <div className="text-white">
                      <span>${data.totalValueUsd}</span>
                    </div>
                  </div>
                  <div className="mb-2 flex justify-between">
                    <div>Asset yield</div>
                    <div className="text-white w-1/2 text-right">
                      <span>{data.assetYield}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden justify-between text-xs tracking-wider md:grid md:grid-cols-9 md:gap-x-2 text-center items-center h-9">
                <div className="col-span-2 flex pl-2 items-center">
                  <div>{data.currencyIcon}</div>
                  <div className="ml-2">{data.currency}</div>
                </div>
                <div className="col-span-2 flex justify-center">
                  <div>{data.tokensDeposited}</div>
                  <div className="ml-2">{data.currency}</div>
                </div>
                <div className="col-span-2 ">${data.totalValueUsd}</div>
                <div className="col-span-2 ">{data.assetYield}</div>
                <div className="col-span-1 ">
                  <Dropdown>
                    <DropdownTrigger>
                      <DotsVerticalIcon className="cursor-pointer ml-auto" />
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Dropdown Variants">
                      {actionItems.map((item: { label: string }) => (
                        <DropdownItem
                          key={item.label}
                          onClick={() => {
                            console.log(item.label);
                          }}
                        >
                          {item.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </div>
          ))}
          {availableVaults > 0 &&
            Array.apply(null, Array(availableVaults)).map((_, i) => (
              <AddVault
                key={i}
                tokenId={tokenId}
                vaultAddresses={emptyVaults as Address[]}
              />
            ))}
        </div>
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
      {renderVaultTable(dummyVaultData)}
      {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-[30px]">
        {vaultInfo
          .filter((_, i) => !!vaultData?.at(i))
          .map((vault, i) => (
            <Vault key={i} tokenId={tokenId} vault={vault} />
          ))}
        {availableVaults > 0 &&
          Array.apply(null, Array(availableVaults)).map((_, i) => (
            <AddVault
              key={i}
              tokenId={tokenId}
              vaultAddresses={emptyVaults as Address[]}
            />
          ))}
      </div> */}
    </div>
  );
};
export default Deposit;

const Vault = ({ vault, tokenId }: { vault: VaultInfo; tokenId: string }) => {
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
    {
      label: "Redeem",
      tabKey: "Redeem",
      content: (
        <EditVaultTabContent
          action="redeem"
          token={collateralAddress!}
          symbol={collateralString!}
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

  return (
    <Dialog>
      <DialogTrigger className="h-full w-full">
        <div
          className={`font-semibold text-[#FAFAFA] text-sm items-center justify-center flex flex-row md:flex-col gap-2 rounded-md md:rounded-none w-full md:w-[100px] h-9 md:h-[100px] bg-[#282828]`}
        >
          <p>{collateralString}</p>
          <p>${formatNumber(fromBigNumber(collateralValue))}</p>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-lg px-[0px] md:px-8 pt-8 ml-auto">
        <EditVaultModal tabsData={tabs} logo={collateralString} />
      </DialogContent>
    </Dialog>
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
      <DialogTrigger className="h-full w-full">
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
