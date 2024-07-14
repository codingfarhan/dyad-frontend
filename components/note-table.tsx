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
      notes {
        items {
          id
          collatRatio
          kerosene
        }
      }
    }
  `;
  const { loading, error, data } = useQuery(GET_ITEMS);

  function parseRows(items) {
    return items.map((item) => ({
      ...item,
      collatRatio: (parseFloat(item.collatRatio) / 1e16).toFixed(2) + "%",
      kerosene: (parseFloat(item.kerosene) / 1e18).toFixed(0),
    }));
  }

  const parsedData =
    data && data.notes.items ? parseRows(data.notes.items) : [];

  return (
    <div>
      {!loading && !error && (
        <div className="h-[150px]">
          <TableComponent
            columns={[
              {
                key: "id",
                label: "Note",
              },
              {
                key: "collatRatio",
                label: "CR",
              },
              {
                key: "kerosene",
                label: "KERO",
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
