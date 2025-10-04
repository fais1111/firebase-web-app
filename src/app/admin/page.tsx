'use client';

import { useAuth as useAppAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Flag, Loader2, MapPin, Youtube, Users, Trash2, CheckCircle2, XCircle, FileText, Video, BookUser } from 'lucide-react';
import { collection, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function UsersViewer() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading, error } = useCollection(usersQuery);

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (error) return <p className="text-destructive">Error loading users.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users /> App Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map(user => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {user.displayName || 'N/A'}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.createdAt ? format(new Date(user.createdAt.seconds * 1000), 'PPP') : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const locationSchema = z.object({
  name: z.string().min(3, "Location name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

function LocationManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const locationsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'admin_locations') : null, [firestore]);
  const { data: locations, isLoading, error } = useCollection(locationsCollection);

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: "", description: "" },
  });

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "admin_locations", id);
    await deleteDoc(docRef);
    toast({ title: "Location Deleted", description: "The location has been removed." });
  };

  function onSubmit(values: z.infer<typeof locationSchema>) {
    if (!locationsCollection) return;
    addDoc(locationsCollection, values).then(() => {
      toast({ title: "Location Added", description: "The new accident hotspot has been saved." });
      form.reset();
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: locationsCollection.path,
          operation: 'create',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin /> Manage Accident Hotspots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Location Name</FormLabel><FormControl><Input placeholder="e.g., Highway 7 Dangerous Curve" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the hotspot and common risks." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>Add Hotspot</Button>
          </form>
        </Form>
        <div className="space-y-4">
          <h3 className="font-semibold">Existing Locations</h3>
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-destructive">Error loading locations.</p>}
          <div className="max-h-60 overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {locations?.map(location => (
                    <TableRow key={location.id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{location.description}</TableCell>
                    <TableCell className="text-right">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon"><Trash2 /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the location.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(location.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const guideSchema = z.object({
  title: z.string().min(5, "Title is too short."),
  description: z.string().min(10, "Description is too short."),
  youtubeUrl: z.string().url("Please enter a valid YouTube URL."),
});

function GuideManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const guidesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'accident_guides') : null, [firestore]);
  const { data: guides, isLoading, error } = useCollection(guidesCollection);

  const form = useForm<z.infer<typeof guideSchema>>({
    resolver: zodResolver(guideSchema),
    defaultValues: { title: "", description: "", youtubeUrl: "" },
  });

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "accident_guides", id);
    await deleteDoc(docRef);
    toast({ title: "Guide Deleted" });
  };
  
  function onSubmit(values: z.infer<typeof guideSchema>) {
    if (!guidesCollection) return;
    addDoc(guidesCollection, values).then(() => {
      toast({ title: "Guide Added", description: "The new guide is now available." });
      form.reset();
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
          path: guidesCollection.path,
          operation: 'create',
          requestResourceData: values,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Youtube /> Manage Accident Guides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Guide Title</FormLabel><FormControl><Input placeholder="e.g., What to Do After a Car Accident" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Brief Description</FormLabel><FormControl><Textarea placeholder="A short summary of the video's content." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
              <FormItem><FormLabel>YouTube Video URL</FormLabel><FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>Add Guide</Button>
          </form>
        </Form>
        <div className="space-y-4">
          <h3 className="font-semibold">Existing Guides</h3>
           {isLoading && <p>Loading...</p>}
           {error && <p className="text-destructive">Error loading guides.</p>}
          <div className="max-h-60 overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {guides?.map(guide => (
                    <TableRow key={guide.id}>
                    <TableCell>{guide.title}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon"><Trash2 /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete the guide.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(guide.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportViewer() {
  const firestore = useFirestore();
  const reportsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'accident_reports') : null, [firestore]);
  const { data: reports, isLoading, error } = useCollection(reportsQuery);
  const { toast } = useToast();

  const updateStatus = async (id: string, status: 'approved' | 'denied') => {
    if (!firestore) return;
    const docRef = doc(firestore, "accident_reports", id);
    await updateDoc(docRef, { status });
    toast({ title: "Report Status Updated" });
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (error) return <p className="text-destructive">Error loading reports.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Flag /> User Accident Reports</CardTitle>
        <CardDescription>Review and approve or deny user-submitted reports.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map(report => (
              <TableRow key={report.id}>
                <TableCell>{report.userEmail}</TableCell>
                <TableCell>{report.locationDescription}</TableCell>
                <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                <TableCell>{report.reportDate ? format(new Date(report.reportDate.seconds * 1000), 'Pp') : 'N/A'}</TableCell>
                <TableCell><Badge variant={report.status === 'approved' ? 'default' : report.status === 'denied' ? 'destructive' : 'secondary'}>{report.status}</Badge></TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="outline" onClick={() => updateStatus(report.id, 'approved')} disabled={report.status === 'approved'}><CheckCircle2 className="text-green-600" /></Button>
                  <Button size="icon" variant="outline" onClick={() => updateStatus(report.id, 'denied')} disabled={report.status === 'denied'}><XCircle className="text-red-600" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TherapistManager() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const pendingQuery = useMemoFirebase(() => firestore ? collection(firestore, 'therapists') : null, [firestore]);
  const { data: therapists, isLoading, error } = useCollection(pendingQuery);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'pending') => {
    if (!firestore) return;
    await updateDoc(doc(firestore, 'therapists', id), { status });
    toast({ title: 'Therapist Status Updated' });
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'therapists', id));
    toast({ title: 'Therapist Removed' });
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const pendingTherapists = therapists?.filter(t => t.status === 'pending');
  const approvedTherapists = therapists?.filter(t => t.status === 'approved');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BookUser /> Therapist Management</CardTitle>
        <CardDescription>Approve new therapist registrations and manage existing therapists.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="font-semibold mb-4">Pending Registrations</h3>
          {isLoading && <Loader2 className="animate-spin" />}
          {error && <p className="text-destructive">Error loading therapists.</p>}
          {!isLoading && pendingTherapists?.length === 0 && <p className="text-sm text-muted-foreground">No pending registrations.</p>}
          {pendingTherapists && pendingTherapists.length > 0 && (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Specialization</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {pendingTherapists.map(therapist => (
                  <TableRow key={therapist.id}>
                    <TableCell>{therapist.name}</TableCell>
                    <TableCell>{therapist.specialization}</TableCell>
                    <TableCell className="max-w-xs truncate">{therapist.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="icon" variant="outline" onClick={() => handleStatusUpdate(therapist.id, 'approved')}><CheckCircle2 className="text-green-600" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-4">Approved Therapists</h3>
           {!isLoading && approvedTherapists?.length === 0 && <p className="text-sm text-muted-foreground">No approved therapists yet.</p>}
           {approvedTherapists && approvedTherapists.length > 0 && (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Specialization</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {approvedTherapists.map(therapist => (
                  <TableRow key={therapist.id}>
                    <TableCell>{therapist.name}</TableCell>
                    <TableCell>{therapist.email}</TableCell>
                    <TableCell>{therapist.specialization}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently remove the therapist.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(therapist.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           )}
        </div>
      </CardContent>
    </Card>
  )
}

const resourceSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    type: z.enum(['article', 'video']),
    url: z.string().url(),
});

function MentalHealthResourceManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const resourcesCollection = useMemoFirebase(() => firestore ? collection(firestore, 'mental_health_resources') : null, [firestore]);
    const { data: resources, isLoading, error } = useCollection(resourcesCollection);

    const form = useForm<z.infer<typeof resourceSchema>>({
        resolver: zodResolver(resourceSchema),
        defaultValues: { title: "", description: "", type: "article", url: "" },
    });

    const handleDelete = async (id: string) => {
        if (!firestore) return;
        await deleteDoc(doc(firestore, "mental_health_resources", id));
        toast({ title: "Resource Deleted" });
    };

    function onSubmit(values: z.infer<typeof resourceSchema>) {
        if (!resourcesCollection) return;
        addDoc(resourcesCollection, values).then(() => {
            toast({ title: "Resource Added" });
            form.reset();
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: resourcesCollection.path,
                operation: 'create',
                requestResourceData: values,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Mental Health Resource Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Resource Title" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief summary of the resource." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="url" render={({ field }) => (
                            <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://example.com/article" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select resource type" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="article">Article</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={form.formState.isSubmitting}>Add Resource</Button>
                    </form>
                </Form>
                 <div className="space-y-4">
                    <h3 className="font-semibold">Existing Resources</h3>
                    {isLoading && <Loader2 className="animate-spin"/>}
                    {error && <p className="text-destructive">Error loading resources.</p>}
                    <div className="max-h-60 overflow-y-auto">
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {resources?.map(resource => (
                                    <TableRow key={resource.id}>
                                        <TableCell>{resource.title}</TableCell>
                                        <TableCell><Badge variant="secondary">{resource.type}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 /></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the resource.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(resource.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                 </div>
            </CardContent>
        </Card>
    )
}

function AppointmentViewer() {
    const firestore = useFirestore();
    const appointmentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'appointments') : null, [firestore]);
    const { data: appointments, isLoading, error } = useCollection(appointmentsQuery);

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (error) return <p className="text-destructive">Error loading appointments.</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Appointment Bookings</CardTitle>
                <CardDescription>View all appointments requested by users.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User Name</TableHead>
                            <TableHead>Therapist ID</TableHead>
                            <TableHead>Appointment Date</TableHead>
                             <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments?.map(apt => (
                            <TableRow key={apt.id}>
                                <TableCell>{apt.userName}</TableCell>
                                <TableCell className="max-w-[100px] truncate">{apt.therapistId}</TableCell>
                                <TableCell>{apt.appointmentDate ? format(new Date(apt.appointmentDate.seconds * 1000), 'PPP p') : 'N/A'}</TableCell>
                                <TableCell><Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>{apt.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Manage users, reports, and site content from this central dashboard.</p>
        </CardContent>
      </Card>
      <div className="grid lg:grid-cols-2 gap-8">
        <LocationManager />
        <GuideManager />
      </div>
      <ReportViewer />
      <TherapistManager />
      <MentalHealthResourceManager />
      <AppointmentViewer />
      <UsersViewer />
    </div>
  );
}

function AccessDenied() {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle />
          Access Denied
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          You do not have permission to view this page. Please contact an
          administrator if you believe this is an error.
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const { isAdmin, isLoading } = useAppAuth();

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground mt-2">Verifying access...</p>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        {isAdmin ? <AdminDashboard /> : <AccessDenied />}
      </div>
    </div>
  );
}

    