import TableComponent from "@/components/reusable/TableComponent";
import useModal from "@/contexts/modal";
import React from "react";
import { useQuery, gql } from "@apollo/client";
import { formatCurrency } from "@/utils/currency";
import Loader from "./loader";

const NoteTable: React.FC<any> = ({}) => {
  const { pushModal } = useModal();

  // const onRowClickHandler = (key: string) => {
  //   pushModal(<LpStakeModal tabsData={getLpModalData(key)} logo={key} />);
  //   console.log(key);
  // };

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
