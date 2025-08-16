import useSWR from 'swr';
import api from '@/lib/api';
import { Employee } from './use-employees';

// Definisikan tipe data untuk Log Absensi
export interface AttendanceLog {
  id: number;
  clock_in: string;
  clock_out: string | null;
  status: string;
  lateness_minutes: number;
  overtime_minutes: number;
  early_leave_minutes: number;
  employee: Employee; // Data karyawan yang berelasi
}

// Tipe untuk data paginasi dari Laravel
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

// Hook ini menerima filter sebagai argumen
export function useAttendanceLog(date?: string, departmentId?: string, page: number = 1) {
  // Bangun query string secara dinamis
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (departmentId) params.append('department_id', departmentId);
  params.append('page', String(page));

  const queryString = params.toString();
  const url = `/attendance-log?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<AttendanceLog>>(url, fetcher, {
    keepPreviousData: true, // Agar data lama tetap tampil saat loading data baru
  });

  return {
    logData: data,
    isLoading,
    isError: error,
    mutate,
  };
}