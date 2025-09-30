import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
            About Survival Life
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Empowering individuals and communities to build resilience and
            ensure safety in an uncertain world.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://picsum.photos/seed/team/800/600"
              alt="Our Team"
              fill
              className="object-cover"
              data-ai-hint="diverse team"
            />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold">Our Mission</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our mission is to provide accessible, reliable, and practical
              information that equips people from all walks of life with the
              skills and confidence to handle emergencies. We believe that
              preparedness is not about fear, but about empowerment. By fostering
              a proactive mindset and a supportive community, we aim to make
              the world a safer place, one prepared individual at a time.
            </p>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-headline font-bold">Our Vision</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We envision a future where every person has the fundamental
              knowledge of survival and preparedness. A world where communities
              can come together to support each other during crises, leveraging
              shared skills and resources. Survival Life aims to be the leading
              platform in this global movement towards resilience, connecting
              experts, learners, and communities in a network of shared safety
              and strength.
            </p>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg order-1 md:order-2">
            <Image
              src="https://picsum.photos/seed/community/800/600"
              alt="Community working together"
              fill
              className="object-cover"
              data-ai-hint="community help"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
