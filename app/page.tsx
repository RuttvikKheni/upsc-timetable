import { MultiStepForm } from "../components/multi-step-form";
import LogoHeader from "../components/ui/LogoHeader";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="container mx-auto px-2 sm:px-4">
        <LogoHeader />
        <MultiStepForm />
      </div>
    </main>
  );
} 