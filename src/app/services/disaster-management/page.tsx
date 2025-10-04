
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
import { AlertTriangle, Loader2, Siren, LifeBuoy, Phone, FileWarning } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const reportSchema = z.object({
  incidentType: z.string().min(3, "Please specify the incident type."),
  location: z.string().min(5, "Please provide a location."),
  description: z.string().min(10, "Please provide a brief description."),
});

function DisasterReportForm() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: { incidentType: "", location: "", description: "" },
  });

  function onSubmit(values: z.infer<typeof reportSchema>) {
    if (!user || !firestore) return;
    const reportData = {
      ...values,
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
    };
    const reportsCollection = collection(firestore, 'disaster_reports');
    addDoc(reportsCollection, reportData)
      .then(() => {
        toast({ title: 'Report Submitted', description: 'Thank you for helping keep the community informed.' });
        form.reset();
      })
      .catch((serverError) => {
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
        <CardTitle className="flex items-center gap-2"><FileWarning /> Report an Incident</CardTitle>
        <CardDescription>Report a non-emergency disaster-related incident to inform administrators.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="incidentType" render={({ field }) => (
              <FormItem><FormLabel>Type of Incident</FormLabel><FormControl><Input placeholder="e.g., Flooding, Landslide, Power Outage" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Main Street, City" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe what you see..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>Submit Report</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function SOSAlert() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleSOS = () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'You must be logged in to send an alert.' });
            return;
        }

        const sosData = {
            userId: user.uid,
            userEmail: user.email,
            location: 'User\'s current location (enable location services)', // Placeholder
            message: 'Emergency SOS',
            createdAt: serverTimestamp(),
        };

        const sosCollection = collection(firestore, 'sos_reports');
        addDoc(sosCollection, sosData)
            .then(() => {
                toast({
                    title: "SOS Alert Sent",
                    description: "Your emergency alert has been broadcast to administrators. Help is on the way.",
                    variant: 'destructive',
                    duration: 10000,
                });
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: sosCollection.path,
                    operation: 'create',
                    requestResourceData: sosData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="w-full text-lg py-8 animate-pulse">
                    <Siren className="mr-2 h-6 w-6" /> SOS - EMERGENCY ALERT
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will immediately send an emergency alert to administrators with your location. Only use this in a genuine emergency.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSOS} className="bg-destructive hover:bg-destructive/90">Send Alert</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function SafeZones() {
    const firestore = useFirestore();
    const safeZonesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'safe_zones') : null, [firestore]);
    const { data: safeZones, isLoading, error } = useCollection(safeZonesQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LifeBuoy /> Designated Safe Zones</CardTitle>
                <CardDescription>Locations designated by administrators as safe during a disaster.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <Loader2 className="animate-spin" />}
                {error && <p className="text-destructive">Could not load safe zones.</p>}
                <div className="space-y-4">
                    {!isLoading && safeZones?.length === 0 && <p className="text-muted-foreground text-sm">No safe zones have been designated yet.</p>}
                    {safeZones?.map(zone => (
                        <div key={zone.id} className="p-4 border rounded-lg bg-secondary/30">
                            <h4 className="font-bold">{zone.name}</h4>
                            <p className="text-sm text-muted-foreground">{zone.location}</p>
                            <p className="text-sm mt-1">{zone.details}</p>
                            <p className="text-xs text-muted-foreground mt-2">Added: {zone.addedAt ? format(new Date(zone.addedAt.seconds * 1000), 'Pp') : 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

const quickContacts = [
    { name: 'Disaster Management Centre', number: '117' },
    { name: 'Police Emergency', number: '119' },
    { name: 'Ambulance / Fire & Rescue', number: '110' },
    { name: 'Government Information Center', number: '1919' },
];

function QuickContacts() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Phone /> Quick Contacts</CardTitle>
                <CardDescription>Emergency contact numbers for Sri Lanka.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {quickContacts.map(contact => (
                        <li key={contact.name} className="flex justify-between items-center p-2 rounded-md hover:bg-secondary">
                            <span className="font-medium">{contact.name}</span>
                            <a href={`tel:${contact.number}`} className="font-bold text-primary hover:underline">{contact.number}</a>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}

export default function DisasterManagementPage() {
    const { user, isLoading } = useAuth();

    return (
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
              Disaster Management
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Your hub for reporting emergencies, finding safe zones, and accessing critical information during a disaster.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
              <h2>What is Disaster Management?</h2>
              <p>
                  Disaster management is the organization and management of resources and responsibilities for dealing with all humanitarian aspects of emergencies, in particular preparedness, response, and recovery in order to lessen the impact of disasters. It involves a continuous cycle of planning, organizing, training, equipping, exercising, evaluating, and taking corrective action in an effort to ensure effective coordination during incident response.
              </p>
          </div>

          {isLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
            user ? <SOSAlert /> : (
                <Alert>
                    <Siren className="h-4 w-4"/>
                    <AlertTitle>Sign In for Emergency Features</AlertTitle>
                    <AlertDescription>
                        <Link href="/login" className="font-bold text-primary hover:underline">Sign in</Link> to send SOS alerts and report incidents.
                    </AlertDescription>
                </Alert>
            )
          )}
          
          <div className="grid md:grid-cols-2 gap-8">
              <SafeZones />
              <QuickContacts />
          </div>

          {user && <DisasterReportForm />}
        </div>
      </div>
    );
  }
