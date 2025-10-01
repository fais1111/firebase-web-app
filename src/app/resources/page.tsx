import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Link2 } from 'lucide-react';
import Link from 'next/link';

const resourceCategories = {
  'Government Agencies': [
    {
      name: 'Disaster Management Centre (Sri Lanka)',
      url: 'http://www.dmc.gov.lk/',
      description: 'The official government body for disaster management in Sri Lanka.',
    },
  ],
  'Mental Health Support': [
    {
      name: 'National Institute of Mental Health (Sri Lanka)',
      url: 'https://www.nimh.health.gov.lk/',
      description: 'The main public mental health institution in Sri Lanka.',
    },
    {
      name: 'Sumithrayo (Sri Lanka)',
      url: 'https://www.sumithrayo.org/',
      description: 'Provides confidential emotional support for those experiencing distress in Sri Lanka.',
    },
  ],
  'Cybersecurity': [
    {
      name: 'Sri Lanka CERT|CC',
      url: 'https://www.cert.gov.lk/',
      description: 'The Sri Lanka Computer Emergency Readiness Team, for cybersecurity incident response.',
    },
     {
      name: 'ICTA Sri Lanka',
      url: 'https://www.icta.lk/',
      description: 'Information and Communication Technology Agency of Sri Lanka, driving digital transformation.',
    },
  ],
};

export default function ResourcesPage() {
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

        <Accordion type="multiple" className="w-full space-y-4">
          {Object.entries(resourceCategories).map(([category, links], index) => (
            <AccordionItem key={category} value={`item-${index}`} className="border rounded-lg bg-background">
              <AccordionTrigger className="text-left font-headline font-semibold text-xl p-6">
                {category}
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
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
      </div>
    </div>
  );
}
