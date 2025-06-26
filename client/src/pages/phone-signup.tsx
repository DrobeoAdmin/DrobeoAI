import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface PhoneSignupData {
  phoneNumber: string;
  code: string;
  name: string;
}

export default function PhoneSignup() {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: PhoneSignupData) => {
      const response = await apiRequest("/api/auth/phone/verify", "POST", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Set the user data directly in the cache
      queryClient.setQueryData(["/api/auth/user"], data.user);
      
      toast({
        title: "Account created",
        description: "Welcome to Drobeo!",
      });
      
      // Small delay to ensure cache is set before navigation
      setTimeout(() => {
        setLocation("/");
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
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

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    verifyCodeMutation.mutate({ phoneNumber, code, name });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign up for Drobeo</CardTitle>
          <CardDescription>
            {step === "phone" 
              ? "Enter your phone number to get started"
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
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
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
                disabled={verifyCodeMutation.isPending || !code || !name}
              >
                {verifyCodeMutation.isPending ? "Verifying..." : "Verify & Create Account"}
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