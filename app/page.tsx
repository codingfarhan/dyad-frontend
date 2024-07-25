"use client";

import ButtonComponent from "@/components/reusable/ButtonComponent";
import KeroseneCard from "@/components/KeroseneCard/KeroseneCard";
import NoteCard from "@/components/NoteCard/NoteCard";
import { EarnKeroseneContent } from "@/components/earn-kerosene";
import { ClaimModalContent } from "@/components/claim-modal-content";
import { useAccount } from "wagmi";
import { useReadDNftBalanceOf } from "@/generated";
import { defaultChain } from "@/lib/config";
import useIDsByOwner from "@/hooks/useIDsByOwner";
import dynamic from "next/dynamic";
import NoteTable from "@/components/note-table";
import { BuyNoteWithKerosene } from "@/components/buy-note-kerosene";

const TabsComponent = dynamic(
  () => import("@/components/reusable/TabsComponent"),
  { ssr: false }
);

export default function Home() {
  const { address } = useAccount();

  const { data: balance } = useReadDNftBalanceOf({
    args: [address],
    chainId: defaultChain.id,
  });

  const { tokens } = useIDsByOwner(address, balance);

  const keroseneCardsData = [
    {
      currency: "ETH - DYAD (Uniswap)",
      APY: "24",
      staked: "390",
      keroseneEarned: "830",
    },
    {
      currency: "DYAD",
      APY: "12",
      staked: "1200",
      keroseneEarned: "500",
    },
  ];
  const manageNotesContent = (
    <>
      <BuyNoteWithKerosene />
      <div className="my-6 flex justify-between">
        <ClaimModalContent />
      </div>
      <div className="flex flex-col gap-4">
        {tokens &&
          tokens.map((token) => (
            <NoteCard
              key={parseInt(token.result)}
              tokenId={parseInt(token.result)}
            />
          ))}
      </div>
    </>
  );

  const keroseneData = (
    <>
      <div className="mt-12">
        <ButtonComponent>Claim 1,863 Kerosene</ButtonComponent>
      </div>
      {keroseneCardsData.map((card, index) => (
        <div className="mt-6" key={index}>
          <KeroseneCard
            currency={card.currency}
            staked={card.staked}
            APY={card.APY}
            keroseneEarned={card.keroseneEarned}
          />
        </div>
      ))}
    </>
  );

  const tabsData = [
    {
      label: "Earn Kerosene",
      tabKey: "earn-kerosene",
      content: <EarnKeroseneContent />,
    },
    {
      label: "Manage Notes",
      tabKey: "notes",
      content: manageNotesContent,
    },
    {
      label: "Marketplace",
      tabKey: "marketplace",
      content: <NoteTable />,
    },
  ];

  return (
    <div className="flex-1 max-w-screen-md w-[745px] p-4 mt-4">
      <TabsComponent tabsData={tabsData} urlUpdate />
    </div>
  );
}
