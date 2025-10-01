'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const formSchema = z.object({
  locationDescription: z.string().min(10, {
    message: 'Please provide a more detailed location description.',
  }),
  description: z.string().min(20, {
    message: 'Description must be at least 20 characters long.',
  }),
});

function ReportAccidentForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationDescription: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to report an accident.',
      });
      return;
    }
    if (!firestore) return;

    const reportData = {
        ...values,
        userId: user.uid,
        userEmail: user.email,
        reportDate: serverTimestamp(),
        status: 'reported',
    };

    const reportsCollection = collection(firestore, 'accident_reports');

    addDoc(reportsCollection, reportData)
      .then(() => {
        toast({
          title: 'Report Submitted',
          description:
            'Thank you for your submission. An admin will review it shortly.',
        });
        form.reset();
      })
      .catch(() => {
        const permissionError = new FirestorePermissionError({
          path: reportsCollection.path,
          operation: 'create',
          requestResourceData: reportData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          Report an Accident
        </CardTitle>
        <CardDescription>
          Help the community by reporting incidents you observe. Your report will be reviewed by an administrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observed Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Near the old oak tree on Main St."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe where you saw the incident as clearly as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Incident</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you observed, any hazards, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AdminLocationsFeed() {
  const firestore = useFirestore();
  const adminLocationsQuery = useMemoFirebase(() => 
    firestore 
      ? collection(firestore, 'admin_locations')
      : null
  , [firestore]);
  
  const { data: locations, isLoading: loading, error } = useCollection(adminLocationsQuery);

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-headline font-bold text-center mb-8">
        Known Accident Hotspots
      </h2>
      {loading && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load accident hotspots. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-6">
        {!loading && locations?.length === 0 && (
          <p className="text-center text-muted-foreground">
            No known accident hotspots have been added by administrators yet.
          </p>
        )}
        {locations?.map((location) => {
          return (
            <Card key={location.id} className="bg-secondary/50">
              <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="text-primary h-5 w-5" />
                            {location.name}
                        </CardTitle>
                    </div>
                 </div>
              </CardHeader>
              <CardContent>
                <p>{location.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function AccidentManagementPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">
            Accident Management
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Report incidents and view known community accident hotspots.
          </p>
        </div>

        {user ? (
          <ReportAccidentForm />
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Please Sign In</AlertTitle>
            <AlertDescription>
              You need to{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">
                sign in
              </Link>{' '}
              to report an accident.
            </AlertDescription>
          </Alert>
        )}
        <AdminLocationsFeed />
      </div>
    </div>
  );
}
