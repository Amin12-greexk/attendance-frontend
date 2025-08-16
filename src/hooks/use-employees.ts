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

const fetcher = (url: string) => api.get(url).then(res => res.data);

export function useEmployees() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Employee[] }>('/employees', fetcher);

  // CREATE
  const createEmployee = async (employee: Omit<Employee, 'id' | 'department'>) => {
    await api.post('/employees', employee);
    await mutate(); // refresh data
  };

  // UPDATE
  const updateEmployee = async (id: number, employee: Partial<Employee>) => {
    await api.put(`/employees/${id}`, employee);
    await mutate();
  };

  // DELETE
  const deleteEmployee = async (id: number) => {
    await api.delete(`/employees/${id}`);
    await mutate();
  };

  return {
    employees: data?.data,
    isLoading,
    isError: error,
    mutate,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
