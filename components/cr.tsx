import { round } from "../utils/currency";
import { useMemo } from "react";

type Props = {
  cr: number;
};

export default function CR({ cr }: Props) {

  const textColor = useMemo(() => {
    if (cr < 150) {
      return "#FF0000";
    } else if (cr < 200) {
      return "#FF8C00";
    } else if (cr < 225) {
      return "#FFA500";
    } else if (cr < 250) {
      return "#FFFF00";
    } else if (cr < 275) {
      return "#90EE90";
    } else {
      return "#008000";
    }
  }, [cr]);

  return <span style={{ color: textColor }}>{round(cr, 2)}</span>;
}
