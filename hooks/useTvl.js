import { useState, useEffect } from "react";

export default function useTvl() {
  const [tvl, setTvl] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("https://api.llama.fi/tvl/dyad");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTvl(parseFloat(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { tvl, isLoading, error };
}
