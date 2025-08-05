import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl) {
  console.warn("NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local");
}

if (!supabaseAnonKey) {
  console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY manquante dans .env.local");
}

// Utiliser des valeurs par défaut pour le développement si les variables ne sont pas définies
const defaultUrl = supabaseUrl || "https://demo.supabase.co";
const defaultKey = supabaseAnonKey || "demo-key";

export const supabase = createClient(defaultUrl, defaultKey);

// Client pour les opérations côté serveur (optionnel)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(defaultUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;
