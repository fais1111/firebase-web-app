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
import { AlertTriangle, Users, MapPin, Flag } from 'lucide-react';
import { useMemo } from 'react';
import { collection, type DocumentData, writeBatch, doc, Timestamp } from 'firebase/firestore';
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
  createdAt: Timestamp;
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
        const newLocationRef = doc(collection(firestore, 'admin_locations'));
        try {
            await writeBatch(firestore).set(newLocationRef, values).commit();
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
                    {loading && <Skeleton className="h-10 w-full" />}
                    {error && <p className="text-destructive">Error loading locations.</p>}
                    <div className="space-y-2">
                        {locations?.map(loc => (
                            <div key={loc.id} className="p-3 border rounded-md text-sm">
                                <p className="font-bold">{loc.name}</p>
                                <p className="text-muted-foreground">{loc.description}</p>
                            </div>
                        ))}
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
                             <Button type="submit" disabled={form.formState.isSubmitting}>Add Location</Button>
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
  const { data: reports, isLoading: loading } = useCollection(reportsQuery);

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
        ) : (
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
  const { data: users, isLoading: isLoading, error } = useCollection<AppUser>(usersQuery);

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
          ) : error ? <p className='text-destructive'>Error loading users.</p> : (
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
            Welcome to the admin panel. Here you can manage locations and view user data.
          </p>
        </CardContent>
      </Card>
      
      <LocationManager />
      <AccidentReportsViewer />
      <UserManagement />
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
  const { isAdmin } = useAppAuth();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        {isAdmin ? <AdminDashboard /> : <AccessDenied />}
      </div>
    </div>
  );
}
