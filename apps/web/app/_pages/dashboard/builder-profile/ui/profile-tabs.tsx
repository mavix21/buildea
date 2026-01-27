"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@buildea/ui/components/tabs";

interface ProfileTabsProps {
  overviewContent: ReactNode;
  projectsContent: ReactNode;
  postsContent: ReactNode;
}

export function ProfileTabs({
  overviewContent,
  projectsContent,
  postsContent,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="projects">Proyectos</TabsTrigger>
        <TabsTrigger value="posts">Posts</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        {overviewContent}
      </TabsContent>
      <TabsContent value="projects" className="mt-4">
        {projectsContent}
      </TabsContent>
      <TabsContent value="posts" className="mt-4">
        {postsContent}
      </TabsContent>
    </Tabs>
  );
}
