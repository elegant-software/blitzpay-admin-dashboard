import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthSession, DEFAULT_AUTH_SESSION } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly sessionSubject = new BehaviorSubject<AuthSession>(DEFAULT_AUTH_SESSION);

  readonly session$ = this.sessionSubject.asObservable();

  get snapshot(): AuthSession {
    return this.sessionSubject.value;
  }

  patch(patch: Partial<AuthSession>): void {
    this.sessionSubject.next({
      ...this.sessionSubject.value,
      ...patch
    });
  }

  replace(session: AuthSession): void {
    this.sessionSubject.next(session);
  }

  reset(): void {
    this.sessionSubject.next(DEFAULT_AUTH_SESSION);
  }
}
