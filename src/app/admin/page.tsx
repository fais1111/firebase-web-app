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
import { AlertTriangle, Users, MapPin, Flag, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { collection, type DocumentData, doc, addDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AppUser extends DocumentData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: { toDate: () => Date };
}

const locationSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
});


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
        try {
            await addDoc(collection(firestore, 'admin_locations'), values);
            toast({ title: "Location Added", description: "The new location has been saved."});
            form.reset();
        } catch (e) {
            console.error("Error adding location: ", e);
            toast({ variant: "destructive", title: "Error", description: "Could not add location." });
        }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <MapPin /> Accident Location Management
          </CardTitle>
          <CardDescription>
            Add or manage locations where accidents frequently occur. This will be shown to users.
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
                            <div key={loc.id} className="p-3 border rounded-md text-sm">
                                <p className="font-bold">{loc.name}</p>
                                <p className="text-muted-foreground">{loc.description}</p>
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
                    <TableCell>{report.reportDate ? format(report.reportDate.toDate(), 'PPP') : 'N/A'}</TableCell>
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


function UserManagement() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading, error } = useCollection<AppUser>(usersQuery);

  return (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Users /> User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? <p className='text-destructive'>Error loading users. Check security rules.</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.photoURL} alt={user.displayName} />
                          <AvatarFallback>
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                         <span className="font-medium">
                           {user.displayName || 'N/A'}
                         </span>
                         {user.email === 'techworldinfo98@gmail.com' && <Badge variant="destructive" className="w-fit">Admin</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.createdAt ? format(user.createdAt.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && users?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">No users found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    )
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
            Welcome to the admin panel. Here you can manage users, accident reports, and known locations.
          </p>
        </CardContent>
      </Card>
      
      <UserManagement />
      <AccidentReportsViewer />
      <LocationManager />
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
