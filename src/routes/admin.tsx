import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Users, ShoppingBag, Wrench, Mail, BarChart3, Cookie } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Profile = { id: string; email: string; full_name: string | null; created_at: string };
type Service = { id: string; name: string; slug: string; description: string | null; icon: string | null; category: string | null; price_label: string | null; active: boolean };
type Purchase = {
  id: string; user_id: string; service_id: string | null; service_name: string;
  account_email: string | null; account_password: string | null; notes: string | null;
  status: string; expires_at: string | null; created_at: string;
};
type Message = { id: string; name: string; email: string; subject: string | null; message: string; service_interest: string | null; resolved: boolean; created_at: string };
type FreeAccount = { id: string; service_name: string; category: string | null; description: string | null; cookies: string | null; account_email: string | null; account_password: string | null; instructions: string | null; active: boolean; created_at: string };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [freeAccounts, setFreeAccounts] = useState<FreeAccount[]>([]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.navigate({ to: "/" });
  }, [user, isAdmin, loading]);

  const reload = async () => {
    const [p, s, pu, m, fa] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("services").select("*").order("created_at"),
      supabase.from("purchases").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("free_accounts").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles((p.data as Profile[]) ?? []);
    setServices((s.data as Service[]) ?? []);
    setPurchases((pu.data as Purchase[]) ?? []);
    setMessages((m.data as Message[]) ?? []);
    setFreeAccounts((fa.data as FreeAccount[]) ?? []);
  };

  useEffect(() => {
    if (isAdmin) reload();
  }, [isAdmin]);

  if (!isAdmin) return null;

  const analyticsData = services.map((s) => ({
    name: s.name.split(" ")[0],
    purchases: purchases.filter((p) => p.service_id === s.id || p.service_name === s.name).length,
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold">Admin <span className="text-gradient">Dashboard</span></h1>
        <p className="text-sm text-muted-foreground">Manage users, services, premium accounts and messages.</p>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Users, l: "Users", v: profiles.length },
            { i: ShoppingBag, l: "Purchases", v: purchases.length },
            { i: Wrench, l: "Services", v: services.length },
            { i: Mail, l: "Messages", v: messages.filter((m) => !m.resolved).length },
          ].map((s) => (
            <Card key={s.l} className="glass border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                  <div className="text-2xl font-bold">{s.v}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
                  <s.i className="h-5 w-5 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="purchases" className="mt-8">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="free"><Cookie className="h-4 w-4" /> Free Accounts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <PurchasesTab purchases={purchases} profiles={profiles} services={services} reload={reload} />
          </TabsContent>
          <TabsContent value="free">
            <FreeAccountsTab items={freeAccounts} reload={reload} />
          </TabsContent>
          <TabsContent value="users">
            <Card className="glass mt-4 border-white/10 p-4">
              <Table>
                <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Name</TableHead><TableHead>Joined</TableHead><TableHead># Purchases</TableHead></TableRow></TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.email}</TableCell>
                      <TableCell>{p.full_name ?? "—"}</TableCell>
                      <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{purchases.filter((x) => x.user_id === p.id).length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
          <TabsContent value="services">
            <ServicesTab services={services} reload={reload} />
          </TabsContent>
          <TabsContent value="messages">
            <Card className="glass mt-4 border-white/10 p-4">
              <div className="space-y-3">
                {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
                {messages.map((m) => (
                  <div key={m.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{m.name} <span className="text-xs font-normal text-muted-foreground">· {m.email}</span></div>
                        <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()} {m.service_interest && `· ${m.service_interest}`}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={m.resolved ? "outline" : "default"} className={!m.resolved ? "bg-gradient-primary" : ""}>{m.resolved ? "Resolved" : "New"}</Badge>
                        <Button size="sm" variant="outline" onClick={async () => {
                          await supabase.from("contact_messages").update({ resolved: !m.resolved }).eq("id", m.id);
                          reload();
                        }}>{m.resolved ? "Reopen" : "Mark resolved"}</Button>
                      </div>
                    </div>
                    {m.subject && <div className="mt-2 text-sm font-medium">{m.subject}</div>}
                    <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="analytics">
            <Card className="glass mt-4 border-white/10 p-6">
              <h3 className="mb-4 font-semibold">Purchases per Service</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "rgba(20,20,40,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Bar dataKey="purchases" fill="oklch(0.65 0.22 285)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PurchasesTab({ purchases, profiles, services, reload }: { purchases: Purchase[]; profiles: Profile[]; services: Service[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Partial<Purchase> | null>(null);

  const save = async () => {
    if (!edit?.user_id || !edit?.service_name) return toast.error("User and service required");
    const payload = {
      user_id: edit.user_id, service_id: edit.service_id ?? null, service_name: edit.service_name,
      account_email: edit.account_email ?? null, account_password: edit.account_password ?? null,
      notes: edit.notes ?? null, status: edit.status ?? "active", expires_at: edit.expires_at || null,
    };
    const { error } = edit.id
      ? await supabase.from("purchases").update(payload).eq("id", edit.id)
      : await supabase.from("purchases").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEdit(null); reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this purchase?")) return;
    const { error } = await supabase.from("purchases").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); reload();
  };

  return (
    <Card className="glass mt-4 border-white/10 p-4">
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary" onClick={() => setEdit({ status: "active" })}><Plus className="h-4 w-4" /> Add Purchase</Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10">
            <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "New"} Purchase</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>User</Label>
                <Select value={edit?.user_id ?? ""} onValueChange={(v) => setEdit({ ...edit, user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>{profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Service</Label>
                <Select value={edit?.service_id ?? ""} onValueChange={(v) => {
                  const svc = services.find((s) => s.id === v);
                  setEdit({ ...edit, service_id: v, service_name: svc?.name ?? edit?.service_name ?? "" });
                }}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>{services.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Account email/login</Label><Input value={edit?.account_email ?? ""} onChange={(e) => setEdit({ ...edit, account_email: e.target.value })} /></div>
              <div><Label>Password</Label><Input value={edit?.account_password ?? ""} onChange={(e) => setEdit({ ...edit, account_password: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={edit?.notes ?? ""} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={edit?.status ?? "active"} onValueChange={(v) => setEdit({ ...edit, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="expired">expired</SelectItem>
                      <SelectItem value="pending">pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Expires</Label><Input type="date" value={edit?.expires_at?.slice(0,10) ?? ""} onChange={(e) => setEdit({ ...edit, expires_at: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-primary">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Service</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {purchases.map((p) => {
            const u = profiles.find((x) => x.id === p.user_id);
            return (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{u?.email ?? p.user_id.slice(0, 8)}</TableCell>
                <TableCell>{p.service_name}</TableCell>
                <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEdit(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function ServicesTab({ services, reload }: { services: Service[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Partial<Service> | null>(null);

  const save = async () => {
    if (!edit?.name || !edit?.slug) return toast.error("Name and slug required");
    const payload = {
      name: edit.name, slug: edit.slug, description: edit.description ?? null,
      icon: edit.icon ?? null, category: edit.category ?? null, price_label: edit.price_label ?? null,
      active: edit.active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("services").update(payload).eq("id", edit.id)
      : await supabase.from("services").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEdit(null); reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete service?")) return;
    await supabase.from("services").delete().eq("id", id);
    reload();
  };

  return (
    <Card className="glass mt-4 border-white/10 p-4">
      <div className="mb-4 flex justify-end">
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary" onClick={() => setEdit({ active: true })}><Plus className="h-4 w-4" /> Add Service</Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10">
            <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "New"} Service</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={edit?.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={edit?.slug ?? ""} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={edit?.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Icon (emoji)</Label><Input value={edit?.icon ?? ""} onChange={(e) => setEdit({ ...edit, icon: e.target.value })} /></div>
                <div><Label>Category</Label><Input value={edit?.category ?? ""} onChange={(e) => setEdit({ ...edit, category: e.target.value })} /></div>
                <div><Label>Price label</Label><Input value={edit?.price_label ?? ""} onChange={(e) => setEdit({ ...edit, price_label: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-primary">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead></TableHead><TableHead>Name</TableHead><TableHead>Category</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {services.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="text-2xl">{s.icon}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.category}</TableCell>
              <TableCell>{s.active ? <Badge className="bg-gradient-primary">Active</Badge> : <Badge variant="outline">Hidden</Badge>}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEdit(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function FreeAccountsTab({ items, reload }: { items: FreeAccount[]; reload: () => void }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Partial<FreeAccount> | null>(null);

  const save = async () => {
    if (!edit?.service_name) return toast.error("Service name required");
    const payload = {
      service_name: edit.service_name,
      category: edit.category ?? null,
      description: edit.description ?? null,
      cookies: edit.cookies ?? null,
      account_email: edit.account_email ?? null,
      account_password: edit.account_password ?? null,
      instructions: edit.instructions ?? null,
      active: edit.active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("free_accounts").update(payload).eq("id", edit.id)
      : await supabase.from("free_accounts").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEdit(null); reload();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this free account?")) return;
    const { error } = await supabase.from("free_accounts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); reload();
  };

  return (
    <Card className="glass mt-4 border-white/10 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Free accounts are visible to all signed-in users in their dashboard.</p>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary" onClick={() => setEdit({ active: true })}><Plus className="h-4 w-4" /> Add Free Account</Button>
          </DialogTrigger>
          <DialogContent className="glass max-h-[90vh] overflow-y-auto border-white/10">
            <DialogHeader><DialogTitle>{edit?.id ? "Edit" : "New"} Free Account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Service Name *</Label><Input value={edit?.service_name ?? ""} onChange={(e) => setEdit({ ...edit, service_name: e.target.value })} placeholder="Netflix, ChatGPT…" /></div>
                <div><Label>Category</Label><Input value={edit?.category ?? ""} onChange={(e) => setEdit({ ...edit, category: e.target.value })} placeholder="Streaming, AI…" /></div>
              </div>
              <div><Label>Description</Label><Textarea rows={2} value={edit?.description ?? ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email / Login (optional)</Label><Input value={edit?.account_email ?? ""} onChange={(e) => setEdit({ ...edit, account_email: e.target.value })} /></div>
                <div><Label>Password (optional)</Label><Input value={edit?.account_password ?? ""} onChange={(e) => setEdit({ ...edit, account_password: e.target.value })} /></div>
              </div>
              <div>
                <Label>Cookies (Netscape / JSON)</Label>
                <Textarea rows={6} className="font-mono text-xs" value={edit?.cookies ?? ""} onChange={(e) => setEdit({ ...edit, cookies: e.target.value })} placeholder="Paste cookie string here…" />
              </div>
              <div><Label>Instructions</Label><Textarea rows={2} value={edit?.instructions ?? ""} onChange={(e) => setEdit({ ...edit, instructions: e.target.value })} placeholder="How to import the cookies…" /></div>
              <div className="flex items-center gap-2">
                <Switch checked={edit?.active ?? true} onCheckedChange={(v) => setEdit({ ...edit, active: v })} />
                <Label>Active (visible to users)</Label>
              </div>
            </div>
            <DialogFooter><Button onClick={save} className="bg-gradient-primary">Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Has Cookies</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>
          {items.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">{f.service_name}</TableCell>
              <TableCell>{f.category ?? "—"}</TableCell>
              <TableCell>{f.cookies ? <Badge variant="outline">{f.cookies.length} chars</Badge> : "—"}</TableCell>
              <TableCell>{f.active ? <Badge className="bg-gradient-primary">Active</Badge> : <Badge variant="outline">Hidden</Badge>}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEdit(f); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No free accounts yet.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
