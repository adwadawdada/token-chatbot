
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast.error("Please enter your token");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Validate token
      const isValid = await api.validateToken(token);
      
      if (isValid) {
        // Set token in auth context
        await login(token);
        toast.success("Login successful");
        navigate("/chat");
      } else {
        toast.error("Token unauthorized");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-primary/30"></div>
            <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">AI</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Enter your token to access the AI assistant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              id="token"
              name="token"
              type="password"
              placeholder="Enter your access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="glass-morphism text-foreground py-6"
              autoComplete="off"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full py-6 font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
