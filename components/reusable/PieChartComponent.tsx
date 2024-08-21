import { formatNumber } from "@/lib/utils";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

export type Data = {
  label: string;
  value: number;
};

interface PieChartComponentProps {
  outsideData: Data[];
  insideData: Data[];
  options?: any;
}

const CustomTooltip = ({ active, payload }: {active: any, payload: any}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black border rounded-md p-4">
        <p className="label">{`${payload[0].payload.label} : ${!payload[0].payload.label.includes('DYAD') ? `$${formatNumber(payload[0].value)}` : payload[0].value}`}</p>
      </div>
    );
  }
};

const collatColors: Record<string, string> = {
  "wETH": "#676767",
  "wstETH": "#00A3FF",
  "tBTC": "#FF9900",
  "sUSDe": "#2A2A2A",
  "KEROSENE": "#EDEDED",
  "weETH": "#301267",
}

const outsideFillColors = ["#44e845", "white"];
const PieChartComponent: React.FC<PieChartComponentProps> = ({
  insideData,
  outsideData,
  options = {},
}) => {
  return (
    <PieChart width={185} height={185}>
      <Pie data={insideData} dataKey="value" outerRadius={60} stroke="none">
        {insideData?.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={collatColors[entry.label]}/>
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Pie data={outsideData} dataKey="value" innerRadius={70} outerRadius={80} stroke="none">
        {outsideData?.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={outsideFillColors[index]} />
        ))}
      </Pie>
    </PieChart>
  );
};

export default PieChartComponent;
