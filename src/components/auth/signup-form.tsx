'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

const formSchema = z
  .object({
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters.',
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignUpForm() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    try {
      // 1. Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // 2. Save user information to Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        createdAt: new Date(),
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      toast({
        title: 'Sign Up Successful',
        description: 'Welcome! You have successfully created an account.',
      });

      // 3. Redirect to home page after successful signup
      router.push('/');
    } catch (error: any) {
      console.error('Error signing up:', error);

      let errorMessage = 'An unexpected error occurred during sign up.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak.';
      }

      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: errorMessage,
      });
    }
  }

  async function handleGoogleSignIn() {
    if (!firestore) return;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      // If it's a new user, save their data to Firestore
      if (additionalInfo?.isNewUser) {
        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,
          createdAt: new Date(),
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
      }

      toast({
        title: 'Sign In Successful',
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description:
          'Could not sign in with Google. Please try again.',
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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
            {form.formState.isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
      </Form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        Google
      </Button>
    </>
  );
}
