
export default function Footer() {
  return (
    <div className="bg-white border-t border-[#DDDDD890] py-3 fixed bottom-0 w-full z-20">
      <div className="container flex flex-wrap items-center justify-center sm:justify-between gap-2">
        <span className="text-[13px] sm:text-sm text-muted-foreground">© 2025 Proxy Gyan. All rights reserved.</span>
        <div className="flex gap-6 items-center">
          <a href="https://www.proxygyan.com/privacy-policy" target="_blank" className="text-[13px] sm:text-sm text-muted-foreground cursor-pointer hover:text-primary transition duration-200">Privacy Policy</a>
          <a href="https://www.proxygyan.com/terms-of-services" target="_blank" className="text-[13px] sm:text-sm text-muted-foreground cursor-pointer hover:text-primary transition duration-200">Terms of Service</a>
          <a href="https://www.proxygyan.com" target="_blank" className="text-[13px] sm:text-sm text-muted-foreground cursor-pointer hover:text-primary transition duration-200">Support</a>
        </div>
      </div>
    </div>
  );
} 