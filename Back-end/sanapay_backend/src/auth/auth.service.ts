import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private users: { email: string; password: string }[] = [];

  register(email: string, password: string) {
    this.users.push({ email, password });
    return 'Utilisateur enregistré avec succès';
  }

  login(email: string, password: string) {
    const user = this.users.find(
      (u) => u.email === email && u.password === password,
    );

    return user
      ? 'Connexion réussie'
      : 'Identifiants invalides';
  }
}
