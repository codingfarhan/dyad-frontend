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
      value: Math.ceil(dyad[0]),
    },
    {
      label: "DYAD minted",
      value: Math.ceil(dyad[1]),
    },
  ];

  return (
    <div className="flex flex-col items-center w-full text-[#FAFAFA]">
      <div className="w-full mt-6">
        <PieChartComponent
          outsideData={dyadData}
          insideData={collateral}
        />
      </div>
      <div className="w-full mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item: any, index: number) => (
            <div
              key={index}
              className={`flex justify-between p-4 rounded-lg shadow-md ${
                item.highlighted ? "bg-[#1A1A1A]" : "bg-[#282828]"
              }`}
            >
              <div className="text-sm font-medium">{item.text}</div>
              <div className="text-sm text-right">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteNumber;
