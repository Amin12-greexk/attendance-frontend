import useSWR from 'swr';
import api from '@/lib/api';
import { Employee } from './use-employees'; // Kita gunakan lagi tipe Employee yang sudah ada

const fetcher = (url: string) => api.get(url).then(res => res.data);

/**
 * Hook khusus untuk mengambil SEMUA karyawan tanpa paginasi.
 * Ideal untuk dropdown dan combobox.
 */
export function useAllEmployees() {
  // Panggil endpoint dengan parameter ?all=true
  const { data, error, isLoading } = useSWR<Employee[]>('/employees?all=true', fetcher);

  return {
    allEmployees: data,
    isLoading,
    isError: error,
  };
}
