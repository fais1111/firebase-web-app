
'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldCheck, FileWarning, Eye, Loader2, ListChecks } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, where } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function OverviewTab() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Understanding Cyber Security
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Cyber security refers to the practice of protecting systems,
            networks, and programs from digital attacks. These cyberattacks are
            usually aimed at accessing, changing, or destroying sensitive
            information; extorting money from users; or interrupting normal
            business processes.
          </p>
          <p className="mt-4">
            In today's interconnected world, everyone benefits from advanced
            cyber defense programs. At an individual level, a cybersecurity
            attack can result in everything from identity theft to extortion
            attempts to the loss of important data.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Why Cyber Security Matters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-muted-foreground list-disc pl-5">
            <li>Protection of personal and financial information</li>
            <li>Prevention of identity theft</li>
            <li>Maintenance of business continuity</li>
            <li>Protection of reputation</li>
            <li>Compliance with regulatory requirements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

const currentThreats = [
    {
        title: 'Phishing Attacks',
        description: 'Scammers impersonate legitimate organizations via email, text message, or other means to steal sensitive information like passwords and credit card numbers.',
        icon: FileWarning
    },
    {
        title: 'Malware and Ransomware',
        description: 'Malicious software designed to disrupt operations, gather sensitive information, or gain unauthorized access. Ransomware is a type of malware that locks your files and demands payment.',
        icon: ShieldAlert
    },
    {
        title: 'Denial-of-Service (DoS) Attacks',
        description: 'These attacks flood a system, server, or network with traffic to overwhelm its resources and make it unavailable to legitimate users.',
        icon: ShieldAlert
    },
    {
        title: 'Social Engineering',
        description: 'The art of manipulating people into giving up confidential information. Phishing is a common type of social engineering.',
        icon: FileWarning
    },
];

