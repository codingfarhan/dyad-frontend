import TableComponent from "@/components/reusable/TableComponent";
import React from "react";
import { useQuery, gql } from "@apollo/client";
import { formatCurrency } from "@/utils/currency";
import Loader from "./loader";
import { useReadXpTotalSupply } from "@/generated";

const NoteTable: React.FC<any> = ({}) => {
  const { data: totalSupply } = useReadXpTotalSupply();

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

  function parseRows(items) {
    return items
      .filter((item) => parseFloat(item.dyad) !== 0)
      .map((item) => ({
        ...item,
        collatRatio: (parseFloat(item.collatRatio) / 1e16).toFixed(0) + "%",
        kerosene: formatCurrency(
          (parseFloat(item.kerosene) / 1e18).toFixed(0)
        ).slice(1),
        dyad: formatCurrency((parseFloat(item.dyad) / 1e18).toFixed(0)),
        xp: (parseFloat(item.xp) / 1e18 / 1e9).toFixed(0),
        xpPercentage: totalSupply
          ? (
              (parseFloat(item.xp) / 1e18 / (parseFloat(totalSupply) / 1e18)) *
              100
            ).toFixed(2) + "%"
          : "N/A",
        collateral: formatCurrency(
          (parseFloat(item.collateral) / 1e18).toFixed(0)
        ),
      }))
      .sort((a, b) => parseFloat(b.xp) - parseFloat(a.xp))
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }

  const parsedData =
    data && data.notes.items ? parseRows(data.notes.items) : [];

  return (
    <div>
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
            ]}
            rows={parsedData}
            size="compact"
            // onRowClick={onRowClickHandler}
          />
        </div>
      )}
      {!loading && !error && (
        <div className="flex justify-end mt-4 text-sm">
          *only Notes that minted DYAD are ranked
        </div>
      )}
    </div>
  );
};
export default NoteTable;
