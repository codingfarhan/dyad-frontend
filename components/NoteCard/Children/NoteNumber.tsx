"use client";

import React from "react";
import { NoteNumberDataColumnModel } from "@/models/NoteCardModels";
import PieChartComponent from "@/components/reusable/PieChartComponent";
import { Data } from "@/models/ChartModels";

interface NoteNumberProps {
  data: NoteNumberDataColumnModel[];
  dyad: number[];
  collateral: Data[];
}

const NoteNumber: React.FC<NoteNumberProps> = ({ data, dyad, collateral }) => {
  const dyadData = [
    {
      label: "DYAD mintable",
      value: dyad[0],
    },
    {
      label: "DYAD minted",
      value: dyad[1],
    },
  ];

  return (
    <div className="flex justify-between">
      <div className="block justify-between w-full text-[#FAFAFA]">
        <div className="w-full justify-center mt-[20px]">
          <div className="w-full m-auto">
            <PieChartComponent
              outsideData={dyadData}
              insideData={collateral}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const { dataIndex, dataset } = context;
                        return `  ${dataset.labels[dataIndex]}:  ${typeof dataset.data[dataIndex] === "string" ? "$" : ""}${dataset.data[dataIndex]}`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
        <div className="w-100 md:w-auto mt-6 md:mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
            {data.map((item: any, index: number) => (
              <div
                key={index}
                className={`flex w-auto justify-between mb-2 md:mb-[25px] text-sm ${
                  item.highlighted ? "text-[#FAFAFA]" : "text-[#A1A1AA]"
                }`}
              >
                <div>{item.text}</div>
                <div className="text-right">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default NoteNumber;
