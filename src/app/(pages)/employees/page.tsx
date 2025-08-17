'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEmployees } from '@/hooks/use-employees';
import { EmployeeTable } from './components/employee-table';
import { EmployeeDialog } from './components/employee-dialog';
import { EmployeeFormValues } from './components/employee-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

// Fungsi helper getCookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function EmployeesPage() {
  // State untuk menyimpan nomor halaman saat ini
  const [page, setPage] = useState(1);
  const { paginatedEmployees, isLoading, isError, mutate } = useEmployees(page);

  const handleSubmitAction = async (action: 'create' | 'update', data: EmployeeFormValues, id?: number) => {
    const toastId = toast.loading(action === 'create' ? 'Menambahkan karyawan...' : 'Memperbarui karyawan...');
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');
      await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) throw new Error("Token CSRF tidak ditemukan");

      const headers = { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) };
      const url = action === 'create' ? '/employees' : `/employees/${id}`;
      const method = action === 'create' ? 'post' : 'put';

      await api[method](url, data, { headers });

      toast.success(`Karyawan berhasil ${action === 'create' ? 'ditambahkan' : 'diperbarui'}!`, { id: toastId });
      mutate(); // Memuat ulang data di halaman saat ini
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || `Gagal ${action === 'create' ? 'menambahkan' : 'memperbarui'} karyawan.`;
      toast.error(errorMessage, { id: toastId });
      throw error;
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manajemen Karyawan</CardTitle>
            <CardDescription>
              Tambah, edit, atau hapus data karyawan.
            </CardDescription>
          </div>
          <EmployeeDialog onSuccess={mutate} submitAction={handleSubmitAction}>
            <Button>Tambah Karyawan</Button>
          </EmployeeDialog>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          )}
          {isError && <p className="text-center text-red-600">Gagal memuat data karyawan.</p>}
          
          {/* Tampilkan tabel dan tombol paginasi hanya jika data berhasil dimuat */}
          {!isLoading && paginatedEmployees && (
            <>
              <EmployeeTable
                employees={paginatedEmployees.data}
                onSuccess={mutate}
                submitAction={handleSubmitAction}
              />
            <div className="flex items-center justify-end space-x-2 py-4">
  <Button
    variant="outline"
    size="sm"
    onClick={() => setPage(page - 1)}
    disabled={!paginatedEmployees.prev_page_url}
  >
    Sebelumnya
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={() => setPage(page + 1)}
    disabled={!paginatedEmployees.next_page_url}
  >
    Selanjutnya
  </Button>
</div>

            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
