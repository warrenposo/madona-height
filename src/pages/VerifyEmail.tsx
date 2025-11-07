import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Supabase automatically processes the hash fragments in the URL
        // Wait a moment for Supabase to process the redirect
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user is now authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setStatus('error');
          setMessage(sessionError.message || 'Email verification failed.');
          toast({
            title: "Verification Failed",
            description: sessionError.message,
            variant: "destructive",
          });
          return;
        }

        if (session && session.user) {
          setStatus('success');
          setMessage('Your email has been verified successfully! You can now log in.');
          toast({
            title: "Email Verified!",
            description: "Your account has been verified. You can now log in.",
          });
          
          // Sign out to force them to log in with password
          await supabase.auth.signOut();
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          // Check URL for error
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          if (error) {
            setStatus('error');
            setMessage(errorDescription || error || 'Email verification failed. The link may have expired.');
          } else {
            setStatus('error');
            setMessage('Email verification link is invalid or has expired. Please try signing up again.');
          }
          
          toast({
            title: "Verification Failed",
            description: errorDescription || error || "Please try signing up again",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during verification.');
        toast({
          title: "Verification Error",
          description: err.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Email Verification</CardTitle>
          <CardDescription>Verifying your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center py-8">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-center text-muted-foreground">{message}</p>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-center text-muted-foreground">{message}</p>
                <p className="text-center text-sm text-muted-foreground mt-2">Redirecting to login...</p>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-center text-muted-foreground">{message}</p>
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => navigate("/signup")} variant="outline">
                    Sign Up Again
                  </Button>
                  <Button onClick={() => navigate("/login")}>
                    Go to Login
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;

