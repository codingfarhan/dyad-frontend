import React, { useState } from "react";
import { Data } from "@/models/ChartModels";
import { getDataItemPercentage } from "@/utils/chartUtils";
import { Tooltip } from "@nextui-org/react";

interface LineDataChartProps {
  data: Data[];
  fillColors: string[];
  isTooltipOpen: string | null;
  setIsTooltipOpen: (value: string | null) => void;
  labelDataIndex?: string;
}

const LineDataChart: React.FC<LineDataChartProps> = ({
  data,
  fillColors,
  isTooltipOpen,
  setIsTooltipOpen,
  labelDataIndex = "",
}) => {
  return (
    <div
      className={`w-100 h-[10px] flex justify-between mb-4 md:mb-6 ${data?.length === 0 && "hidden"}`}
    >
      {data &&
        data.map((item: Data, index: number) => {
          const itemWidthPercentage = `${getDataItemPercentage(item, data) * 100}%`;
          const itemFillColor: string = fillColors[index];
          const classNames = `${index === 0 ? "rounded-l-[25px]" : index === data.length - 1 ? "rounded-r-[25px]" : "rounded-0"}`;

          return (
            <Tooltip
              content={
                <div className="px-1 py-2">
                  {item.label.split("|").map((labelDataIndex, index) => (
                    <div key={`tt-label-${index}`} className="text-small font-bold">{labelDataIndex}</div>
                  ))}
                  <div className="text-tiny">{`${labelDataIndex}${item.value}`}</div>
                </div>
              }
              isOpen={isTooltipOpen === item.label}
              isDismissable
              closeDelay={0}
              onOpenChange={(open) => setIsTooltipOpen(item.label)}
              onClose={() => setIsTooltipOpen(null)}
              key={item.label}
            >
              <div
                style={{
                  background: itemFillColor,
                  width: itemWidthPercentage,
                }}
                className={`h-[10px] ${classNames} border-0`}
                onClick={(e) => {
                  setIsTooltipOpen(item.label);
                }}
              ></div>
            </Tooltip>
          );
        })}
    </div>
  );
};
export default LineDataChart;
