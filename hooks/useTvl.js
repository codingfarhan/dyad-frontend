import { useState, useEffect } from "react";

export default function useTvl() {
  const [tvl, setTvl] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("https://api.llama.fi/tvl/dyad");
      const data = await response.json();
      setTvl(parseFloat(data));
    }

    fetchData();
  }, []);

  return { tvl };
}
