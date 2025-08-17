'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import toast from 'react-hot-toast';

import api from '@/lib/api';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { Employee } from '@/hooks/use-employees';
import { useAllEmployees } from '@/hooks/use-all-employees';
import { Department, useDepartments } from '@/hooks/use-departments';

import {
  ChevronsUpDown,
  Check,
  Clock,
  Building,
  ArrowLeft,
  Users,
} from 'lucide-react';

// ============================
// Types
// ============================
interface Attendance {
  id: number;
  employee_id: number;
  clock_in: string | null;
  clock_out: string | null;
  status: string;
}

// ============================
// Helpers
// ============================
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// ============================
// Main Component
// ============================
export default function AttendancePage() {
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const { allEmployees: employees, isLoading: isLoadingEmployees } = useAllEmployees();
  const { departments, isLoading: isLoadingDepartments } = useDepartments();

  const {
    data: latestAttendance,
    isLoading: isLoadingStatus,
    mutate: mutateStatus,
  } = useSWR<Attendance | null>(
    selectedEmployee ? `/employees/${selectedEmployee.id}/latest-attendance` : null,
    (url: string) => api.get(url).then((res) => res.data)
  );

  const employeesInSelectedDept = useMemo(() => {
    if (!employees || !selectedDepartment) return [];
    return employees.filter((emp) => emp.department_id === selectedDepartment.id);
  }, [employees, selectedDepartment]);

const formatTime = (dateTimeString: string | null | undefined) => {
  if (!dateTimeString) return 'N/A';
  // ganti ke format yang valid ISO tanpa paksa UTC
  const compatibleDateTimeString = dateTimeString.replace(' ', 'T');
  return new Date(compatibleDateTimeString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};


  const handleClockAction = async (action: 'in' | 'out') => {
    if (!selectedEmployee) return;

    const toastId = toast.loading(`Mencatat Absen ${action === 'in' ? 'Masuk' : 'Keluar'}...`);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '');
      await axios.get(`${backendUrl}/sanctum/csrf-cookie`, { withCredentials: true });
      const xsrfToken = getCookie('XSRF-TOKEN');
      if (!xsrfToken) throw new Error('Token CSRF tidak ditemukan');

      if (action === 'in') {
        await api.post(
          '/attendance/clock-in',
          { employee_id: selectedEmployee.id },
          { headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } }
        );
      } else {
        await api.put(
          '/attendance/clock-out',
          { employee_id: selectedEmployee.id },
          { headers: { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } }
        );
      }

      toast.success(
        `Absen ${action === 'in' ? 'Masuk' : 'Keluar'} untuk ${selectedEmployee.name} berhasil!`,
        { id: toastId }
      );
      mutateStatus();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || `Gagal mencatat Absen.`;
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    setSelectedEmployee(null);
  };

  const hasClockedIn = latestAttendance && latestAttendance.id && latestAttendance.clock_in;
  const hasClockedOut = hasClockedIn && latestAttendance.clock_out;

  const canClockIn = !hasClockedIn;
  const canClockOut = hasClockedIn && !hasClockedOut;

  // ============================
  // Render
  // ============================
  if (!selectedDepartment) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Pilih Departemen</h1>
          <p className="text-muted-foreground">
            Pilih departemen untuk melanjutkan absensi.
          </p>
        </header>
        {isLoadingDepartments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {departments?.map((dept) => (
              <Card
                key={dept.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                onClick={() => handleDepartmentSelect(dept)}
              >
                <CardHeader>
                  <CardTitle>{dept.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Masuk: {dept.max_clock_in_time}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    <span>Pulang: {dept.max_clock_out_time}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {employees?.filter((e) => e.department_id === dept.id).length || 0}{' '}
                      Karyawan
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSelectedDepartment(null)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Departemen
      </Button>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{selectedDepartment.name}</CardTitle>
          <CardDescription>
            Pilih karyawan untuk mencatat waktu masuk atau keluar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            <PopoverContent className="w-[380px] p-0">
              <Command>
                <CommandInput placeholder="Cari nama karyawan..." />
                <CommandList>
                  <CommandEmpty>Karyawan tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {employeesInSelectedDept.map((employee: Employee) => (
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

          {selectedEmployee && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                {isLoadingStatus ? (
                  <p className="text-sm text-muted-foreground">Mengecek status...</p>
                ) : (
                  <div className="text-sm space-y-2">
                    <h4 className="font-semibold">Status Hari Ini:</h4>
                    <p>
                      <strong>Clock In:</strong>{' '}
                      {hasClockedIn
                        ? `${formatTime(latestAttendance.clock_in)} (${latestAttendance.status})`
                        : 'Belum Clock In'}
                    </p>
                    <p>
                      <strong>Clock Out:</strong>{' '}
                      {hasClockedOut
                        ? formatTime(latestAttendance.clock_out)
                        : 'Belum Clock Out'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {selectedEmployee && (
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleClockAction('in')} disabled={!canClockIn}>
                Clock In
              </Button>
              <Button
                onClick={() => handleClockAction('out')}
                disabled={!canClockOut}
                variant="destructive"
              >
                Clock Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
