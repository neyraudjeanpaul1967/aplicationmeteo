import { z } from "zod";

// Schéma pour l'inscription
export const signUpSchema = z
  .object({
    email: z.string().email("Adresse email invalide"),
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    telephone: z
      .string()
      .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
      .regex(/^[0-9+\-\s]+$/, "Le numéro de téléphone n'est pas valide"),
    localite: z
      .string()
      .min(2, "La localité doit contenir au moins 2 caractères"),
    password: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma pour la connexion
export const signInSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Schéma pour la mise à jour du profil
export const updateProfileSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  telephone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres")
    .regex(/^[0-9+\-\s]+$/, "Le numéro de téléphone n'est pas valide"),
  localite: z
    .string()
    .min(2, "La localité doit contenir au moins 2 caractères"),
});

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });
