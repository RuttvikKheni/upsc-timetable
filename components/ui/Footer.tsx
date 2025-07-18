
export default function Footer() {
  return (
    <div className="bg-white border-t border-[#DDDDD890] py-3 fixed bottom-0 w-full z-20">
      <div className="container flex flex-wrap items-center justify-center sm:justify-between gap-2">
        <span className="text-[13px] sm:text-sm text-muted-foreground">© 2025 Proxy Gyan. All rights reserved.</span>
        <div className="flex gap-6 items-center">
          <span className="text-[13px] sm:text-sm text-muted-foreground">Privacy Policy</span>
          <span className="text-[13px] sm:text-sm text-muted-foreground">Terms of Service</span>
          <span className="text-[13px] sm:text-sm text-muted-foreground">Support</span>
        </div>
      </div>
    </div>
  );
} 