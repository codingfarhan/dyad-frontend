import { useEffect, useState } from "react";

type MerklCampaign = {
  apr: number;
  tvl: number;
  isLive: boolean;
};

export const useMerklCampaign = () => {
  const [merklData, setMerkleData] = useState<MerklCampaign | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getMerkl() {
      try {
        const res = await fetch(
          "https://api.merkl.xyz/v3/campaigns?chainIds=1"
        );

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();

        if (!data) {
          throw new Error("No data returned from API");
        }

        const campaigns =
          data["1"]["2_0x8B238f615c1f312D22A65762bCf601a37f1EeEC7"];

        for (const campaign of Object.values(campaigns) as MerklCampaign[]) {
          if (campaign.isLive) {
            setMerkleData(campaign);
            break;
          }
        }
      } catch (err) {
        setError((err as Error).message);
      }
    }

    getMerkl();
  }, []);

  return { currentCampaign: merklData, error };
};
