import Link from 'next/link';
import { LayoutDashboard, Users, UserPlus, CalendarDays, ClipboardList } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Image from "next/image";

// Tipe untuk setiap kartu fitur
type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
};

// Komponen untuk kartu fitur agar lebih rapi
const FeatureCard = ({ icon, title, description, href }: FeatureCardProps) => (
  <Link href={href} passHref>
    <Card className="group transition-all duration-300 ease-in-out hover:border-yellow-400 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="mb-4 h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
          <div className="text-yellow-600 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  </Link>
);

export default function Home() {
  const features: FeatureCardProps[] = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Manajemen Karyawan',
      description: 'Tambah, edit, dan kelola data seluruh karyawan.',
      href: '/employees',
    },
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: 'Mesin Absensi',
      description: 'Lakukan clock-in dan clock-out untuk karyawan.',
      href: '/attendance',
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: 'Log Absensi',
      description: 'Lihat riwayat dan rekapitulasi data absensi.',
      href: '/attendance-log',
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: 'Entri Manual',
      description: 'Masukkan atau perbaiki data absensi secara manual.',
      href: '/manual-entry',
    },
  ];
  
  return (
    <div className="relative min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Watermark Logo Perusahaan */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://www.fleetify.id/fleetify-logo-color.svg"
            alt="Fleetify Logo Watermark"
            layout="fill"
            objectFit="contain"
            className="opacity-5 scale-150 rotate-[-15deg]"
          />
        </div>
        
        <main className="z-10 w-full max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800">
                    Sistem Absensi Karyawan
                </h1>
                <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                    Selamat datang di dasbor utama. Silakan pilih menu di bawah ini untuk memulai.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                ))}
            </div>
        </main>
    </div>
  );
}
