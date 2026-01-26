import Image from "next/image";

import { Button } from "@buildea/ui/components/button";

import PageContainer from "@/shared/ui/page-container";

import {
  allArcades,
  arcadeCategories,
  featuredArcades,
} from "./model/mock-data";
import { ArcadeCard } from "./ui/arcade-card";

export function ArcadePage() {
  return (
    <PageContainer className="space-y-12">
      {/* Hero Banner */}
      <div className="bg-muted flex h-80 items-center justify-center bg-[url(/arcade/arcade-hero.jpg)] bg-cover bg-center bg-no-repeat">
        {/* <h1 className="font-pixel text-primary text-4xl">Arcade</h1> */}
      </div>

      {/* Featured Section: The Legend Of Satoshi */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Image src="/icons/bitcoin.png" alt="" width={36} height={36} />
          <h2 className="font-pixel text-wrap-balance text-xl leading-none">
            The Legend Of Satoshi
          </h2>
        </div>
        <p className="text-muted-foreground max-w-[65ch]">
          Get started with blockchain fundamentals, a beginner-friendly path
          great for learning the basics of crypto and decentralized
          applications.
        </p>

        {/* Featured Arcades Grid */}
        <div className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {featuredArcades.map((arcade, index) => (
            <ArcadeCard
              key={arcade.id}
              arcade={{
                ...arcade,
                id: `${index + 1}`,
              }}
              variant="featured"
            />
          ))}
        </div>
      </section>

      {/* All Arcades Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <Image
            src="/icons/game-controller.png"
            alt=""
            width={32}
            height={32}
          />
          <h2 className="font-pixel text-wrap-balance text-xl">All Arcades</h2>
        </div>

        {/* Category Filters */}
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter arcades by category"
        >
          {arcadeCategories.map((category, index) => (
            <Button
              size="sm"
              key={category}
              variant={index === 0 ? "default" : "outline"}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* All Arcades Grid */}
        <div className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {allArcades.map((arcade) => (
            <ArcadeCard key={arcade.id} arcade={arcade} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
