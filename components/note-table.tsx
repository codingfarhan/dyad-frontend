import TableComponent from "@/components/reusable/TableComponent";
import React, { useCallback, useMemo, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { formatCurrency } from "@/utils/currency";
import Loader from "./loader";
import {
  dNftAddress,
  useReadDNftBalanceOf,
  useReadXpTotalSupply,
} from "@/generated";
import { useAccount, useReadContracts } from "wagmi";
import { defaultChain } from "@/lib/config";
import { dnftAbi } from "@/lib/abi/Dnft";
import {
  BuyModal,
  CancelListingModal,
  EditListingModal,
  ListingData,
  ListModal,
  useListings,
  useUserListings,
} from "@reservoir0x/reservoir-kit-ui";
import { maxUint256 } from "viem";
import { web3Modal } from "@/lib/web3Modal";

const NoteTable: React.FC<any> = ({}) => {
  const listModalOpenState = useState(false);
  const buyModalOpenState = useState(false);
  const editModalOpenState = useState(false);
  const cancelModalOpenState = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedListingId, setSelectedListingId] = useState<
    string | undefined
  >(undefined);

  const { data: totalSupply } = useReadXpTotalSupply();
  const { address } = useAccount();
  const { data: dnftBalance, refetch: reloadDnftBalance } =
    useReadDNftBalanceOf({
      args: [address!],
      chainId: defaultChain.id,
      query: {
        enabled: !!address,
      },
    });

  const dnftQueryParams = useMemo(() => {
    return Array.from(Array(Number(dnftBalance || 0)).keys()).map((index) => ({
      abi: dnftAbi,
      address: dNftAddress[defaultChain.id],
      functionName: "tokenOfOwnerByIndex",
      args: [address!, BigInt(index)],
    }));
  }, [address, dnftBalance]);

  const { data: ownedDnfts } = useReadContracts({
    allowFailure: false,
    contracts: dnftQueryParams,
    query: {
      enabled: !!address && !!dnftBalance,
    },
  });

  const { data: allListings, mutate: mutateListings } = useListings({
    contracts: [dNftAddress[defaultChain.id]],
  });

  const GET_ITEMS = gql`
    query {
      notes(limit: 1000) {
        items {
          id
          collatRatio
          kerosene
          dyad
          xp
          collateral
        }
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_ITEMS);

  const getMarketplaceAction = useCallback(
    (id: string) => {
      if (ownedDnfts && new Set(ownedDnfts.map(Number)).has(Number(id))) {
        const match = allListings
          .filter((listing) => listing.criteria?.data?.token?.tokenId === id)
          .sort(
            (a, b) => (a.price?.amount?.usd || 0) - (b.price?.amount?.usd || 0)
          );

        if (match.length > 0) {
          return (
            <div className="flex gap-2">
              <button
                className="rounded-[5px] bg-[#282828] text-sm min-w-fit px-4 py-0.5 hover:bg-[#393939]"
                onClick={() => {
                  setSelectedId(id);
                  setSelectedListingId(match[0].id);
                  editModalOpenState[1](true);
                }}
              >
                Edit
              </button>
              <button
                className="rounded-[5px] bg-[#282828] text-sm min-w-fit px-4 py-0.5 hover:bg-[#393939]"
                onClick={() => {
                  setSelectedId(id);
                  setSelectedListingId(match[0].id);
                  cancelModalOpenState[1](true);
                }}
              >
                Cancel
              </button>
            </div>
          );
        }

        return (
          <button
            className="rounded-[5px] bg-[#282828] text-sm min-w-fit px-4 py-0.5 hover:bg-[#393939]"
            onClick={() => {
              setSelectedId(id);
              listModalOpenState[1](true);
            }}
          >
            List
          </button>
        );
      } else if (allListings) {
        const match = allListings
          .filter((listing) => listing.criteria?.data?.token?.tokenId === id)
          .sort(
            (a, b) => (a.price?.amount?.usd || 0) - (b.price?.amount?.usd || 0)
          );
        if (match.length > 0) {
          const cheapest = match[0];
          return (
            <button
              className="rounded-[5px] bg-[#282828] text-sm min-w-fit px-4 py-0.5 hover:bg-[#393939]"
              onClick={() => {
                setSelectedId(id);
                buyModalOpenState[1](true);
              }}
            >
              Buy {cheapest.price?.amount?.decimal}{" "}
              {cheapest.price?.currency?.symbol}
            </button>
          );
        }
      }
    },
    [
      ownedDnfts,
      listModalOpenState,
      allListings,
      buyModalOpenState,
      editModalOpenState,
      setSelectedListingId,
      cancelModalOpenState
    ]
  );

  const parsedData = useMemo(() => {
    const parseRows = (items: any) => {
      return (
        items
          //.filter((item: any) => parseFloat(item.dyad) !== 0)
          .map((item: any) => ({
            ...item,
            collatRatio:
              BigInt(item.collatRatio) === maxUint256
                ? "N/A"
                : (parseFloat(item.collatRatio) / 1e16).toFixed(0) + "%",
            kerosene: formatCurrency(
              (parseFloat(item.kerosene) / 1e18).toFixed(0)
            ).slice(1),
            dyad: formatCurrency((parseFloat(item.dyad) / 1e18).toFixed(0)),
            xp: (parseFloat(item.xp) / 1e18 / 1e9).toFixed(0),
            xpPercentage: totalSupply
              ? (
                  (parseFloat(item.xp) /
                    1e18 /
                    (parseFloat(totalSupply) / 1e18)) *
                  100
                ).toFixed(2) + "%"
              : "N/A",
            collateral: formatCurrency(
              (parseFloat(item.collateral) / 1e18).toFixed(0)
            ),
          }))
          .sort((a: any, b: any) => parseFloat(b.xp) - parseFloat(a.xp))
          .map((item, index) => ({
            ...item,
            rank: index + 1,
            market: getMarketplaceAction(item.id),
          }))
      );
    };

    return data && data.notes.items ? parseRows(data.notes.items) : [];
  }, [data, totalSupply, getMarketplaceAction]);

  return (
    <div>
      <CancelListingModal
        trigger={<></>}
        openState={cancelModalOpenState}
        listingId={selectedListingId}
        onCancelComplete={(data) => {
          mutateListings();
        }}
      />
      <EditListingModal
        trigger={<></>}
        collectionId="0xDc400bBe0B8B79C07A962EA99a642F5819e3b712"
        tokenId={selectedId}
        openState={editModalOpenState}
        listingId={selectedListingId}
        onEditListingComplete={(data) => {
          mutateListings();
        }}
      />
      <BuyModal
        trigger={<></>}
        token={`0xDc400bBe0B8B79C07A962EA99a642F5819e3b712:${selectedId}`}
        openState={buyModalOpenState}
        onPurchaseComplete={(data) => {
          mutateListings();
        }}
        onConnectWallet={async () => {
          await web3Modal.open();
          buyModalOpenState[1](false);
        }}
      />
      <ListModal
        trigger={<></>}
        collectionId="0xDc400bBe0B8B79C07A962EA99a642F5819e3b712"
        tokenId={selectedId}
        currencies={[
          {
            contract: "0x0000000000000000000000000000000000000000",
            symbol: "ETH",
          },
          {
            contract: "0xFd03723a9A3AbE0562451496a9a394D2C4bad4ab",
            symbol: "DYAD",
            decimals: 18,
          },
        ]}
        openState={listModalOpenState}
        oracleEnabled={true}
        onGoToToken={() => console.log("Awesome!")}
        onListingComplete={(data) => {
          console.log("Listing Complete", data);
          mutateListings();
        }}
      />
      {loading && <Loader />}
      {!loading && !error && (
        <div className="h-[500px]">
          <TableComponent
            columns={[
              {
                key: "rank",
                label: "Rank",
              },
              {
                key: "id",
                label: "Note",
              },
              {
                key: "xp",
                label: "XP",
              },
              {
                key: "xpPercentage",
                label: "% of XP",
              },
              {
                key: "kerosene",
                label: "KERO",
              },
              {
                key: "dyad",
                label: "DYAD",
              },
              {
                key: "collateral",
                label: "Collateral",
              },
              {
                key: "collatRatio",
                label: "CR",
              },
              {
                key: "market",
                label: "Market",
              },
            ]}
            rows={parsedData}
            size="compact"
            // onRowClick={onRowClickHandler}
          />
        </div>
      )}
      {!loading && !error && (
        <div className="flex justify-end mt-4 text-sm text-muted-foreground">
          *only Notes that minted DYAD are ranked
        </div>
      )}
    </div>
  );
};
export default NoteTable;