function CurrentThreatsTab() {
    return (
         <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Common Cyber Threats</CardTitle>
                    <CardDescription>Stay informed about the most prevalent cyber threats to better protect yourself.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {currentThreats.map((threat) => (
                        <Card key={threat.title}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <threat.icon className="h-10 w-10 text-destructive" />
                                <div>
                                    <CardTitle>{threat.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{threat.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

const protectionGuides = [
    {
        title: "Use Strong, Unique Passwords",
        content: "Create complex passwords that are at least 12 characters long, using a mix of uppercase and lowercase letters, numbers, and symbols. Use a password manager to keep track of unique passwords for every account."
    },
    {
        title: "Enable Two-Factor Authentication (2FA)",
        content: "2FA adds a second layer of security beyond just your password. Even if someone steals your password, they won't be able to access your account without the second factor (like a code from your phone)."
    },
    {
        title: "Beware of Phishing Scams",
        content: "Be suspicious of unsolicited emails, texts, or calls asking for personal information. Check the sender's email address, and hover over links to see the actual URL before clicking. Don't download attachments from unknown sources."
    },
    {
        title: "Keep Your Software Updated",
        content: "Software updates often contain critical security patches. Regularly update your operating system, web browser, and other applications to protect against known vulnerabilities."
    },
    {
        title: "Back Up Your Data",
        content: "Regularly back up your important files to an external hard drive or a secure cloud service. This can protect your data from being lost in case of a ransomware attack or hardware failure."
    }
];

function ProtectionGuideTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Essential Protection Guide</CardTitle>
                <CardDescription>Follow these steps to significantly improve your personal cyber security.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {protectionGuides.map((guide, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className='font-semibold'>{guide.title}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">{guide.content}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}


const reportSchema = z.object({
  incidentType: z.enum(['phishing', 'malware', 'scam', 'identity_theft', 'other']),
  incidentDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Please select a valid date.',
  }),
  description: z.string().min(20, 'Please provide a detailed description of at least 20 characters.'),
});


function ReportIncidentTab() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { toast } = useToast();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: { incidentType: 'phishing', description: '', incidentDate: '' },
    });

    function onSubmit(values: z.infer<typeof reportSchema>) {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to report an incident.' });
            return;
        }
        
        const incidentData = {
            ...values,
            incidentDate: new Date(values.incidentDate),
            userId: user.uid,
            userEmail: user.email,
            status: 'reported',
            createdAt: serverTimestamp(),
        };

        const incidentsCollection = collection(firestore, 'cyber_security_incidents');

        addDoc(incidentsCollection, incidentData)
          .then(() => {
            toast({ title: 'Incident Reported', description: 'Thank you for your report. It has been submitted for review.' });
            form.reset();
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: incidentsCollection.path,
              operation: 'create',
              requestResourceData: incidentData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
    }

    if (isAuthLoading) {
        return <div className="text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!user) {
        return (
             <Alert>
                <FileWarning className="h-4 w-4" />
                <AlertTitle>Please Sign In</AlertTitle>
                <AlertDescription>
                You need to{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                    sign in
                </Link>{' '}
                to report a cyber security incident.
                </AlertDescription>
            </Alert>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Report a Cyber Security Incident</CardTitle>
                <CardDescription>If you've been a victim of or witnessed a cyber crime, please report it here. Your report can help protect others.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                         <FormField
                            control={form.control}
                            name="incidentType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type of Incident</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select an incident type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="phishing">Phishing Email/Message</SelectItem>
                                            <SelectItem value="scam">Online Scam / Fraud</SelectItem>
                                            <SelectItem value="malware">Malware / Virus Infection</SelectItem>
                                            <SelectItem value="identity_theft">Identity Theft</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="incidentDate"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Date of Incident</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
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
                                        <Textarea placeholder="Describe what happened in detail. Include any relevant information like suspicious websites, email addresses, or messages." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Report'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

function TrackMyReportsTab() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const firestore = useFirestore();

    const reportsQuery = useMemoFirebase(() => 
        firestore && user 
        ? query(collection(firestore, 'cyber_security_incidents'), where('userId', '==', user.uid))
        : null
    , [firestore, user]);
    
    const { data: reports, isLoading: areReportsLoading, error } = useCollection(reportsQuery);

    if (isAuthLoading) {
        return <div className="text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

     if (!user) {
        return (
             <Alert>
                <Eye className="h-4 w-4" />
                <AlertTitle>Please Sign In</AlertTitle>
                <AlertDescription>
                You need to{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                    sign in
                </Link>{' '}
                to view your submitted reports.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">My Submitted Reports</CardTitle>
                <CardDescription>Track the status of the cyber security incidents you have reported.</CardDescription>
            </CardHeader>
            <CardContent>
                {areReportsLoading && <div className="text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load your reports.</AlertDescription></Alert>}
                {!areReportsLoading && !reports?.length && (
                    <div className="text-center text-muted-foreground py-8">
                        <ListChecks className="mx-auto h-12 w-12" />
                        <p className="mt-4">You have not submitted any reports yet.</p>
                    </div>
                )}
                 {!areReportsLoading && reports && reports.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date Reported</TableHead>
                                <TableHead>Incident Type</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell>{report.createdAt ? format(new Date(report.createdAt.seconds * 1000), 'PPP') : 'N/A'}</TableCell>
                                    <TableCell><Badge variant="secondary">{report.incidentType.replace('_', ' ')}</Badge></TableCell>
                                    <TableCell><p className="max-w-xs truncate">{report.description}</p></TableCell>
                                    <TableCell>
                                        <Badge variant={report.status === 'resolved' ? 'default' : report.status === 'investigating' ? 'secondary' : 'destructive'}>
                                            {report.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 )}
            </CardContent>
        </Card>
    )
}

export default function CyberSecurityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="relative h-[40vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/seed/cyber/1200/400"
            alt="Cyber Security"
            fill
            className="object-cover"
            priority
            data-ai-hint="cyber security"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 px-4">
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
              E-Crime & Cyber Security
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/90">
              Protecting your digital life from emerging threats and cyber crimes.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="threats">Current Threats</TabsTrigger>
                <TabsTrigger value="guide">Protection Guide</TabsTrigger>
                <TabsTrigger value="report">Report Incident</TabsTrigger>
                <TabsTrigger value="track">Track My Reports</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <OverviewTab />
              </TabsContent>
              <TabsContent value="threats">
                <CurrentThreatsTab />
              </TabsContent>
              <TabsContent value="guide">
                <ProtectionGuideTab />
              </TabsContent>
               <TabsContent value="report">
                <ReportIncidentTab />
              </TabsContent>
              <TabsContent value="track">
                <TrackMyReportsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

    