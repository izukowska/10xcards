import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerSchema } from "../../lib/validation/auth";
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
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createBrowserClient();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      form.reset();
    } catch (e: any) {
      setError(e.message || "Wystąpił błąd podczas rejestracji");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center" data-testid="register-success-message">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" data-testid="register-success-icon" />
        </div>
        <h3 className="text-lg font-medium">Rejestracja pomyślna!</h3>
        <p className="text-sm text-gray-500">
          Sprawdź swoją skrzynkę email, aby potwierdzić konto.
        </p>
        <Button asChild className="w-full mt-4">
          <a href="/login" data-testid="register-success-login-link">Wróć do logowania</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="register-form-container">
      {error && (
        <Alert variant="destructive" data-testid="register-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription data-testid="register-error-message">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
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
                    data-testid="register-email-input"
                  />
                </FormControl>
                <FormMessage data-testid="register-email-error" />
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
                    data-testid="register-password-input"
                  />
                </FormControl>
                <FormMessage data-testid="register-password-error" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potwierdź hasło</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    data-testid="register-confirm-password-input"
                  />
                </FormControl>
                <FormMessage data-testid="register-confirm-password-error" />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            data-testid="register-submit-button"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" data-testid="register-loading-spinner" />}
            Zarejestruj się
          </Button>
        </form>
      </Form>
      
      <div className="text-center text-sm">
        Masz już konto?{" "}
        <a 
          href="/login" 
          className="text-blue-600 hover:underline"
          data-testid="register-login-link"
        >
          Zaloguj się
        </a>
      </div>
    </div>
  );
};
