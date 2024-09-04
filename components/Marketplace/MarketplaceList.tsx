import React, { useState } from "react";
import SortbyComponent from "../reusable/SortbyComponent";
import { getKeyValue, Pagination } from "@nextui-org/react";
import { cardsSortData } from "@/constants/MarketplaceList";
import { ArrowDownUpIcon, ArrowUpIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import NoteDetails from "./NoteDetails"; // Import the new component

interface MarketplaceListProps {
  cardsData: any;
  ownedNotes: Set<number>;
}

const MarketplaceList: React.FC<MarketplaceListProps> = ({
  cardsData,
  ownedNotes,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  }>({ key: "rank", direction: "descending" });
  const [isModalOpen, setIsModalOpen] = useState(false); // new state
  const [selectedRow, setSelectedRow] = useState<any>(null); // new state
  const pageSize = 10; // max rows per page
  const [currentPage, setCurrentPage] = useState<number>(1);

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
      const aId = parseValue(getKeyValue(a, "id"));
      const bId = parseValue(getKeyValue(b, "id"));
      const aValue = parseValue(getKeyValue(a, sortConfig.key));
      const bValue = parseValue(getKeyValue(b, sortConfig.key));

      if (!aValue) return 1;
      if (!bValue) return -1;

      if (ownedNotes.has(aId)) {
        return -1;
      } else if (ownedNotes.has(bId)) {
        return 1;
      }

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

    const result: string[][] = [];
    const pages = Math.ceil(sortableRows?.length / pageSize);
    for (let i = 0; i < pages; i++) {
      result.push(sortableRows?.slice(i * pageSize, (i + 1) * pageSize));
    }
    return result;
  }, [cardsData, sortConfig]);

  const requestSort = (key: string) => {
    setSortConfig((oldValue) => {
      return { key, direction: oldValue.direction };
    });
  };

  const handleRowClick = (data: any) => {
    // new function
    setSelectedRow(data);
    setIsModalOpen(true);
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
      <div className="hidden justify-between text-xs bg-[#09090B] tracking-wider md:grid md:grid-cols-12 md:gap-x-2 text-center mt-2 py-4 px-2 sticky top-0">
        <div className="col-span-1 mt-auto mb-auto">Rank</div>
        <div className="col-span-1 mt-auto mb-auto">Note Nº</div>
        <div className="col-span-1 mt-auto mb-auto">XP</div>
        <div className="col-span-1 mt-auto mb-auto">% of XP</div>
        <div className="col-span-2 mt-auto mb-auto">KERO</div>
        <div className="col-span-1 mt-auto mb-auto">DYAD</div>
        <div className="col-span-2 mt-auto mb-auto">Collateral</div>
        <div className="col-span-1 mt-auto mb-auto">CR</div>
        <div className="col-span-2 mt-auto mb-auto">Market</div>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-y-2 ">
        {sortedRows[currentPage - 1].map((data: any) => (
          <div
            className="bg-[#1A1A1A] rounded rounded-lg p-2 cursor-pointer hover:bg-[#2A2A2A]"
            onClick={() => handleRowClick(data)} // updated to handle click
          >
            <div className="md:hidden justify-between mb-4 flex">
              <div>
                <div className="text-lg flex font-bold">Rank #{data.rank}</div>
                <div className="text-xs text-[#A1A1AA]">Note Nº {data.id}</div>
              </div>
              {data.market.props.children === "N/A" ? (
                <div className="w-1/2 flex justify-center">
                  <div className="w-full h-9 mt-auto mb-auto text-center border-2 border-dotted border-[#282828] rounded-[5px] text-sm flex">
                    <div className="m-auto">{data.market}</div>
                  </div>
                </div>
              ) : (
                <div className="w-1/2 flex justify-center items-center">
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

            <div className="justify-between text-xs text-[#A1A1AA] tracking-wider flex md:hidden">
              <div className="block justify-between w-auto ">
                <div className="mb-2">
                  <span className="text-white">{data.xp}</span> XP
                </div>
                <div className="mb-2">
                  <span className="text-white">{data.kerosene}</span> KERO
                </div>
              </div>
              <div className="block justify-between w-auto ">
                <div className="mb-2">
                  <span className="text-white">{data.xpPercentage}</span> of XP
                </div>
                <div className="mb-2">
                  <span className="text-white">{data.collatRatio}</span> CR
                </div>
              </div>
              <div className="block justify-between w-auto ">
                <div className="mb-2">
                  <span className="text-white">{data.dyad}</span> DYAD
                </div>
                <div className="mb-2">
                  <span className="text-white">{data.collateral}</span>{" "}
                  Collateral
                </div>
              </div>
            </div>

            <div className="hidden justify-between text-xs text-[#A1A1AA] tracking-wider md:grid md:grid-cols-12 md:gap-x-2 text-center">
              <div className="col-span-1 mt-auto mb-auto">{data.rank}</div>
              <div className="col-span-1 mt-auto mb-auto">{data.id}</div>
              <div className="col-span-1 mt-auto mb-auto">{data.xp}</div>
              <div className="col-span-1 mt-auto mb-auto">
                {data.xpPercentage}
              </div>
              <div className="col-span-2 mt-auto mb-auto">{data.kerosene}</div>
              <div className="col-span-1 mt-auto mb-auto">{data.dyad}</div>
              <div className="col-span-2 mt-auto mb-auto">
                {data.collateral}
              </div>
              <div className="col-span-1 mt-auto mb-auto">
                {data.collatRatio}
              </div>
              {data.market.props.children === "N/A" ? (
                <div className="w-full flex justify-center col-span-2">
                  <div className="w-full h-9 mt-auto mb-auto text-center border-2 border-dotted border-[#282828] rounded-[5px] text-sm flex">
                    <div className="m-auto text-xs">{data.market}</div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex justify-center items-center col-span-2">
                  {{
                    ...data.market,
                    props: {
                      ...data.market.props,
                      className: `${data.market.props.className} w-full h-9 text-xs`,
                    },
                  }}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: "10px",
        }}
      >
        <Pagination
          isCompact
          showControls
          showShadow
          total={sortedRows?.length}
          initialPage={1}
          onChange={setCurrentPage}
        />
      </div>

      {selectedRow && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <NoteDetails selectedRow={selectedRow} />{" "}
          {/* Use the new component */}
        </Dialog>
      )}

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
