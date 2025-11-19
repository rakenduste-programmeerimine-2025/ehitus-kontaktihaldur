"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Contact = {
  id: number;
  name: string | null;
  number: string | null;
  cost: number | null;
  isblacklist: boolean;
};

type Obj = {
  id: number;
  name: string | null;
  location: string | null;
  description: string | null;
};

type SkillRow = {
  fk_contacts_id: number;
  skills: { name: string | null } | null;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [favContacts, setFavContacts] = useState<Contact[]>([]);
  const [activeObjects, setActiveObjects] = useState<Obj[]>([]);
  const [contactSkills, setContactSkills] = useState<Record<number, string[]>>(
    {}
  );

  const [favIndex, setFavIndex] = useState(0);
  const [objIndex, setObjIndex] = useState(0);

  const CARDS_PER_PAGE = 5;

  const loadSkillsForContacts = async (contactIds: number[]) => {
    if (contactIds.length === 0) return {};

    const supabase = createClient();

    const { data } = await supabase
      .from("hasskills")
      .select("fk_contacts_id, skills(name)")
      .in("fk_contacts_id", contactIds)
      .order("fk_contacts_id");

    const result: Record<number, string[]> = {};

    (data as SkillRow[] | null)?.forEach((row) => {
      const id = row.fk_contacts_id;
      const skillName = row.skills?.name ?? null;

      if (!result[id]) result[id] = [];
      if (skillName) result[id].push(skillName);
    });

    return result;
  };

  useEffect(() => {
    const supabase = createClient();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const userResult = await supabase.auth.getUser();
      setUser(userResult.data.user ?? null);

      const favResult = await supabase
        .from("contacts")
        .select("id, name, number, cost, isblacklist")
        .eq("isfavorite", true)
        .eq("isdeleted", false)
        .order("id");

      const favData = (favResult.data as Contact[]) ?? [];
      setFavContacts(favData);

      const groupedSkills = await loadSkillsForContacts(
        favData.map((c) => c.id)
      );
      setContactSkills(groupedSkills);

      const objResult = await supabase
        .from("object")
        .select("id, name, location, description")
        .eq("isactive", true)
        .order("id");

      setActiveObjects((objResult.data as Obj[]) ?? []);

      setLoading(false);
    };

    void load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome to Construction Contact Manager
        </h1>
        <p className="text-neutral-500 text-sm mb-6">
          Please sign in to continue
        </p>

        <div className="flex gap-4">
          <Link href="/auth/login" className="px-4 py-2 border rounded">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="px-4 py-2 border rounded">
            Sign up
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center px-8 pb-20">
      <div className="text-center mt-14 mb-12">
        <h1 className="text-2xl font-semibold">
          Welcome back, {user.user_metadata?.first_name || "User"}
        </h1>
        <p className="text-neutral-500 text-sm">Your workspace</p>
      </div>

      <section className="w-full max-w-6xl mb-16">
        <h2 className="text-lg font-semibold mb-3">Favourite Contacts</h2>

        {favContacts.length === 0 ? (
          <p className="text-neutral-500 text-sm">No favourites yet.</p>
        ) : (
          <div className="relative flex items-center">
            <button
              onClick={() => setFavIndex(Math.max(favIndex - 1, 0))}
              disabled={favIndex === 0}
              className="p-2 rounded-full hover:bg-neutral-100 transition disabled:opacity-30"
            >
              <ChevronLeft size={26} />
            </button>

            <div className="grid grid-cols-5 gap-4 flex-1 px-4">
              {favContacts
                .slice(favIndex, favIndex + CARDS_PER_PAGE)
                .map((c) => (
                  <Link key={c.id} href={`/contacts/${c.id}`}>
                    <Card className="h-[150px] rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition bg-white">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{c.name}</h3>
                        <p className="text-xs text-neutral-500">
                          {contactSkills[c.id]?.[0] ?? "Eriala puudub"}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2">
                          Tel: {c.number}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Cost: {c.cost}€
                        </p>
                        {c.isblacklist && (
                          <p className="text-[10px] text-red-600 mt-1">
                            Blacklisted
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>

            <button
              onClick={() =>
                setFavIndex(
                  Math.min(
                    favIndex + 1,
                    Math.max(favContacts.length - CARDS_PER_PAGE, 0)
                  )
                )
              }
              disabled={favIndex >= favContacts.length - CARDS_PER_PAGE}
              className="p-2 rounded-full hover:bg-neutral-100 transition disabled:opacity-30"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        )}
      </section>

      <section className="w-full max-w-6xl">
        <h2 className="text-lg font-semibold mb-3">Active Objects</h2>

        {activeObjects.length === 0 ? (
          <p className="text-neutral-500 text-sm">No active objects.</p>
        ) : (
          <div className="relative flex items-center">
            <button
              onClick={() => setObjIndex(Math.max(objIndex - 1, 0))}
              disabled={objIndex === 0}
              className="p-2 rounded-full hover:bg-neutral-100 transition disabled:opacity-30"
            >
              <ChevronLeft size={26} />
            </button>

            <div className="grid grid-cols-4 gap-4 flex-1 px-4">
              {activeObjects
                .slice(objIndex, objIndex + CARDS_PER_PAGE)
                .map((o) => (
                  <Link key={o.id} href={`/objects/${o.id}`}>
                    <Card className="h-[150px] rounded-lg border border-neutral-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition bg-white">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{o.name}</h3>
                        <p className="text-xs text-neutral-500">
                          {o.location}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-2 line-clamp-2">
                          {o.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>

            <button
              onClick={() =>
                setObjIndex(
                  Math.min(
                    objIndex + 1,
                    Math.max(activeObjects.length - CARDS_PER_PAGE, 0)
                  )
                )
              }
              disabled={objIndex >= activeObjects.length - CARDS_PER_PAGE}
              className="p-2 rounded-full hover:bg-neutral-100 transition disabled:opacity-30"
            >
              <ChevronRight size={26} />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
