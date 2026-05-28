import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, MessageSquare, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", service_interest: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(form);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent! We'll reply soon.");
    setForm({ name: "", email: "", subject: "", service_interest: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold md:text-5xl">Let's <span className="text-gradient">talk</span></h1>
          <p className="mt-3 text-muted-foreground">
            Interested in a premium account? Send a message — we'll get back to you with prices and delivery details.
          </p>
          <div className="mt-8 space-y-4">
            <div className="glass flex items-start gap-3 rounded-xl p-4">
              <Mail className="mt-1 h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold">Email</div>
                <div className="text-xs text-muted-foreground">Use the form — we reply directly to your email.</div>
              </div>
            </div>
            <div className="glass flex items-start gap-3 rounded-xl p-4">
              <MessageSquare className="mt-1 h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold">Response time</div>
                <div className="text-xs text-muted-foreground">Usually within a few hours.</div>
              </div>
            </div>
          </div>
        </div>

        <Card className="glass border-white/10 p-6">
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="n">Name</Label>
                <Input id="n" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="e">Email</Label>
                <Input id="e" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="s">Subject</Label>
              <Input id="s" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="si">Interested in (service)</Label>
              <Input id="si" placeholder="e.g. YouTube Premium" value={form.service_interest} onChange={(e) => setForm({ ...form, service_interest: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="m">Message</Label>
              <Textarea id="m" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
              <Send className="h-4 w-4" /> {loading ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
