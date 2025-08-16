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
import { ConfirmationDialog } from './confirmation-dialog'; // <-- 1. Import
import api from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

// ... fungsi getCookie ...
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}


interface DepartmentTableProps {
  departments: Department[];
  onSuccess: () => void;
}

export function DepartmentTable({ departments, onSuccess }: DepartmentTableProps) {
  const formatTime = (time: string) => time.substring(0, 5);

  // 2. Buat fungsi untuk menangani aksi hapus
  const handleDelete = async (departmentId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');
      await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
      const xsrfToken = getCookie('XSRF-TOKEN');

      if (!xsrfToken) {
        toast.error("Gagal mendapatkan token keamanan.");
        return;
      }

      await api.delete(`/departments/${departmentId}`, {
        headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) }
      });
      
      toast.success('Departemen berhasil dihapus!');
      onSuccess(); // Refresh data di tabel
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus departemen. Coba lagi.');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {/* ... TableHeader tetap sama ... */}
        </TableHeader>
        <TableBody>
          {departments.map((department) => (
            <TableRow key={department.id}>
              {/* ... TableCell lainnya tetap sama ... */}
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
                    <DepartmentDialog department={department} onSuccess={onSuccess}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                      </DropdownMenuItem>
                    </DepartmentDialog>

                    {/* 3. Bungkus item Hapus dengan ConfirmationDialog */}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}