import useSWR from 'swr';
import api from '@/lib/api';

export interface Department {
  id: number;
  name: string;
  max_clock_in_time: string;
  max_clock_out_time: string;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Department[] }>('/departments', fetcher);

  return {
    departments: data?.data, 
    isLoading,
    isError: error,
    mutate, 
  };
}