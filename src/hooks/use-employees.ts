import useSWR from 'swr';
import api from '@/lib/api';
import { Department } from './use-departments';
import { EmployeeFormValues } from '@/app/(pages)/employees/components/employee-form';
import axios from 'axios';

export interface Employee {
  id: number;
  name: string;
  email: string;
  position: string;
  department_id: number;
  department: Department;
}

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useEmployees() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Employee[] }>('/employees', fetcher);

  const submitEmployee = async (
    action: 'create' | 'update',
    employeeData: EmployeeFormValues,
    id?: number
  ) => {
    // Logika CSRF dan pengiriman data terpusat di sini
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');
    await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (!xsrfToken) throw new Error("Token CSRF tidak ditemukan");

    const payload = {
      ...employeeData,
      department_id: parseInt(employeeData.department_id, 10),
    };

    const config = {
      headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) }
    };

    let response;
    if (action === 'create') {
      response = await api.post('/employees', payload, config);
    } else {
      response = await api.put(`/employees/${id}`, payload, config);
    }
    
    mutate(); // Refresh data SWR
    return response.data;
  };

  return {
    employees: data?.data,
    isLoading,
    isError: error,
    mutate,
    submitEmployee, // Kita ekspor satu fungsi submit yang cerdas
  };
}