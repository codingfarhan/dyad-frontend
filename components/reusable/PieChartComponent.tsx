import { insideFillColors, outsideFillColors } from "@/constants/Charts";
import { formatNumber } from "@/lib/utils";
import { Data } from "@/models/ChartModels";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import LineDataChart from "./LineDataChart";
import { useState } from "react";

interface PieChartComponentProps {
  outsideData: Data[];
  insideData: Data[];
  options?: any;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: any;
  payload?: any;
}) => {
  if (active && payload && payload.length) {
    const split: string[] = payload[0].payload.label.split("|");

    return (
      <div className="bg-black border rounded-md p-4">
        {split.map((label, index) => (<p key={index} className="label">{label}</p>))}
        <p className="label">{`${!payload[0].payload.label.includes('DYAD') ? `$${formatNumber(payload[0].value)}` : payload[0].value}`}</p>
      </div>
    );
  }
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  insideData,
  outsideData,
  options = {},
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState<null | string>(null);

  return (
    <div>
      <div className="hidden">
        <PieChart width={185} height={185}>
          <Pie data={insideData} dataKey="value" outerRadius={60} stroke="none">
            {insideData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={insideFillColors[index]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={outsideData}
            dataKey="value"
            innerRadius={70}
            outerRadius={80}
            stroke="none"
          >
            {outsideData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={outsideFillColors[index]} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="block rounded-[25px] w-full">
        <LineDataChart
          data={outsideData}
          fillColors={outsideFillColors}
          isTooltipOpen={isTooltipOpen}
          setIsTooltipOpen={setIsTooltipOpen}
        />
        <LineDataChart
          data={insideData}
          fillColors={insideFillColors}
          isTooltipOpen={isTooltipOpen}
          setIsTooltipOpen={setIsTooltipOpen}
          labelDataIndex="$"
        />
      </div>
    </div>
  );
};

export default PieChartComponent;
