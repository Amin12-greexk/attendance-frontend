'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllEmployees } from '@/hooks/use-all-employees';
import { Employee } from '@/hooks/use-employees';
import { ChevronsUpDown, Check, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function formatTime(dateString: string | null | undefined) {
  if (!dateString) return '-';
  const date = new Date(dateString.replace(' ', 'T')); // jangan pakai 'Z'
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

export default function ManualEntryPage() {
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [clockInDate, setClockInDate] = useState<Date | undefined>(new Date());
  const [clockInTime, setClockInTime] = useState<string>('09:00');
  const [clockOutDate, setClockOutDate] = useState<Date | undefined>(new Date());
  const [clockOutTime, setClockOutTime] = useState<string>('17:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { allEmployees, isLoading: isLoadingEmployees } = useAllEmployees();

  const handleSubmit = async () => {
    if (!selectedEmployee || !clockInDate || !clockInTime) {
      toast.error('Harap pilih karyawan dan isi waktu Clock In.');
      return;
    }
    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');

      await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });

      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) {
        throw new Error('Token CSRF tidak bisa diambil setelah request.');
      }

      const fullClockIn = `${format(clockInDate, 'yyyy-MM-dd')} ${clockInTime}:00`;
      const fullClockOut =
        clockOutDate && clockOutTime
          ? `${format(clockOutDate, 'yyyy-MM-dd')} ${clockOutTime}:00`
          : null;

      console.log('Clock In (formatted):', formatTime(fullClockIn));
      console.log('Clock Out (formatted):', fullClockOut ? formatTime(fullClockOut) : '-');

      const payload = {
        employee_id: selectedEmployee.id,
        clock_in: fullClockIn,
        clock_out: fullClockOut,
      };

      await api.post('/attendance/manual-entry', payload, {
        headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) },
      });

      toast.success('Data absensi manual berhasil disimpan!');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        let errorMessage = 'Terjadi kesalahan validasi:\n';
        for (const field in validationErrors) {
          errorMessage += `- ${validationErrors[field].join(', ')}\n`;
        }
        toast.error(errorMessage, { duration: 6000 });
      } else {
        console.error(error);
        const errorMessage =
          error instanceof Error ? error.message : 'Gagal menyimpan data absensi.';
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Alat Entri Absensi Manual</CardTitle>
          <CardDescription>
            Masukkan atau perbaiki data absensi karyawan secara manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pilih Karyawan */}
          <div className="space-y-2">
            <Label>Pilih Karyawan</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                  disabled={isLoadingEmployees}
                >
                  {selectedEmployee
                    ? selectedEmployee.name
                    : isLoadingEmployees
                    ? 'Memuat karyawan...'
                    : 'Pilih karyawan...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0">
                <Command>
                  <CommandInput placeholder="Cari nama karyawan..." />
                  <CommandList>
                    <CommandEmpty>Karyawan tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {allEmployees?.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={employee.name}
                          onSelect={() => {
                            setSelectedEmployee(employee);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedEmployee?.id === employee.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {employee.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Input Clock In */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clockInDate">Tanggal Clock In</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !clockInDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {clockInDate ? format(clockInDate, 'PPP') : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={clockInDate}
                    onSelect={setClockInDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clockInTime">Waktu Clock In (HH:MM)</Label>
              <Input
                id="clockInTime"
                type="time"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
              />
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(`${format(clockInDate || new Date(), 'yyyy-MM-dd')} ${clockInTime}:00`)}
              </div>
            </div>
          </div>

          {/* Input Clock Out */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clockOutDate">Tanggal Clock Out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !clockOutDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {clockOutDate ? format(clockOutDate, 'PPP') : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={clockOutDate} onSelect={setClockOutDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clockOutTime">Waktu Clock Out (HH:MM)</Label>
              <Input
                id="clockOutTime"
                type="time"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
              />
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                {clockOutDate && clockOutTime
                  ? formatTime(`${format(clockOutDate, 'yyyy-MM-dd')} ${clockOutTime}:00`)
                  : '-'}
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data Absensi'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
