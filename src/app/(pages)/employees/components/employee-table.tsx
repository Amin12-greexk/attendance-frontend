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
import { Employee } from '@/hooks/use-employees';
import { MoreHorizontal } from 'lucide-react';
import { EmployeeDialog } from './employee-dialog';
import { ConfirmationDialog } from '../../departments/components/confirmation-dialog';
import { EmployeeFormValues } from './employee-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

// Fungsi helper getCookie
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}


interface EmployeeTableProps {
  employees: Employee[];
  onSuccess: () => void;
  submitAction: (action: 'create' | 'update', data: EmployeeFormValues, id?: number) => Promise<any>;
}

export function EmployeeTable({ employees, onSuccess, submitAction }: EmployeeTableProps) {
  // Logika lengkap untuk menghapus karyawan
  const handleDelete = async (employeeId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');
      await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
      const xsrfToken = getCookie('XSRF-TOKEN');

      if (!xsrfToken) {
        toast.error("Gagal mendapatkan token keamanan.");
        return;
      }

      await api.delete(`/employees/${employeeId}`, {
        headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) }
      });
      
      toast.success('Karyawan berhasil dihapus!');
      onSuccess(); // Refresh data di tabel
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus karyawan. Coba lagi.');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Nama Karyawan</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.department.name}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EmployeeDialog employee={employee} onSuccess={onSuccess} submitAction={submitAction}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                      </DropdownMenuItem>
                    </EmployeeDialog>
                    {/* Integrasi lengkap untuk Hapus */}
                    <ConfirmationDialog
                      title="Apakah Anda Yakin?"
                      description={`Data karyawan "${employee.name}" akan dihapus secara permanen.`}
                      onConfirm={() => handleDelete(employee.id)}
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