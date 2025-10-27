'use client'
import useSWR from 'swr';
import UseAxios from './UseAxios';

const fetcter = async (url: string) => {
    const api = UseAxios();
  const res = await api.get(url);
  console.log(res,url);
  
  return res.data;
};

const useSwrConfig =(url:string ,fallbackData?: any) =>{
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcter,
    {
      fallbackData,
      shouldRetryOnError: false, // don't spam retries
      revalidateOnFocus: false,  // don't re-fetch on tab switch
      revalidateOnReconnect: false, // no re-fetch on reconnect
      onErrorRetry: (err, key, config, revalidate, { retryCount }) => {
          // don't retry on 404s
        //   if (err.response?.status === 404) return;
          // stop retrying after 3 tries
    //   if (retryCount >= 1) return;
      // retry after 10 seconds
    //   setTimeout(() => revalidate({ retryCount }), 10000);
    },
    }
  );
console.log(data);

  return {
    data,
    error,
    isLoading,
    refresh: mutate, // handy if you want to manually re-fetch later
  };
}

export default useSwrConfig