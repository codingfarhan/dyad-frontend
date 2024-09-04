import { vaultManagerAbi, vaultManagerAddress } from "@/generated";
import { defaultChain } from "@/lib/config";
import { useReadContracts } from "wagmi";
import { Address, formatEther, maxUint256 } from "viem";
import { formatNumber, fromBigNumber } from "@/lib/utils";
import { VaultInfo, vaultInfo } from "@/lib/constants";
import { useEffect, useState } from "react";
import { vaultAbi } from "@/lib/abi/Vault";
import Vault from "@/components/NoteCard/vaults/Vault";
import AddVault from "@/components/NoteCard/vaults/AddVault";
import { getYields } from "@/utils/vaults";
import { vaultTableHeaders } from "@/constants/vaults";

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
  const [assetYields, setAssetYields] = useState();

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

  useEffect(() => {
    getYields(vaultInfo, setAssetYields);
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
