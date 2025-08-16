'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDepartments } from "@/hooks/use-departments";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";

interface LogFiltersProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  departmentId: string;
  setDepartmentId: (id: string) => void;
  onExport: () => void;
}

export function LogFilters({ date, setDate, departmentId, setDepartmentId, onExport }: LogFiltersProps) {
  const { departments, isLoading: isLoadingDepartments } = useDepartments();

  const handleDepartmentChange = (value: string) => {
    // Jika pengguna memilih 'all', kita set state ke string kosong agar filter tidak diterapkan
    setDepartmentId(value === 'all' ? '' : value);
  };

  // Tampilkan 'all' di UI jika state-nya string kosong, agar pilihan tetap terlihat
  const selectedValue = departmentId === '' ? 'all' : departmentId;

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-4">
      {/* Filter Tanggal */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full md:w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Filter Departemen */}
      <Select value={selectedValue} onValueChange={handleDepartmentChange} disabled={isLoadingDepartments}>
        <SelectTrigger className="w-full md:w-[280px]">
          <SelectValue placeholder={isLoadingDepartments ? "Memuat..." : "Pilih Departemen"} />
        </SelectTrigger>
        <SelectContent>
          {/* Gunakan 'all' sebagai value untuk menghindari string kosong */}
          <SelectItem value="all">Semua Departemen</SelectItem>
          {departments?.map(dept => (
            <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Tombol Ekspor */}
      <Button onClick={onExport} className="md:ml-auto">
        <Download className="mr-2 h-4 w-4" />
        Ekspor ke CSV
      </Button>
    </div>
  );
}
