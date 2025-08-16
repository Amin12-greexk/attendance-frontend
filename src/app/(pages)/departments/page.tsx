'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDepartments } from '@/hooks/use-departments';
import { DepartmentTable } from './components/department-table';
import { DepartmentDialog } from './components/department-dialog'; // Ganti nama import
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function DepartmentPage() {
  const { departments, isLoading, isError, mutate } = useDepartments();

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-4">Loading data departemen...</div>;
    }

    if (isError) {
      return (
        <div className="text-center p-4 text-red-600">
          Gagal memuat data. Silakan coba lagi nanti.
        </div>
      );
    }
    
    // Perbarui penanganan empty state agar konsisten
    if (!departments || departments.length === 0) {
      return (
        <div className="text-center p-4">
          <p className="mb-4">Belum ada data departemen.</p>
          <DepartmentDialog onSuccess={mutate}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Departemen
            </Button>
          </DepartmentDialog>
        </div>
      );
    }

    return <DepartmentTable departments={departments} onSuccess={mutate} />;
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Manajemen Departemen</CardTitle>
              <CardDescription>
                Lihat, tambah, edit, atau hapus data departemen perusahaan.
              </CardDescription>
            </div>
            {/* Ganti Button biasa dengan komponen Dialog kita untuk "Tambah" */}
            <DepartmentDialog onSuccess={mutate}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Departemen
              </Button>
            </DepartmentDialog>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}