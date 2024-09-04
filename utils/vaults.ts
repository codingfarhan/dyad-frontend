import { VaultInfo } from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";

export const getYields = async (
  vaultInfo: VaultInfo[],
  setAssetYields: Dispatch<SetStateAction<undefined>>
) => {
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
