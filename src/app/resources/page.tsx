
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Link2, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Resource = {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
};

export default function ResourcesPage() {
  const firestore = useFirestore();
  const resourcesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'resources') : null, [firestore]);
  const { data: resources, isLoading } = useCollection<Resource>(resourcesQuery);

  const groupedResources = resources?.reduce((acc, resource) => {
    const { category } = resource;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">
            Curated Resources
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A categorized list of trusted external websites for further information.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-4" defaultValue={groupedResources ? Object.keys(groupedResources) : []}>
            {groupedResources && Object.entries(groupedResources).map(([category, links], index) => (
              <AccordionItem key={category} value={category} className="border rounded-lg bg-background">
                <AccordionTrigger className="text-left font-headline font-semibold text-xl p-6">
                  {category}
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <ul className="space-y-4">
                    {links.map((link) => (
                      <li key={link.id}>
                        <Link href={link.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-md border hover:bg-secondary/50">
                          <div className="flex items-center gap-3 font-semibold text-primary">
                            <Link2 className="h-4 w-4" />
                            <span>{link.name}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground ml-7">{link.description}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
