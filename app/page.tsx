import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        {!user ? (
          <section className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <h1 className="text-3xl font-bold mb-4">
              Welcome to the Construction Contact Manager!
            </h1>
            <div className="w-[690] h-[2px] bg-foreground/20 mb-10"></div>
            <p className="text-base text-muted-foreground">
              Please sign in or sign up to get started managing your contacts.
            </p>
            <div className="flex gap-4 mt-6">
              <Button asChild variant="default">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="flex flex-col items-center justify-start p-10 text-center mt-20">
            <h1 className="text-3xl font-semibold mb-2">
              Hello, {user.user_metadata?.first_name || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Welcome back to your Contact Manager.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}