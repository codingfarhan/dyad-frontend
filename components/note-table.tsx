import TableComponent from "@/components/reusable/TableComponent";
import useModal from "@/contexts/modal";
import React from "react";
import { useQuery, gql } from "@apollo/client";

const NoteTable: React.FC<any> = ({}) => {
  const { pushModal } = useModal();

  // const onRowClickHandler = (key: string) => {
  //   pushModal(<LpStakeModal tabsData={getLpModalData(key)} logo={key} />);
  //   console.log(key);
  // };

  const GET_ITEMS = gql`
    query {
      notes(limit=1000) {
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
  console.log("XXX", data);

  function parseRows(items) {
    return items.map((item) => ({
      ...item,
      collatRatio: (parseFloat(item.collatRatio) / 1e16).toFixed(2) + "%",
      kerosene: (parseFloat(item.kerosene) / 1e18).toFixed(0),
      dyad: "$" + (parseFloat(item.dyad) / 1e18).toFixed(0),
      xp: (parseFloat(item.xp) / 1e18).toFixed(0),
    }));
  }

  const parsedData =
    data && data.notes.items ? parseRows(data.notes.items) : [];

  return (
    <div>
      {!loading && !error && (
        <div className="h-[500px]">
          <TableComponent
            columns={[
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
