import { Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Wrench, LogOut, LayoutDashboard, Shield } from "lucide-react";

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Bit X <span className="text-gradient">Stuffs</span>
            </span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <Link to="/" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">Home</Link>
            <a href="/#services" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">Services</a>
            <a href="/#faq" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">FAQ</a>
            <Link to="/contact" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">Contact</Link>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Button size="sm" variant="ghost" onClick={() => router.navigate({ to: "/admin" })}>
                    <Shield className="h-4 w-4" /> Admin
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => router.navigate({ to: "/dashboard" })}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Button>
                <Button size="sm" variant="outline" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" className="bg-gradient-primary" onClick={() => router.navigate({ to: "/auth" })}>
                Sign In
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
