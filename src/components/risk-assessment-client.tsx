'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  PersonalizedRiskAssessmentInput,
  personalizedRiskAssessment,
  PersonalizedRiskAssessmentOutput,
} from '@/ai/flows/personalized-risk-assessment';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Check, Loader2, ListTodo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters.',
  }),
  localNews: z.string().optional(),
});

export default function RiskAssessmentClient() {
  const [result, setResult] =
    useState<PersonalizedRiskAssessmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      localNews: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const output = await personalizedRiskAssessment(
        values as PersonalizedRiskAssessmentInput
      );
      setResult(output);
    } catch (error) {
      console.error('Error during risk assessment:', error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description:
          'Failed to generate risk assessment. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., San Francisco, CA, USA"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide your city, state, and country for accurate
                      assessment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="localNews"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">
                      Local News & Conditions (Optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Recent news about heavy rainfall, power outages, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any relevant local context for a more precise
                      analysis.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assessing...
                  </>
                ) : (
                  'Generate Assessment'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="mt-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <AlertTriangle className="text-destructive" /> Potential Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.risks.map((risk, index) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-3 mt-1 shrink-0 text-muted-foreground" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <ListTodo className="text-primary" /> Preparedness Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.preparednessSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 mr-3 mt-1 shrink-0 text-primary" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
