import useSWR from 'swr';
import api from '@/lib/api';
import { Employee } from './use-employees'; // Menggunakan tipe Employee yang sudah ada

// Tipe untuk respons paginasi dari Laravel
interface PaginatedEmployeesResponse {
  data: Employee[];
  // bisa ditambahkan properti paginasi lain jika perlu
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

/**
 * Hook khusus untuk mengambil SEMUA karyawan.
 * Menangani respons paginasi dan non-paginasi secara otomatis.
 */
export function useAllEmployees() {
  // Panggil endpoint /employees/all yang sudah Anda buat
  const { data, error, isLoading, mutate } = useSWR<Employee[] | PaginatedEmployeesResponse>('/employees/all', fetcher);

  // Cek jika 'data' adalah objek paginasi (memiliki properti 'data'), 
  // jika ya, kembalikan array di dalamnya. Jika tidak, kembalikan data apa adanya.
  const employeesArray = data && 'data' in data ? data.data : data;

  return {
    // ✅ PERBAIKAN: Pastikan yang dikembalikan adalah array
    allEmployees: employeesArray, 
    isLoading,
    isError: error,
    mutate,
  };
}
