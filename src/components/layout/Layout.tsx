import { ReactNode, useState } from "react";
import { Navbar } from "./Navbar";
import { AuthModal } from "@/components/features/AuthModal";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar onAuthClick={() => setAuthModalOpen(true)} />
      <main className="w-full">{children}</main>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};
