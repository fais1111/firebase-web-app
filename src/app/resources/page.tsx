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
      name: 'Ready.gov',
      url: 'https://www.ready.gov/',
      description: 'Official U.S. government site for emergency preparedness information.',
    },
    {
      name: 'FEMA',
      url: 'https://www.fema.gov/',
      description: 'Federal Emergency Management Agency website.',
    },
    {
      name: 'CDC Emergency Preparedness',
      url: 'https://emergency.cdc.gov/',
      description: 'Centers for Disease Control and Prevention resources for public health emergencies.',
    },
  ],
  'Mental Health Support': [
    {
      name: 'NAMI (National Alliance on Mental Illness)',
      url: 'https://www.nami.org/',
      description: 'Advocacy, education, support and public awareness for mental illness.',
    },
    {
      name: 'SAMHSA National Helpline',
      url: 'https://www.samhsa.gov/find-help/national-helpline',
      description: 'Free, confidential, 24/7, 365-day-a-year treatment referral and information service.',
    },
  ],
  'Cybersecurity': [
    {
      name: 'CISA (Cybersecurity & Infrastructure Security Agency)',
      url: 'https://www.cisa.gov/',
      description: 'Leads the national effort to understand, manage, and reduce risk to our cyber and physical infrastructure.',
    },
    {
      name: "StaySafeOnline.org",
      url: 'https://staysafeonline.org/',
      description: 'Powered by the National Cyber Security Alliance, providing tips and resources.',
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
