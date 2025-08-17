'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAttendanceLog, AttendanceLog } from '@/hooks/use-attendance-log';
import { LogFilters } from './components/log-filters';
import { format } from 'date-fns';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { Button } from '@/components/ui/button';

// 🔧 Helper untuk normalisasi menit
const normalizeMinutes = (value: number | null | undefined): number => {
  if (!value) return 0;
  // Jika backend kirim dalam detik, aktifkan pembagian 60
  return Math.round(value >= 60 ? value / 60 : value);
};

// 🔧 Helper untuk waktu
const formatTime = (dateTimeString: string | null) => {
  if (!dateTimeString) return '-';
  return format(new Date(dateTimeString.replace(' ', 'T')), 'HH:mm:ss');
};

export default function AttendanceLogPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [departmentId, setDepartmentId] = useState('');
  const [page, setPage] = useState(1);

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : undefined;
  const { logData, isLoading, isError } = useAttendanceLog(formattedDate, departmentId, page);

  const handleExport = () => {
    if (!logData || logData.data.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const dataToExport = logData.data.map(log => ({
      nama_karyawan: log.employee.name,
      departemen: log.employee.department.name,
      tanggal: format(new Date(log.clock_in.replace(' ', 'T')), 'yyyy-MM-dd'),
      clock_in: formatTime(log.clock_in),
      clock_out: log.clock_out ? formatTime(log.clock_out) : '',
      status: log.status,
      terlambat: normalizeMinutes(log.lateness_minutes),
      lembur: normalizeMinutes(log.overtime_minutes),
      pulang_cepat: normalizeMinutes(log.early_leave_minutes),
    }));

    const csvConfig = mkConfig({
      fieldSeparator: ',',
      filename: `laporan-absensi-${formattedDate || 'semua'}`,
      columnHeaders: [
        'Nama Karyawan', 
        'Departemen', 
        'Tanggal', 
        'Clock In', 
        'Clock Out', 
        'Status', 
        'Terlambat (Menit)', 
        'Lembur (Menit)', 
        'Pulang Cepat (Menit)'
      ],
      useKeysAsHeaders: false,
    });

    const csv = generateCsv(csvConfig)(dataToExport);
    download(csvConfig)(csv);
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Log Absensi Karyawan</CardTitle>
          <CardDescription>
            Lihat dan saring riwayat absensi. Ekspor data ke CSV jika diperlukan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogFilters
            date={date}
            setDate={setDate}
            departmentId={departmentId}
            setDepartmentId={setDepartmentId}
            onExport={handleExport}
          />
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Karyawan</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detail Waktu (Menit)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-600">
                      Gagal memuat data.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && logData?.data.map((log: AttendanceLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">{log.employee.name}</div>
                      <div className="text-sm text-muted-foreground">{log.employee.department.name}</div>
                    </TableCell>
                    <TableCell>{formatTime(log.clock_in)}</TableCell>
                    <TableCell>{formatTime(log.clock_out)}</TableCell>
                    <TableCell>{log.status}</TableCell>
                    <TableCell className="text-sm">
                      {normalizeMinutes(log.lateness_minutes) > 0 && (
                        <div>Terlambat: {normalizeMinutes(log.lateness_minutes)} menit</div>
                      )}
                      {normalizeMinutes(log.overtime_minutes) > 0 && (
                        <div>Lembur: {normalizeMinutes(log.overtime_minutes)} menit</div>
                      )}
                      {normalizeMinutes(log.early_leave_minutes) > 0 && (
                        <div>Pulang Cepat: {normalizeMinutes(log.early_leave_minutes)} menit</div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && (!logData || logData.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Tidak ada data absensi yang ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!logData?.links.prev}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!logData?.links.next}
            >
              Selanjutnya
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
