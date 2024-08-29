import useSWR from "swr";

export default function useKerosenePrice() {
  const { data, error } = useSWR(
    "https://api.dexscreener.com/latest/dex/search?q=KEROSENE%20WETH",
    async (url) => {
      const res = await fetch(url);
      const result = await res.json();
      const priceUsd = result?.pairs?.[0]?.priceUsd;
      return priceUsd ? parseFloat(priceUsd) : 0;
    }
  );

  const isLoading = !data && !error;

  return {
    kerosenePrice: data || 0,
    error: error,
    isLoading: isLoading,
  };
}
