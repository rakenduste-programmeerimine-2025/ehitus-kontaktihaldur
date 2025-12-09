"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, Users2, ArrowRight, Hammer, ChevronLeft, ChevronRight } from "lucide-react";

// Your existing types
type Contact = { id: number; name: string | null; number: string | null; cost: number | null; isblacklist: boolean };
type Obj = { id: number; name: string | null; location: string | null; description: string | null };
type SkillRow = { fk_contacts_id: number; skills: { name: string | null } | null };

export default function Home2() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Dashboard state (only used when logged in)
  const [favContacts, setFavContacts] = useState<Contact[]>([]);
  const [activeObjects, setActiveObjects] = useState<Obj[]>([]);
  const [contactSkills, setContactSkills] = useState<Record<number, string[]>>({});
  const [favIndex, setFavIndex] = useState(0);
  const [objIndex, setObjIndex] = useState(0);
  const CARDS_PER_PAGE = 5;

  useEffect(() => {
    const supabase = createClient();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Initial load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Load dashboard data only when user is logged in
  useEffect(() => {
    if (!user) {
      setFavContacts([]);
      setActiveObjects([]);
      return;
    }

    const supabase = createClient();

    const loadSkillsForContacts = async (contactIds: number[]) => {
      if (contactIds.length === 0) return {};
      const { data } = await supabase
        .from("hasskills")
        .select("fk_contacts_id, skills(name)")
        .in("fk_contacts_id", contactIds);
      const result: Record<number, string[]> = {};
      (data as SkillRow[] | null)?.forEach((row) => {
        const id = row.fk_contacts_id;
        const skill = row.skills?.name;
        if (!result[id]) result[id] = [];
        if (skill) result[id].push(skill);
      });
      return result;
    };

    const loadDashboard = async () => {
      const [favRes, objRes] = await Promise.all([
        supabase.from("contacts").select("id, name, number, cost, isblacklist").eq("isfavorite", true).eq("isdeleted", false),
        supabase.from("object").select("id, name, location, description").eq("isactive", true),
      ]);

      const favData = (favRes.data as Contact[]) ?? [];
      setFavContacts(favData);

      const skills = await loadSkillsForContacts(favData.map(c => c.id));
      setContactSkills(skills);

      setActiveObjects((objRes.data as Obj[]) ?? []);
    };

    void loadDashboard();
  }, [user]);

  // Still loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </main>
    );
  }

  // NOT LOGGED IN → Marketing Landing Page
  if (!user) {
    return (
      <>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden">
          <div className="absolute inset-0 bg-grid-neutral-200/30 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <Hammer className="w-14 h-14 text-neutral-800" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">Contactor</h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-10 max-w-3xl mx-auto">
              The contact & project manager for those who are handy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/sign-up">Start Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ArrowRight className="w-8 h-8 text-neutral-400 rotate-90" />
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-24 px-6 bg-grey-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Everything you need in one place</h2>
              <p className="text-xl text-neutral-600">No more Excel chaos or forgotten numbers.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "Who is who in your construction world",
                  desc: "All subcontractors, suppliers, and craftsmen in one searchable directory with skills, rates, and blacklist status.",
                  icon: Users,
                  img: "/screenshots/contacts.jpg",
                },
                {
                  title: "Manage your home or worksite",
                  desc: "Track active projects, attach contacts, photos, notes — never lose track again.",
                  icon: Home,
                  img: "/screenshots/objects.jpg",
                },
                {
                  title: "Work in a team",
                  desc: "Invite partners or family. Everyone sees the same up-to-date contacts and projects.",
                  icon: Users2,
                  img: "/screenshots/team.jpg",
                },
              ].map((feature, i) => (
                <Card key={i} className="overflow-hidden shadow-lg hover:shadow-2xl transition-all group">
                  <div className="relative h-64 bg-neutral-100">
                    <Image
                      src={feature.img}
                      alt={feature.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <feature.icon className="absolute bottom-4 left-4 w-12 h-12 text-white" />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-neutral-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA + Footer */}
        <section className="py-24 bg-neutral-900 text-white text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to take control?</h2>
            <Button asChild size="lg" variant="secondary" className="text-lg px-10">
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
          </div>
        </section>

        <footer className="py-12 border-t text-center text-neutral-500">
          © 2025 Contactor. Built for people who build things.
        </footer>
      </>
    );
  }

  // LOGGED IN → Your original dashboard (exactly as before, just cleaned up a bit)
  return (
    <main className="min-h-screen w-full flex flex-col items-center px-8 pb-20 pt-14">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-semibold">
          Welcome back, {user.user_metadata?.first_name || "User"}
        </h1>
        <p className="text-neutral-500 text-sm">Your workspace</p>
      </div>

      {/* Favourite Contacts */}
      <section className="w-full max-w-6xl mb-16">
        <h2 className="text-lg font-semibold mb-4">Favourite Contacts</h2>
        {favContacts.length === 0 ? (
          <p className="text-neutral-500">No favourites yet.</p>
        ) : (
          <div className="relative flex items-center">
            <button
              onClick={() => setFavIndex(Math.max(favIndex - 1, 0))}
              disabled={favIndex === 0}
              className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronLeft size={26} />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1 px-4">
              {favContacts.slice(favIndex, favIndex + CARDS_PER_PAGE).map((c) => (
                <Link key={c.id} href={`/contacts/${c.id}`}>
                  <Card className="h-40 rounded-lg border hover:shadow-md hover:scale-[1.02] transition bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate">{c.name}</h3>
                      <p className="text-xs text-neutral-500">{contactSkills[c.id]?.[0] || "No skill"}</p>
                      <p className="text-xs text-neutral-500 mt-1">Tel: {c.number}</p>
                      <p className="text-xs">Cost: {c.cost}€</p>
                      {c.isblacklist && <p className="text-xs text-red-600 mt-1">Blacklisted</p>}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setFavIndex(Math.min(favIndex + 1, Math.max(favContacts.length - CARDS_PER_PAGE, 0)))}
              disabled={favIndex >= favContacts.length - CARDS_PER_PAGE}
              className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        )}
      </section>

      {/* Active Objects */}
      <section className="w-full max-w-6xl">
        <h2 className="text-lg font-semibold mb-4">Active Objects</h2>
        {activeObjects.length === 0 ? (
          <p className="text-neutral-500">No active objects.</p>
        ) : (
          <div className="relative flex items-center">
            <button
              onClick={() => setObjIndex(Math.max(objIndex - 1, 0))}
              disabled={objIndex === 0}
              className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronLeft size={26} />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 px-4">
              {activeObjects.slice(objIndex, objIndex + CARDS_PER_PAGE).map((o) => (
                <Link key={o.id} href={`/objects/${o.id}`}>
                  <Card className="h-40 rounded-lg border hover:shadow-md hover:scale-[1.02] transition bg-white">
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate">{o.name}</h3>
                      <p className="text-xs text-neutral-500">{o.location}</p>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{o.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <button
              onClick={() => setObjIndex(Math.min(objIndex + 1, Math.max(activeObjects.length - CARDS_PER_PAGE, 0)))}
              disabled={objIndex >= activeObjects.length - CARDS_PER_PAGE}
              className="p-2 rounded-full hover:bg-neutral-100 disabled:opacity-30"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}