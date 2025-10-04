
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, List, ShieldCheck } from 'lucide-react';

function OverviewTab() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Understanding Cyber Security
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Cyber security refers to the practice of protecting systems,
            networks, and programs from digital attacks. These cyberattacks are
            usually aimed at accessing, changing, or destroying sensitive
            information; extorting money from users; or interrupting normal
            business processes.
          </p>
          <p className="mt-4">
            In today's interconnected world, everyone benefits from advanced
            cyber defense programs. At an individual level, a cybersecurity
            attack can result in everything from identity theft to extortion
            attempts to the loss of important data.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Why Cyber Security Matters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-muted-foreground list-disc pl-5">
            <li>Protection of personal and financial information</li>
            <li>Prevention of identity theft</li>
            <li>Maintenance of business continuity</li>
            <li>Protection of reputation</li>
            <li>Compliance with regulatory requirements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Content for this section is coming soon.</p>
            </CardContent>
        </Card>
    )
}


export default function CyberSecurityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="relative h-[40vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/seed/cyber/1200/400"
            alt="Cyber Security"
            fill
            className="object-cover"
            priority
            data-ai-hint="cyber security"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 px-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
              E-Crime & Cyber Security
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/90">
              Protecting your digital life from emerging threats and cyber crimes.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="threats">Current Threats</TabsTrigger>
                <TabsTrigger value="guide">Protection Guide</TabsTrigger>
                <TabsTrigger value="report">Report Incident</TabsTrigger>
                <TabsTrigger value="track">Track My Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="threats">
                <PlaceholderTab title="Current Threats" />
              </TabsContent>
              <TabsContent value="guide">
                <PlaceholderTab title="Protection Guide" />
              </TabsContent>
               <TabsContent value="report">
                <PlaceholderTab title="Report Incident" />
              </TabsContent>
              <TabsContent value="track">
                <PlaceholderTab title="Track My Reports" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
