'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { addDoc, collection, serverTimestamp, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2, FileText, Video, UserPlus, Calendar } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const appointmentSchema = z.object({
  problemDescription: z.string().min(20, 'Please describe your problem in at least 20 characters.'),
  appointmentDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Please select a valid date.',
  }),
});

function BookAppointmentModal({ therapist }: { therapist: any }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { problemDescription: '', appointmentDate: '' },
  });

  async function onSubmit(values: z.infer<typeof appointmentSchema>) {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to book an appointment.' });
      return;
    }

    const appointmentData = {
      ...values,
      appointmentDate: new Date(values.appointmentDate),
      userId: user.uid,
      userName: user.displayName || user.email,
      userEmail: user.email,
      therapistId: therapist.id,
      status: 'requested',
      createdAt: serverTimestamp(),
    };
    
    const appointmentsCollection = collection(firestore, 'appointments');

    addDoc(appointmentsCollection, appointmentData)
      .then(() => {
        toast({ title: 'Appointment Requested', description: 'The therapist will be notified of your request.' });
        form.reset();
        setOpen(false);
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: appointmentsCollection.path,
          operation: 'create',
          requestResourceData: appointmentData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Book Appointment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book an Appointment with {therapist.name}</DialogTitle>
          <DialogDescription>
            Fill out the details below to request an appointment. The therapist will confirm the time with you via email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="problemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief description of your problem</FormLabel>
                  <FormControl>
                    <Textarea placeholder="This will help the therapist prepare for your session..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Requesting...</> : 'Request Appointment'}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function TherapistList() {
  const firestore = useFirestore();
  const { user } = useAuth();
  const therapistsQuery = useMemoFirebase(() => 
    firestore 
      ? query(collection(firestore, 'therapists'), where('status', '==', 'approved'))
      : null
  , [firestore]);
  
  const { data: therapists, isLoading, error } = useCollection(therapistsQuery);
  
  if (isLoading) return <Loader2 className="mx-auto h-8 w-8 animate-spin" />;
  if (error) return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Could not load therapists. Please try again later.</AlertDescription>
    </Alert>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-headline font-bold">Find a Therapist</h2>
        <p className="mt-2 text-muted-foreground">Connect with one of our approved mental health professionals.</p>
      </div>
      {!user && (
         <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Sign In to Book</AlertTitle>
            <AlertDescription>
              You need to{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">
                sign in
              </Link>{' '}
              to book an appointment with a therapist.
            </AlertDescription>
          </Alert>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!isLoading && therapists?.length === 0 && (
          <p className="text-center text-muted-foreground md:col-span-3">No therapists are available at the moment.</p>
        )}
        {therapists?.map((therapist) => (
          <Card key={therapist.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={therapist.photoURL || undefined} alt={therapist.name} />
                <AvatarFallback>{therapist.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{therapist.name}</CardTitle>
                <CardDescription>{therapist.specialization}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{therapist.description}</p>
            </CardContent>
            <CardFooter>
              {user ? (
                <BookAppointmentModal therapist={therapist} />
              ) : (
                <Button disabled>Sign in to Book</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    let videoId = null;
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match) videoId = match[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function MentalHealthResources() {
  const firestore = useFirestore();
  const resourcesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'mental_health_resources') : null, [firestore]);
  const { data: resources, isLoading, error } = useCollection(resourcesQuery);

  if (isLoading) return <Loader2 className="mx-auto h-8 w-8 animate-spin" />;
  if (error) return null; // Don't show error message here, keep UI clean

  return (
    <div className="mt-16 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-headline font-bold">Articles & Videos</h2>
        <p className="mt-2 text-muted-foreground">Information and support resources curated by our team.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        {!isLoading && resources?.length === 0 && (
          <p className="text-center text-muted-foreground md:col-span-2">No resources have been added yet.</p>
        )}
        {resources?.map((resource) => {
          if (resource.type === 'video') {
            const embedUrl = getYouTubeEmbedUrl(resource.url);
            return (
              <Card key={resource.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Video className='text-red-600' />{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {embedUrl ? (
                    <div className="aspect-video rounded-lg overflow-hidden border">
                      <iframe width="100%" height="100%" src={embedUrl} title={resource.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                  ) : <div className="text-sm text-destructive">Invalid YouTube URL provided.</div>}
                </CardContent>
              </Card>
            );
          } else {
            return (
              <Card key={resource.id}>
                 <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText />{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild variant="outline">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">Read Article</a>
                    </Button>
                </CardFooter>
              </Card>
            )
          }
        })}
      </div>
    </div>
  );
}

export default function SuicidePreventionPage() {
    const { user, isLoading } = useAuth();
    
    return (
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">
                    Mental Health & Suicide Prevention
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    You are not alone. Support is available. Connect with professionals and find helpful resources.
                </p>
                <Button asChild variant="link" className="mt-4">
                  <Link href="/signup/therapist">
                    <UserPlus className="mr-2 h-4 w-4" /> Are you a therapist? Register here
                  </Link>
                </Button>
            </div>
            
            {isLoading ? (
                 <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                 </div>
            ) : (
                <>
                    <TherapistList />
                    <MentalHealthResources />
                </>
            )}

        </div>
      </div>
    );
}
