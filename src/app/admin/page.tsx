'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Users, MapPin, Flag, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, type DocumentData, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


interface AppUser extends DocumentData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const locationSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    description: z.string().optional(),
});


function LocationManager() {
    const [locations, loading, error] = useCollection(collection(db, 'admin_locations'));
    const { toast } = useToast();
    const form = useForm<z.infer<typeof locationSchema>>({
        resolver: zodResolver(locationSchema),
        defaultValues: { name: "", latitude: 0, longitude: 0, description: "" }
    });

    async function onSubmit(values: z.infer<typeof locationSchema>) {
        const batch = writeBatch(db);
        const newLocationRef = doc(collection(db, 'admin_locations'));
        batch.set(newLocationRef, values);
        try {
            await batch.commit();
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
            <MapPin /> Location Management
          </CardTitle>
          <CardDescription>
            Add or manage locations to associate with accident reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className='grid md:grid-cols-2 gap-8'>
                <div>
                     <h3 className="font-semibold mb-4">Existing Locations</h3>
                    {loading && <Skeleton className="h-10 w-full" />}
                    {error && <p className="text-destructive">Error loading locations.</p>}
                    <div className="space-y-2">
                        {locations?.docs.map(loc => (
                            <div key={loc.id} className="p-3 border rounded-md text-sm">
                                <p className="font-bold">{loc.data().name}</p>
                                <p className="text-muted-foreground">{loc.data().description}</p>
                                <p className="text-xs text-muted-foreground">Lat: {loc.data().latitude}, Lng: {loc.data().longitude}</p>
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
                                    <FormControl><Input placeholder="e.g., Downtown Crossing" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                             <div className='flex gap-4'>
                                <FormField control={form.control} name="latitude" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="longitude" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Longitude</FormLabel>
                                        <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                             </div>
                             <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Input placeholder="Optional details" {...field} /></FormControl>
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


function AccidentReportsManager() {
  const [reports, loading, error] = useCollection(collection(db, 'accident_reports'));
  const [locations] = useCollection(collection(db, 'admin_locations'));
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleApprove = async (reportId: string, locationId: string) => {
    if (!locationId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a location.' });
        return;
    }
    const locationDoc = locations?.docs.find(doc => doc.id === locationId);
    if (!locationDoc) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected location not found.' });
        return;
    }

    const reportRef = doc(db, 'accident_reports', reportId);
    try {
      await updateDoc(reportRef, {
        status: 'approved',
        adminLocationId: locationId,
        adminLocationName: locationDoc.data().name
      });
      toast({ title: 'Report Approved', description: 'The report is now public.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not approve report.' });
    }
  };

  const handleDeny = async (reportId: string) => {
     const reportRef = doc(db, 'accident_reports', reportId);
    try {
      await updateDoc(reportRef, { status: 'denied' });
      toast({ title: 'Report Denied', description: 'The report has been marked as denied.' });
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not deny report.' });
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Flag /> Accident Reports
        </CardTitle>
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
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.docs.map((doc) => {
                const report = doc.data();
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{report.userEmail || 'N/A'}</TableCell>
                    <TableCell>{report.reportDate ? format(report.reportDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                    <TableCell>
                        <p className='max-w-xs truncate'>{report.description}</p>
                        <p className='text-muted-foreground text-xs'>Location: {report.locationDescription}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'approved' ? 'default' : report.status === 'denied' ? 'destructive' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {report.status === 'reported' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">Review</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Accident Report</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <p><strong>Description:</strong> {report.description}</p>
                                <p><strong>User's Location Hint:</strong> {report.locationDescription}</p>
                                <Select onValueChange={setSelectedLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an Admin Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations?.docs.map(loc => (
                                            <SelectItem key={loc.id} value={loc.id}>{loc.data().name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                               <DialogClose asChild>
                                <Button variant="ghost">Cancel</DialogClose>
                               </DialogClose>
                               <DialogClose asChild>
                                <Button variant="destructive" onClick={() => handleDeny(doc.id)}>Deny</Button>
                               </DialogClose>
                               <DialogClose asChild>
                                <Button onClick={() => handleApprove(doc.id, selectedLocation)}>Approve</Button>
                               </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}


function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(
          (doc) => ({ ...doc.data(), uid: doc.id } as AppUser)
        );
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
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
                      {user.createdAt ? format(new Date(user.createdAt.seconds * 1000), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell>{/* Action buttons go here */}</TableCell>
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
            Welcome to the admin panel. Here you can manage users, content, and
            other settings.
          </p>
        </CardContent>
      </Card>

      <AccidentReportsManager />
      <LocationManager />
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
  const { isAdmin } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        {isAdmin ? <AdminDashboard /> : <AccessDenied />}
      </div>
    </div>
  );
}
