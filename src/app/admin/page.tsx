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
import { AlertTriangle, Flag, Loader2, MapPin, Youtube, Users, Trash2 } from 'lucide-react';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
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
} from "@/components/ui/alert-dialog"

const locationSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
});

const guideSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    youtubeUrl: z.string().url("Please enter a valid YouTube URL.").refine(
        (url) => url.includes('youtube.com') || url.includes('youtu.be'),
        "URL must be a valid YouTube link."
    ),
});


function GuideManager() {
    const firestore = useFirestore();
    const guidesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'accident_guides') : null, [firestore]);
    const { data: guides, isLoading: loading, error } = useCollection(guidesQuery);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof guideSchema>>({
        resolver: zodResolver(guideSchema),
        defaultValues: { title: "", description: "", youtubeUrl: "" }
    });

    async function onSubmit(values: z.infer<typeof guideSchema>) {
        if (!firestore) return;
        
        const guidesCollection = collection(firestore, 'accident_guides');
        
        addDoc(guidesCollection, values)
        .then(() => {
          toast({ title: "Guide Added", description: "The new guide has been saved." });
          form.reset();
        })
        .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: guidesCollection.path,
                operation: 'create',
                requestResourceData: values,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }

    async function handleDelete(guideId: string) {
        if (!firestore) return;
        const guideDoc = doc(firestore, 'accident_guides', guideId);
        deleteDoc(guideDoc)
            .then(() => {
                toast({ title: 'Guide Deleted', description: 'The guide has been removed.' });
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: guideDoc.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Youtube /> Accident Guide Management
                </CardTitle>
                <CardDescription>
                    Add or remove YouTube links as guides for accident management.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='grid md:grid-cols-2 gap-8'>
                    <div>
                        <h3 className="font-semibold mb-4">Existing Guides</h3>
                        {loading && (
                            <div className="space-y-2">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        )}
                        {error && <p className="text-destructive">Error loading guides.</p>}
                        <div className="space-y-2">
                            {guides?.map(guide => (
                                <div key={guide.id} className="flex items-center justify-between p-3 border rounded-md text-sm">
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold truncate">{guide.title}</p>
                                        <p className="text-muted-foreground truncate">{guide.description}</p>
                                        <a href={guide.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline truncate block">{guide.youtubeUrl}</a>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="ml-2 flex-shrink-0">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the guide titled "{guide.title}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(guide.id)} className='bg-destructive hover:bg-destructive/90'>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ))}
                            {!loading && guides?.length === 0 && <p className="text-muted-foreground text-sm">No guides added yet.</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Add New Guide</h3>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="title" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Guide Title</FormLabel>
                                        <FormControl><Input placeholder="e.g., How to handle a fender bender" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>YouTube URL</FormLabel>
                                        <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea placeholder="A short summary of the video guide." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Guide
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function LocationManager() {
    const firestore = useFirestore();
    const locationsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'admin_locations') : null, [firestore]);
    const { data: locations, isLoading: loading, error } = useCollection(locationsQuery);
    const { toast } = useToast();
    const form = useForm<z.infer<typeof locationSchema>>({
        resolver: zodResolver(locationSchema),
        defaultValues: { name: "", description: "" }
    });

    async function onSubmit(values: z.infer<typeof locationSchema>) {
        if (!firestore) return;
        const locationsCollection = collection(firestore, 'admin_locations');
        
        addDoc(locationsCollection, values)
        .then(() => {
            toast({ title: "Location Added", description: "The new location has been saved." });
            form.reset();
        })
        .catch((serverError) => {
             const permissionError = new FirestorePermissionError({
                path: locationsCollection.path,
                operation: 'create',
                requestResourceData: values,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }

     async function handleDelete(locationId: string) {
        if (!firestore) return;
        const locationDoc = doc(firestore, 'admin_locations', locationId);
        deleteDoc(locationDoc)
            .then(() => {
                toast({ title: 'Location Deleted', description: 'The location has been removed.' });
            })
            .catch((serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: locationDoc.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <MapPin /> Accident Location Management
          </CardTitle>
          <CardDescription>
            Add or remove locations where accidents frequently occur.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className='grid md:grid-cols-2 gap-8'>
                <div>
                     <h3 className="font-semibold mb-4">Existing Locations</h3>
                    {loading && (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    )}
                    {error && <p className="text-destructive">Error loading locations.</p>}
                    <div className="space-y-2">
                        {locations?.map(loc => (
                            <div key={loc.id} className="flex items-center justify-between p-3 border rounded-md text-sm">
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold truncate">{loc.name}</p>
                                    <p className="text-muted-foreground truncate">{loc.description}</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button variant="ghost" size="icon" className="ml-2 flex-shrink-0">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the location "{loc.name}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(loc.id)} className='bg-destructive hover:bg-destructive/90'>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
                         {!loading && locations?.length === 0 && <p className="text-muted-foreground text-sm">No locations added yet.</p>}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold mb-4">Add New Location</h3>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location Name</FormLabel>
                                    <FormControl><Input placeholder="e.g., Highway 17 & Main St" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                             <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Accident Type/Description</FormLabel>
                                    <FormControl><Input placeholder="e.g., Frequent rear-end collisions" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                             <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Location
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </CardContent>
      </Card>
    );
}


function AccidentReportsViewer() {
  const firestore = useFirestore();
  const reportsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'accident_reports') : null, [firestore]);
  const { data: reports, isLoading: loading, error } = useCollection(reportsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Flag /> Submitted Accident Reports
        </CardTitle>
        <CardDescription>
          This is a view-only list of all user-submitted reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? <p className="text-destructive">Error loading reports.</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User's Location Hint</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.userEmail || 'N/A'}</TableCell>
                    <TableCell>{report.reportDate ? format(new Date(report.reportDate.seconds * 1000), 'PPP') : 'N/A'}</TableCell>
                    <TableCell>{report.locationDescription}</TableCell>
                    <TableCell>
                        <p className='max-w-xs truncate'>{report.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'approved' ? 'default' : report.status === 'denied' ? 'destructive' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
              ))}
               {!loading && reports?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No reports submitted yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function UsersViewer() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: loading, error } = useCollection(usersQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Users /> Registered Users
        </CardTitle>
        <CardDescription>
          List of all registered users in the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? <p className="text-destructive">Error loading users.</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email} />
                          <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{user.displayName || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.createdAt ? format(new Date(user.createdAt.seconds * 1000), 'PPP') : 'N/A'}</TableCell>
                  </TableRow>
              ))}
               {!loading && users?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No users have signed up yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
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
          <p className="text-muted-foreground">
            Welcome to the admin panel. Here you can manage accident reports, and known locations.
          </p>
        </CardContent>
      </Card>
      
      <UsersViewer />
      <AccidentReportsViewer />
      <LocationManager />
      <GuideManager />
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
