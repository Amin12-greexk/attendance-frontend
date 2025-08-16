'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { useDepartments, Department } from '@/hooks/use-departments';
import { useEffect } from 'react';
import { Employee } from '@/hooks/use-employees';

// Skema validasi Zod
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nama minimal harus 3 karakter.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  position: z.string().min(2, { message: 'Posisi minimal harus 2 karakter.' }),
  department_id: z.string().min(1, { message: 'Departemen wajib diisi.' }),
});

// Tipe ini dihasilkan dari skema di atas, dengan department_id: string
export type EmployeeFormValues = z.infer<typeof formSchema>;

// Perbaikan: Prop onSubmit sekarang harus menerima EmployeeFormValues
interface EmployeeFormProps {
  onSubmit: (values: EmployeeFormValues) => void;
  isSubmitting: boolean;
  initialData?: Employee;
}

export function EmployeeForm({ onSubmit, isSubmitting, initialData }: EmployeeFormProps) {
  const { departments, isLoading: isLoadingDepartments } = useDepartments();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      position: initialData.position,
      department_id: String(initialData.department_id),
    } : {
      name: '',
      email: '',
      position: '',
      department_id: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        position: initialData.position,
        department_id: String(initialData.department_id),
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="cth: John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="cth: john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posisi</FormLabel>
              <FormControl>
                <Input placeholder="cth: Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="department_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departemen</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingDepartments}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingDepartments ? "Memuat departemen..." : "Pilih departemen"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments?.map((dept: Department) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
