
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface LoginCredentials {
  email: string;
  password: string;
}

const ADMIN_CREDENTIALS = { 
  email: "gogreenleafyvegetables@gmail.com", 
  password: "901901SSDD##ss" 
};

const LoginForm = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (
        credentials.email === ADMIN_CREDENTIALS.email && 
        credentials.password === ADMIN_CREDENTIALS.password
      ) {
        // Store auth state
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("adminUser", JSON.stringify({
          email: credentials.email,
          name: "Go Green Leafy Vegetables Admin"
        }));
        toast({
          title: "Login successful",
          description: "Welcome to the Vegetable Order Management System",
        });
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid email or password",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🥬</div>
          <CardTitle className="text-2xl text-primary font-bold">
            Go Green Leafy Vegetables
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
          <CardFooter>
            <Button className="w-full bg-green-600 hover:bg-green-700" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login to Admin Portal"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
