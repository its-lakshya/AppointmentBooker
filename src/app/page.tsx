"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <section className="max-w-3xl w-full text-center space-y-8">
        <div className="mb-16 w-full flex items-center justify-center">
          {/* <Illustration /> */}
          <div className="scale-200 bg-sidebar-primary text-sidebar-primary-foreground font-medium text-xl flex aspect-square size-8 items-center justify-center rounded-lg">
            B
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Crafting Your Booking Experience
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            I&apos;am currently building something awesome. This temporary home
            page is just a stop on the way to your dashboard.
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            className={cn(
              "text-lg px-6 py-4 transition-all duration-300 hover:scale-[1.02]"
            )}
            variant={"default"}
            onClick={() => router.push("/dashboard/services")}
          >
            Go to Dashboard
          </Button>
        </div>
      </section>
    </main>
  );
}
