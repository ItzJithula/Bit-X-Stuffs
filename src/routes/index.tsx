import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, ShieldCheck, Zap, Headphones, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  price_label: string | null;
};

function Landing() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => setServices((data as Service[]) ?? []));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-24 text-center md:pt-24 md:pb-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Premium accounts, instant access
        </div>
        <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold tracking-tight md:text-7xl">
          Premium <span className="text-gradient">Bit X</span><br /> Account Marketplace
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          YouTube, Spotify, Netflix, ChatGPT and more — get verified premium accounts delivered straight to your dashboard.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#services">
            <Button size="lg" className="bg-gradient-primary text-white">
              Browse Services <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <Link to="/contact">
            <Button size="lg" variant="outline">Contact to Buy</Button>
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { v: "50+", l: "Premium Accounts" },
            { v: "24/7", l: "Support" },
            { v: "100%", l: "Verified" },
            { v: "Fast", l: "Delivery" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-4">
              <div className="text-2xl font-bold text-gradient">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { i: ShieldCheck, t: "Secure & Trusted", d: "SSL encryption and encrypted password storage for every account." },
            { i: Zap, t: "Instant Dashboard", d: "Manage every account you purchase from one clean dashboard." },
            { i: Headphones, t: "Personal Support", d: "Reach out anytime through our contact form — we reply fast." },
          ].map((f) => (
            <Card key={f.t} className="glass border-white/10 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary">
                <f.i className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Available <span className="text-gradient">Services</span></h2>
            <p className="mt-2 text-muted-foreground">Pick what you need — contact us to purchase.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id} className="glass group relative overflow-hidden border-white/10 p-6 transition hover:border-primary/40">
              <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {s.category}
              </div>
              <div className="text-4xl">{s.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-gradient">{s.price_label}</span>
                <Link to="/contact">
                  <Button size="sm" variant="outline">Get it</Button>
                </Link>
              </div>
            </Card>
          ))}
          {services.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-muted-foreground">
              Services loading…
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="mb-6 text-center text-3xl font-bold md:text-4xl">Frequently Asked <span className="text-gradient">Questions</span></h2>
        <Accordion type="single" collapsible className="glass rounded-2xl px-6">
          <AccordionItem value="1">
            <AccordionTrigger>How do I buy a premium account?</AccordionTrigger>
            <AccordionContent>
              Browse the services, then reach out via the Contact page. We'll respond with payment instructions and deliver the account to your dashboard.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="2">
            <AccordionTrigger>Where can I see my purchased accounts?</AccordionTrigger>
            <AccordionContent>
              Sign in and head to your Dashboard. Every account assigned to you appears there with credentials and notes.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="3">
            <AccordionTrigger>Is my data safe?</AccordionTrigger>
            <AccordionContent>
              Yes. All traffic is SSL encrypted, your password is hashed, and only you (and the admin) can see your account list.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="4">
            <AccordionTrigger>Do you offer support?</AccordionTrigger>
            <AccordionContent>
              Absolutely — use the Contact page anytime. We're happy to help with anything related to your accounts.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <footer className="border-t border-white/5 px-4 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bit X Stuffs — All rights reserved.
      </footer>
    </div>
  );
}
