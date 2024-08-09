import useSWR from "swr";

export default function useKerosenePrice() {
  const { data, error } = useSWR(
    "https://api.coingecko.com/api/v3/coins/kerosene/tickers",
    async (url) => {
      const res = await fetch(url);
      const result = await res.json();
      return result.tickers[0]?.converted_last?.usd || 0;
    }
  );

  const isLoading = !data && !error;

  return {
    kerosenePrice: data || 0,
    error: error,
    isLoading: isLoading,
  };
}
