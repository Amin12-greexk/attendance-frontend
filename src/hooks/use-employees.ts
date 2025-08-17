import useSWR from 'swr';
import api from '@/lib/api';
import { Department } from './use-departments';

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department_id: number;
  department: Department;
}

// Tipe untuk mencocokkan respons paginasi dari Laravel
export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

/**
 * Hook untuk mengambil data karyawan dengan paginasi.
 * @param page Nomor halaman yang ingin diambil.
 */
export function useEmployees(page: number = 1) {
  // Kunci SWR sekarang dinamis berdasarkan nomor halaman
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Employee>>(
    `/employees?page=${page}`, 
    fetcher
  );

  return {
    // Kembalikan seluruh objek paginasi dari API
    paginatedEmployees: data,
    isLoading,
    isError: error,
    mutate,
  };
}
