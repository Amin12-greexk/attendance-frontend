'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Department } from '@/hooks/use-departments';
import { MoreHorizontal } from 'lucide-react';
import { DepartmentDialog } from './department-dialog';
import { ConfirmationDialog } from './confirmation-dialog';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Fungsi ambil cookie CSRF
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface DepartmentTableProps {
  onSuccess: () => void;
}

export function DepartmentTable({ onSuccess }: DepartmentTableProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const formatTime = (time: string) => time.substring(0, 5);

  // Ambil data departemen dengan pagination
  const fetchDepartments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/departments?page=${page}`);
      setDepartments(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data departemen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(currentPage);
  }, [currentPage]);

  const handleDelete = async (departmentId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');
      await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
      const xsrfToken = getCookie('XSRF-TOKEN');

      if (!xsrfToken) {
        toast.error('Gagal mendapatkan token keamanan.');
        return;
      }

      await api.delete(`/departments/${departmentId}`, {
        headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) },
      });

      toast.success('Departemen berhasil dihapus!');
      fetchDepartments(currentPage); // reload data halaman sekarang
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus departemen. Coba lagi.');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Max In</TableHead>
            <TableHead>Max Out</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : departments.length > 0 ? (
            departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.id}</TableCell>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>{formatTime(department.max_clock_in_time)}</TableCell>
                <TableCell>{formatTime(department.max_clock_out_time)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DepartmentDialog department={department} onSuccess={() => fetchDepartments(currentPage)}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Edit
                        </DropdownMenuItem>
                      </DepartmentDialog>

                      <ConfirmationDialog
                        title="Apakah Anda Yakin?"
                        description={`Data departemen "${department.name}" akan dihapus secara permanen.`}
                        onConfirm={() => handleDelete(department.id)}
                      >
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Hapus
                        </DropdownMenuItem>
                      </ConfirmationDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Tidak ada data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </Button>
        <span>
          Halaman {currentPage} dari {lastPage}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === lastPage}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
