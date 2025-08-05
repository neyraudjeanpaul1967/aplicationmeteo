// Mode démo pour l'authentification (quand Supabase n'est pas configuré)

export class DemoAuth {
  constructor() {
    this.user = null;
    this.listeners = [];
  }

  // Simuler une inscription
  async signUp(email, password, userData) {
    await this.delay(1000); // Simuler une requête réseau

    if (email === "test@demo.com") {
      return { data: null, error: "Cet email est déjà utilisé (démo)" };
    }

    const user = {
      id: "demo-user-" + Date.now(),
      email,
      user_metadata: {
        nom: userData.nom,
        prenom: userData.prenom,
        telephone: userData.telephone,
        localite: userData.localite,
      },
      created_at: new Date().toISOString(),
    };

    return {
      data: { user },
      error: null,
    };
  }

  // Simuler une connexion
  async signInWithPassword({ email, password }) {
    await this.delay(1000);

    if (email === "demo@example.com" && password === "demo123") {
      const user = {
        id: "demo-user-123",
        email: "demo@example.com",
        user_metadata: {
          nom: "Démo",
          prenom: "Utilisateur",
          telephone: "0123456789",
          localite: "Paris",
        },
        created_at: new Date().toISOString(),
      };

      this.user = user;
      this.notifyListeners("SIGNED_IN", { user });

      return {
        data: { user },
        error: null,
      };
    }

    return {
      data: null,
      error: "Email ou mot de passe incorrect (démo)",
    };
  }

  // Simuler une déconnexion
  async signOut() {
    await this.delay(500);
    this.user = null;
    this.notifyListeners("SIGNED_OUT", null);
    return { error: null };
  }

  // Simuler la récupération de session
  async getSession() {
    return {
      data: { session: this.user ? { user: this.user } : null },
    };
  }

  // Simuler la mise à jour d'utilisateur
  async updateUser(updates) {
    await this.delay(1000);

    if (this.user) {
      this.user = {
        ...this.user,
        user_metadata: {
          ...this.user.user_metadata,
          ...updates.data,
        },
      };

      this.notifyListeners("USER_UPDATED", { user: this.user });

      return {
        data: { user: this.user },
        error: null,
      };
    }

    return { data: null, error: "Utilisateur non connecté" };
  }

  // Écouter les changements d'état
  onAuthStateChange(callback) {
    this.listeners.push(callback);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  }

  // Notifier les listeners
  notifyListeners(event, session) {
    this.listeners.forEach((callback) => {
      callback(event, session);
    });
  }

  // RPC simulé
  async rpc(functionName) {
    await this.delay(1000);
    if (functionName === "delete_user_account") {
      this.user = null;
      this.notifyListeners("SIGNED_OUT", null);
      return { error: null };
    }
    return { error: "Fonction non implémentée en mode démo" };
  }

  // Simuler un délai réseau
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Créer l'instance de démo
export const demoAuth = new DemoAuth();
