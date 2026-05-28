import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, ShoppingBag, Cookie, Copy, Gift } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

type Purchase = {
  id: string;
  service_name: string;
  account_email: string | null;
  account_password: string | null;
  notes: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
};

type FreeAccount = {
  id: string;
  service_name: string;
  category: string | null;
  description: string | null;
  cookies: string | null;
  account_email: string | null;
  account_password: string | null;
  instructions: string | null;
  created_at: string;
};

function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});
  const [fullName, setFullName] = useState("");
  const [freeAccounts, setFreeAccounts] = useState<FreeAccount[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/auth" });
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    supabase.from("purchases").select("*").order("created_at", { ascending: false }).then(({ data }) =>
      setPurchases((data as Purchase[]) ?? []),
    );
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) =>
      setFullName(data?.full_name ?? ""),
    );
    supabase.from("free_accounts").select("*").eq("active", true).order("created_at", { ascending: false }).then(({ data }) =>
      setFreeAccounts((data as FreeAccount[]) ?? []),
    );
  }, [user]);

  const copy = async (text: string, label = "Copied") => {
    try { await navigator.clipboard.writeText(text); toast.success(label); }
    catch { toast.error("Copy failed"); }
  };

  const updateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My <span className="text-gradient">Dashboard</span></h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="glass border-white/10 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><ShoppingBag className="h-5 w-5" /> My Premium Accounts</h2>
              <Badge variant="outline">{purchases.length}</Badge>
            </div>
            {purchases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
                No accounts yet. Visit the <a href="/contact" className="text-primary underline">contact page</a> to purchase one.
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((p) => (
                  <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{p.service_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Added {new Date(p.created_at).toLocaleDateString()}
                          {p.expires_at && ` · Expires ${new Date(p.expires_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <Badge className={p.status === "active" ? "bg-gradient-primary" : ""}>{p.status}</Badge>
                    </div>
                    {(p.account_email || p.account_password) && (
                      <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                        {p.account_email && (
                          <div className="rounded-lg bg-black/30 px-3 py-2">
                            <div className="text-[10px] uppercase text-muted-foreground">Email / Login</div>
                            <div className="font-mono">{p.account_email}</div>
                          </div>
                        )}
                        {p.account_password && (
                          <div className="flex items-center justify-between gap-2 rounded-lg bg-black/30 px-3 py-2">
                            <div>
                              <div className="text-[10px] uppercase text-muted-foreground">Password</div>
                              <div className="font-mono">{showPw[p.id] ? p.account_password : "••••••••••"}</div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setShowPw((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                              {showPw[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {p.notes && <p className="mt-2 text-xs text-muted-foreground">{p.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="glass h-fit border-white/10 p-6">
            <h2 className="text-lg font-semibold">Account</h2>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Email</Label>
                <Input value={user.email ?? ""} disabled />
              </div>
              <div>
                <Label htmlFor="fn">Full name</Label>
                <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <Button className="w-full bg-gradient-primary" onClick={updateProfile}>Save changes</Button>
            </div>
          </Card>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold"><Gift className="h-6 w-6" /> Free <span className="text-gradient">Accounts</span></h2>
              <p className="text-sm text-muted-foreground">Free accounts shared via cookies. Import them into your browser using a cookie-editor extension.</p>
            </div>
            <Badge variant="outline">{freeAccounts.length}</Badge>
          </div>

          {freeAccounts.length === 0 ? (
            <Card className="glass border-white/10 p-10 text-center text-sm text-muted-foreground">
              No free accounts available right now. Check back soon!
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {freeAccounts.map((f) => (
                <Card key={f.id} className="glass border-white/10 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold">{f.service_name}</div>
                      {f.category && <Badge variant="outline" className="mt-1">{f.category}</Badge>}
                    </div>
                    <Badge className="bg-gradient-primary"><Cookie className="mr-1 h-3 w-3" /> Free</Badge>
                  </div>
                  {f.description && <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>}

                  {(f.account_email || f.account_password) && (
                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      {f.account_email && (
                        <div className="rounded-lg bg-black/30 px-3 py-2">
                          <div className="text-[10px] uppercase text-muted-foreground">Email</div>
                          <div className="truncate font-mono text-xs">{f.account_email}</div>
                        </div>
                      )}
                      {f.account_password && (
                        <div className="rounded-lg bg-black/30 px-3 py-2">
                          <div className="text-[10px] uppercase text-muted-foreground">Password</div>
                          <div className="truncate font-mono text-xs">{showPw[f.id] ? f.account_password : "••••••••"}</div>
                          <Button size="sm" variant="ghost" className="mt-1 h-6 px-2" onClick={() => setShowPw((s) => ({ ...s, [f.id]: !s[f.id] }))}>
                            {showPw[f.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {f.cookies && (
                    <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Cookie className="h-3 w-3" /> Cookies ({f.cookies.length} chars)
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => setExpanded((s) => ({ ...s, [f.id]: !s[f.id] }))}>
                            {expanded[f.id] ? "Hide" : "View"}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => copy(f.cookies!, "Cookies copied")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {expanded[f.id] && (
                        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded bg-black/50 p-2 font-mono text-[10px] text-muted-foreground">
                          {f.cookies}
                        </pre>
                      )}
                    </div>
                  )}

                  {f.instructions && (
                    <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">How to use: </span>{f.instructions}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
