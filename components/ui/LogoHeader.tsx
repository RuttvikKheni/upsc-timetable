import Image from 'next/image';

export default function LogoHeader() {
  return (
    <div className="bg-white border-b border-[#DDDDD890] py-4 fixed top-0 w-full z-20">
      <div className="container flex flex-wrap items-center justify-center sm:justify-between gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <div className="rounded-full overflow-hidden border-2 sm:border-4 border-primary shadow-lg">
            <Image src="/logo.jpg" alt="Proxy Gyan Logo" className='!w-[26px] !h-[26px] sm:!w-[30px] sm:!h-[30px]' width={30} height={30} />
          </div>
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-[22px] text-nowrap font-semibold text-center">Proxy Gyan Personalized Timetable</h1>
        </div>
        <p className="text-xs sm:text-sm md:text-[15px] lg:text-base text-accent font-semibold text-center">{"Let's plot your pathway to LBSNAA!"}</p>
      </div>
    </div>
  );
} 