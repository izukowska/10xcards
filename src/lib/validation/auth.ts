import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  password: z.string().min(1, { message: "Hasło jest wymagane" }),
});

export const registerSchema = z
  .object({
    email: z.string().email({ message: "Nieprawidłowy adres email" }),
    password: z
      .string()
      .min(8, { message: "Hasło musi mieć co najmniej 8 znaków" })
      .regex(/[A-Z]/, { message: "Hasło musi zawierać co najmniej jedną wielką literę" })
      .regex(/[0-9]/, { message: "Hasło musi zawierać co najmniej jedną cyfrę" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
});
