
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginForm = ({ onShowSignup }: { onShowSignup: () => void }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
      } else if (data.user) {
        toast({
          title: "Login successful",
          description: "Welcome to Shree Ganesha Green Leafy Vegetables Admin Portal",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm bg-white/95">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <img 
              src="/lovable-uploads/8fa965fb-6405-4e65-ba32-8efd8d8ef4ed.png" 
              alt="Lord Ganesha" 
              className="h-20 w-auto mx-auto"
            />
          </div>
          <CardTitle className="text-2xl text-primary font-bold">
            Shree Ganesha Green Leafy Vegetables
          </CardTitle>
          <CardDescription className="text-center">
            Admin Portal - Vegetable Order Management System
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full bg-green-600 hover:bg-green-700" type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login to Admin Portal"}
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-sm" 
            onClick={onShowSignup}
          >
            Need to create an admin account? Sign up
          </Button>
        </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
