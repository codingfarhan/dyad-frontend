import { useState } from "react";
import Image from "next/image";
import EditVaultModal from "@/components/Modals/NoteCardModals/DepositModals/EditVault/EditVaultModal";
import EditVaultTabContent from "@/components/Modals/NoteCardModals/DepositModals/EditVault/EditVaultTabContent";
import { TabsDataModel } from "@/models/TabsModel";
import { Tooltip } from "@nextui-org/react";
import { VaultInfo, vaultInfo } from "@/lib/constants";
import { defaultChain } from "@/lib/config";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  useReadVaultManagerCollatRatio,
  useReadVaultManagerHasVault,
} from "@/generated";
import { VaultActions } from "@/models/VaultModels";

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
  const [selectedEditVaultTab, setSelectedEditVaultTab] =
    useState<VaultActions>("Deposit");
  const { data: hasVault } = useReadVaultManagerHasVault({
    chainId: defaultChain.id,
    args: [BigInt(tokenId), vault.vaultAddress],
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

export default Vault;
