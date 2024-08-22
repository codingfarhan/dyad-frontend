import React, { useState } from "react";
import SortbyComponent from "../reusable/SortbyComponent";
import { getKeyValue } from "@nextui-org/react";
import { cardsSortData } from "@/constants/MarketplaceList";
import { ArrowDownUpIcon, ArrowUpIcon } from "lucide-react";

interface MarketplaceListProps {
  cardsData: any;
}

const MarketplaceList: React.FC<MarketplaceListProps> = ({ cardsData }) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  }>({ key: "rank", direction: "descending" });

  const parseValue = (value: string) => {
    if (value === undefined || value === "") return 0;
    value = String(value);
    // Remove any non-numeric characters except for '.' and '-'
    const numericValue = value.replace(/[^\d.-]/g, "");
    return parseFloat(numericValue);
  };

  const sortedRows = React.useMemo(() => {
    let sortableRows = [...cardsData];
    sortableRows.sort((a, b) => {
      const aValue = parseValue(getKeyValue(a, sortConfig.key));
      const bValue = parseValue(getKeyValue(b, sortConfig.key));

      if (!aValue) return 1;
      if (!bValue) return -1;

      if (aValue > bValue) {
        // Check if we're sorting by rank and reversing the asc and desc values because a lower rank is better
        if (["rank"].includes(sortConfig.key)) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        } else {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
      }
      if (aValue < bValue) {
        if (["rank"].includes(sortConfig.key)) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        } else {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
      }
      return 0;
    });
    return sortableRows;
  }, [cardsData, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig((oldValue) => {
      return { key, direction: oldValue.direction };
    });
  };

  return (
    <>
      <div className="w-full ml-auto flex justify-end">
        <div className="w-16 mr-2">
          <SortbyComponent
            sortOptions={cardsSortData}
            onValueChange={requestSort}
            selected={sortConfig.key}
          />
        </div>
        <div className="w-16 ml-2">
          <SortbyComponent
            sortOptions={[
              { label: "Ascending", value: "ascending" },
              { label: "Descending", value: "descending" },
            ]}
            onValueChange={() =>
              setSortConfig((prevState) => ({
                key: prevState?.key!,
                direction:
                  prevState?.direction === "ascending"
                    ? "descending"
                    : "ascending",
              }))
            }
            selected={sortConfig.direction}
            icon={
              <div>
                <ArrowDownUpIcon size={15} color="#D2D2D2" />
              </div>
            }
            label="Sort Direction"
          />
        </div>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2">
        {sortedRows.map((data: any) => (
          <div className="bg-[#1A1A1A] rounded rounded-lg p-4">
            <div className="mb-6">
              <div className="text-lg flex font-bold">Rank #{data.rank}</div>
              <div className="text-xs text-[#A1A1AA]">Note Nº {data.id}</div>
            </div>
            <div className="flex justify-between text-xs text-[#A1A1AA] tracking-wider">
              <div>
                <div className="mb-2">{data.xp} XP</div>
                <div className="mb-2">{data.xpPercentage} of XP</div>
                <div className="mb-2">{data.kerosene} KERO</div>
              </div>
              <div>
                <div className="mb-2">{data.dyad} DYAD</div>
                <div className="mb-2">{data.collateral} Collateral</div>
                <div className="mb-2">{data.collatRatio} CR</div>
              </div>
            </div>
            {data.market.props.children === "N/A" ? (
              <div className="w-full pt-4 flex justify-center">
                <div className="w-full h-9 mt-auto mb-auto text-center border-2 border-dotted border-[#282828] rounded-[5px] py-0.5 text-sm flex">
                  <div className="m-auto">{data.market}</div>
                </div>
              </div>
            ) : (
              <div className="w-full pt-4 flex justify-center items-center">
                {{
                  ...data.market,
                  props: {
                    ...data.market.props,
                    className: `${data.market.props.className} w-full h-9`,
                  },
                }}
              </div>
            )}
          </div>
        ))}
      </div>
      <a
        href="#"
        className="bg-[#1A1A1A] border-[1px] border-[#282828] rounded-[100%] w-[50px] h-[50px] fixed top-[90vh] right-[5vw] cursor-pointer flex"
      >
        <ArrowUpIcon className="m-auto text-sm" size={20} />
      </a>
    </>
  );
};

export default MarketplaceList;
