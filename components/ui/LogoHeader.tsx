import Image from 'next/image';

export default function LogoHeader() {
  return (
    <div className="flex flex-col items-center py-6 sm:py-8">
      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-primary shadow-lg mb-4">
        <Image src="/logo.jpg" alt="Proxy Gyan Logo" width={112} height={112} />
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-heading mb-2 text-center">Proxy Gyan Personalized Timetable</h1>
      <p className="text-base sm:text-lg md:text-xl text-accent font-semibold text-center">{"Let's plot your pathway to LBSNAA!"}</p>
    </div>
  );
} 