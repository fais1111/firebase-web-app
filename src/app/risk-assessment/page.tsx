import RiskAssessmentClient from '@/components/risk-assessment-client';

export default function RiskAssessmentPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold">
            Personalized Risk Assessment
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Enter your location to receive a tailored analysis of potential
            risks and recommended preparedness steps.
          </p>
        </div>
        <RiskAssessmentClient />
      </div>
    </div>
  );
}
