import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Survival Life?',
    answer:
      'Survival Life is a comprehensive platform dedicated to providing knowledge, skills, and resources to help individuals and communities navigate emergencies and disasters. We focus on empowering people through education and community support.',
  },
  {
    question: 'How do I use the Risk Assessment Tool?',
    answer:
      'Navigate to the Risk Assessment page, enter your location (city, state, country), and optionally add any local news or conditions. The tool will then generate a personalized list of potential risks and recommended preparedness steps.',
  },
  {
    question: 'Is creating an account free?',
    answer:
      'Yes, creating an account on Survival Life is completely free. A free account gives you access to community forums, customizable checklists, and more personalized content.',
  },
  {
    question: 'How can I contribute to the community?',
    answer:
      'Once you have an account, you can participate in our Community Forums. Share your experiences, ask questions, and provide helpful advice to other members. Your real-world knowledge is invaluable.',
  },
  {
    question: 'Where does the information on this site come from?',
    answer:
      'Our content is curated and created by a team of experts in disaster preparedness, emergency response, and survival skills. We also link to reputable external resources and government agencies to ensure you get reliable and up-to-date information.',
  },
];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">
            Help Center
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Frequently Asked Questions
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
