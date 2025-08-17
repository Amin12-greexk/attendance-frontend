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

// Tipe untuk data paginasi frontend
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

// --- Custom fetcher yang normalisasi respons Laravel ---
const fetcher = async (url: string): Promise<PaginatedResponse<AttendanceLog>> => {
  const res = await api.get(url);

  // ✅ Jika backend pakai ResourceCollection (sudah ada links & meta)
  if (res.data.meta && res.data.links) {
    return res.data;
  }

  // ✅ Jika backend pakai paginate() default Laravel
  if (Array.isArray(res.data.data)) {
    return {
      data: res.data.data,
      links: {
        first: res.data.first_page_url,
        last: res.data.last_page_url,
        prev: res.data.prev_page_url,
        next: res.data.next_page_url,
      },
      meta: {
        current_page: res.data.current_page,
        from: res.data.from,
        last_page: res.data.last_page,
        path: res.data.path,
        per_page: res.data.per_page,
        to: res.data.to,
        total: res.data.total,
      },
    };
  }

  // fallback (jaga-jaga)
  return {
    data: [],
    links: { first: '', last: '', prev: null, next: null },
    meta: {
      current_page: 1,
      from: 0,
      last_page: 1,
      path: '',
      per_page: 15,
      to: 0,
      total: 0,
    },
  };
};

// --- Hook utama ---
export function useAttendanceLog(date?: string, departmentId?: string, page: number = 1) {
  // Bangun query string dinamis
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (departmentId) params.append('department_id', departmentId);
  params.append('page', String(page));

  const queryString = params.toString();
  const url = `/attendance-log?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<AttendanceLog>>(url, fetcher, {
    keepPreviousData: true,
  });

  return {
    logData: data,
    isLoading,
    isError: error,
    mutate,
  };
}
