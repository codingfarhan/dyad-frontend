import { useState, useEffect } from "react";

export default function useEthPrice() {
  const [ethPrice, setEthPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function _ETH2USD() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(
          "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
        );

        if (!res.ok) {
          throw new Error("Failed to fetch ETH price");
        }

        const data = await res.json();
        setEthPrice(data.USD);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    _ETH2USD();
  }, []);

  return { ethPrice, isLoading, error };
}
