import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight } from 'lucide-react';
import SignUpForm from '@/components/auth/signup-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import placeholderImages from '@/lib/placeholder-images.json';
import Link from 'next/link';

const heroImage = placeholderImages.placeholderImages.find(
  (img) => img.id === 'hero-mountain-peak'
);

const newsArticles = [
  {
    title: 'Your Ultimate Emergency Checklist',
    description:
      'From basic kits to wildfire evacuation plans, our checklists ensure you\'re prepared for anything. Don\'t get caught unprepared—review and customize your list today.',
    image: {
      url: 'https://picsum.photos/seed/checklist/400/250',
      hint: 'clipboard checklist',
    },
    link: '/checklist',
  },
  {
    title: 'Connect with a Supportive Community',
    description:
      'Share knowledge, ask questions, and connect with fellow survivors. Our community forum is the perfect place to learn from the real-world experiences of others.',
    image: {
      url: 'https://picsum.photos/seed/community/400/250',
      hint: 'people talking',
    },
    link: '/community',
  },
  {
    title: 'Top Resources for Emergency Preparedness',
    description:
      'We\'ve curated a list of trusted external resources, from government agencies to mental health support networks, to give you the most reliable information.',
    image: {
      url: 'https://picsum.photos/seed/resources/400/250',
      hint: 'books library',
    },
    link: '/resources',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 px-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter">
              Your Guide to a Safer Tomorrow
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
              Welcome to Survival Life — empowering you with the knowledge and
              tools to face any challenge with confidence.
            </p>
             <Button asChild className="mt-8">
              <Link href="/about">
                Learn More About Us
              </Link>
            </Button>
          </div>
        </section>

        {/* Objective Section */}
        <section id="about" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-headline font-bold">
                Welcome to Survival Life
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                In a world full of uncertainties, being prepared is your
                greatest asset. Survival Life is a comprehensive platform
                dedicated to providing you with the knowledge, skills, and
                resources to navigate life's challenges, from everyday
                emergencies to major disasters. Our mission is to empower
                individuals and communities to build resilience and ensure
                safety and well-being.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold">
                Our Objective
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                To equip every individual with practical survival skills and a
                proactive mindset. We aim to foster a supportive community where
                members can share experiences, learn from experts, and access
                reliable information on accident management, mental health
                support, cybersecurity, disaster preparedness, and more.
                Together, we can create a more resilient and secure future.
              </p>
            </div>
          </div>
        </section>

        {/* Community Reports */}
        <section id="community" className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-headline font-bold">
              Community Reports
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              Stay informed with real-time updates and reports from our global
              community.
            </p>
            <div className="mt-8 max-w-3xl mx-auto">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Error loading community reports. Please try again later.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section id="news" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold">
                Valuable Articles & Guides
              </h2>
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                Explore our curated content to enhance your preparedness skills and knowledge.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map((article, index) => (
                <Card
                  key={index}
                  className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-video relative">
                      <Image
                        src={article.image.url}
                        alt={article.title}
                        fill
                        className="object-cover"
                        data-ai-hint={article.image.hint}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <CardTitle className="font-headline text-xl">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="mt-2 flex-grow">
                      {article.description}
                    </CardDescription>
                    <Button asChild variant="link" className="p-0 mt-4 self-start text-base">
                      <Link href={article.link}>
                        Explore Section <ArrowRight className="ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Signup Section */}
        <section id="register" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-headline font-bold">
                  Join the Community
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-md">
                  A "survival life" is a lifestyle focused on being
                  self-reliant and prepared to endure emergencies, disasters,
                  or challenging circumstances. It goes beyond basic emergency
                  preparedness and often involves developing extensive skills
                  and stocking supplies for long-term self-sufficiency.
                </p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">
                    Create your account
                  </CardTitle>
                  <CardDescription>
                    Become a member to access all features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SignUpForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
