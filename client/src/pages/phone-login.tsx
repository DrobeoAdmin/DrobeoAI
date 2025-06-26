import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function PhoneLogin() {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const requestCodeMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      return apiRequest("/api/auth/phone/request-code", "POST", { phoneNumber });
    },
    onSuccess: () => {
      setStep("verify");
      toast({
        title: "Verification code sent",
        description: "Check your phone for the verification code",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; code: string }) => {
      return apiRequest("/api/auth/phone/login", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome back to Drobeo!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    requestCodeMutation.mutate(phoneNumber);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    loginMutation.mutate({ phoneNumber, code });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            {step === "phone" 
              ? "Enter your phone number to sign in"
              : "Enter the verification code sent to your phone"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={requestCodeMutation.isPending || !phoneNumber}
              >
                {requestCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link href="/phone-signup" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Or{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    sign in with email
                  </Link>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending || !code}
              >
                {loginMutation.isPending ? "Verifying..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("phone")}
              >
                Back to Phone Number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}