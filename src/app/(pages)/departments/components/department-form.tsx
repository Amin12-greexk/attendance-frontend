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
import { Input } from '@/components/ui/input';
import { Department } from '@/hooks/use-departments';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Nama departemen minimal harus 3 karakter.',
  }),
  max_clock_in_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format waktu harus HH:MM (contoh: 09:00)',
  }),
  max_clock_out_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Format waktu harus HH:MM (contoh: 17:00)',
  }),
});

export type DepartmentFormValues = z.infer<typeof formSchema>;
interface DepartmentFormProps {
  onSubmit: (values: DepartmentFormValues) => void;
  isSubmitting: boolean;
  initialData?: Department;
}

export function DepartmentForm({ onSubmit, isSubmitting, initialData }: DepartmentFormProps) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      max_clock_in_time: initialData.max_clock_in_time.substring(0, 5),
      max_clock_out_time: initialData.max_clock_out_time.substring(0, 5),
    } : {
      name: '',
      max_clock_in_time: '',
      max_clock_out_time: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        max_clock_in_time: initialData.max_clock_in_time.substring(0, 5),
        max_clock_out_time: initialData.max_clock_out_time.substring(0, 5),
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Departemen</FormLabel>
              <FormControl>
                <Input placeholder="cth: Teknologi Informasi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_clock_in_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jam Masuk Maksimal</FormLabel>
              <FormControl>
                <Input placeholder="cth: 09:00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_clock_out_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jam Keluar Maksimal</FormLabel>
              <FormControl>
                <Input placeholder="cth: 17:00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Form>
  );
}