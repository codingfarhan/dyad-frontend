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
        xp: (parseFloat(item.xp) / 1e18 / 1e6).toFixed(0) + "M",
        xpPercentage: totalSupply
          ? (
              (parseFloat(item.xp) / 1e18 / (parseFloat(totalSupply) / 1e18)) *
              100
            ).toFixed(2) + "%"
          : "N/A",
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
    </div>
  );
};
export default NoteTable;
