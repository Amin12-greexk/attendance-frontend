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
import { DepartmentForm, DepartmentFormValues } from './department-form';
import { PlusCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Department } from '@/hooks/use-departments';
import axios from 'axios';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface DepartmentDialogProps {
  department?: Department;
  onSuccess: () => void;
  children: React.ReactNode; 
}

export function DepartmentDialog({ department, onSuccess, children }: DepartmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!department; 

  const handleSubmit = async (values: DepartmentFormValues) => {
    setIsSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');
      await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
      const xsrfToken = getCookie('XSRF-TOKEN');

      if (!xsrfToken) {
        toast.error("Gagal mendapatkan token keamanan.");
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
          ...values,
          max_clock_in_time: `${values.max_clock_in_time}:00`,
          max_clock_out_time: `${values.max_clock_out_time}:00`,
      };

      if (isEditMode) {
        // Logika untuk UPDATE (PUT)
        await api.put(`/departments/${department.id}`, payload, {
          headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) }
        });
        toast.success('Departemen berhasil diperbarui!');
      } else {
        // Logika untuk CREATE (POST)
        await api.post('/departments', payload, {
          headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) }
        });
        toast.success('Departemen berhasil ditambahkan!');
      }

      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(isEditMode ? 'Gagal memperbarui departemen.' : 'Gagal menambahkan departemen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Departemen' : 'Tambah Departemen Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail di bawah ini dan klik simpan.' : 'Isi detail di bawah ini untuk menambahkan departemen baru.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <DepartmentForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={department} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}