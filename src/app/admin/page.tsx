'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

function AdminDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to the admin panel. Here you can manage users, content, and other settings.</p>
      </CardContent>
    </Card>
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
        <p>You do not have permission to view this page. Please contact an administrator if you believe this is an error.</p>
      </CardContent>
    </Card>
  );
}


export default function AdminPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        {isAdmin ? <AdminDashboard /> : <AccessDenied />}
      </div>
    </div>
  );
}
