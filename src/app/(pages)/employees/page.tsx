'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEmployees } from '@/hooks/use-employees';
import { EmployeeTable } from './components/employee-table';
import { PlusCircle } from 'lucide-react';
import { EmployeeDialog } from './components/employee-dialog';

export default function EmployeePage() {
  const { employees, isLoading, isError, mutate, submitEmployee } = useEmployees();

  const renderContent = () => {
    if (isLoading) return <div className="text-center p-4">Loading data karyawan...</div>;
    if (isError) return <div className="text-center p-4 text-red-600">Gagal memuat data.</div>;

    if (!employees || employees.length === 0) {
      return (
        <div className="text-center p-4">
          <p className="mb-4">Belum ada data karyawan.</p>
          <EmployeeDialog onSuccess={mutate} submitAction={submitEmployee}>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Karyawan
            </Button>
          </EmployeeDialog>
        </div>
      );
    }

    return <EmployeeTable employees={employees} onSuccess={mutate} submitAction={submitEmployee} />;
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Manajemen Karyawan</CardTitle>
              <CardDescription>
                Lihat, tambah, edit, atau hapus data karyawan perusahaan.
              </CardDescription>
            </div>
            <EmployeeDialog onSuccess={mutate} submitAction={submitEmployee}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Karyawan
                </Button>
            </EmployeeDialog>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}