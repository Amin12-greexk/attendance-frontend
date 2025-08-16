'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EmployeeForm, EmployeeFormValues } from './employee-form';
import toast from 'react-hot-toast';
import { Employee } from '@/hooks/use-employees';
import axios from 'axios';

interface EmployeeDialogProps {
  employee?: Employee;
  onSuccess: () => void;
  // Fungsi submit sekarang datang dari hook melalui props
  submitAction: (
    action: 'create' | 'update',
    data: EmployeeFormValues,
    id?: number
  ) => Promise<any>;
  children: React.ReactNode;
}

export function EmployeeDialog({ employee, onSuccess, submitAction, children }: EmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!employee;

  const handleSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await submitAction('update', values, employee.id);
        toast.success('Karyawan berhasil diperbarui!');
      } else {
        await submitAction('create', values);
        toast.success('Karyawan berhasil ditambahkan!');
      }
      onSuccess();
      setOpen(false);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 422) {
            const validationErrors = error.response.data.errors;
            let errorMessage = 'Terjadi kesalahan validasi:\n';
            for (const field in validationErrors) {
                errorMessage += `- ${validationErrors[field].join(', ')}\n`;
            }
            toast.error(errorMessage, { duration: 5000 });
        } else {
            toast.error(isEditMode ? 'Gagal memperbarui karyawan.' : 'Gagal menambahkan karyawan.');
        }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail di bawah ini.' : 'Isi detail di bawah ini.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <EmployeeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={employee}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}