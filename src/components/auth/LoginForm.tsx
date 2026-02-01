import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginSchema } from "../../lib/validation/auth";
import { createBrowserClient } from "../../lib/supabase";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      // Refresh page or redirect handled by middleware/client logic
      // In Astro SPA/MPA hybrid, full reload ensures middleware runs and new cookies are seen
      window.location.href = "/generate";
    } catch (e: any) {
      setError(e.message || "Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4" data-testid="login-form-container">
      {error && (
        <Alert variant="destructive" data-testid="login-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription data-testid="login-error-message">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="login-form">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="imie@przyklad.com" 
                    {...field} 
                    data-testid="login-email-input"
                  />
                </FormControl>
                <FormMessage data-testid="login-email-error" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasło</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    data-testid="login-password-input"
                  />
                </FormControl>
                <FormMessage data-testid="login-password-error" />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            data-testid="login-submit-button"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="login-loading-spinner" />}
            Zaloguj się
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        Nie masz konta?{" "}
        <a 
          href="/register" 
          className="text-green-600 hover:underline"
          data-testid="login-register-link"
        >
          Zarejestruj się
        </a>
      </div>
      <div className="text-center text-sm">
        <a 
          href="/forgot-password" 
          className="text-gray-500 hover:underline"
          data-testid="login-forgot-password-link"
        >
          Zapomniałeś hasła?
        </a>
      </div>
    </div>
  );
};
