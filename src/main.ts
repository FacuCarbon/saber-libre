import { bootstrapApplication } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { registrarIconos } from './app/iconos.config';

import {
  getApp,
  initializeApp,
  provideFirebaseApp,
} from '@angular/fire/app';
import {
  getAuth,
  initializeAuth,
  provideAuth,
} from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { indexedDBLocalPersistence } from 'firebase/auth';
import { environment } from './environments/environment';
import { provideHttpClient } from '@angular/common/http';

registrarIconos();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() =>
      Capacitor.isNativePlatform()
        ? initializeAuth(getApp(), {
            persistence: indexedDBLocalPersistence,
          })
        : getAuth(),
    ),
    provideFirestore(() => getFirestore()),
    provideHttpClient(),
  ],
});
