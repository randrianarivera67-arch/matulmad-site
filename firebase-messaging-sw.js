/**
 * Service worker des notifications Firebase.
 *
 * Fichier separe de sw.js : Firebase exige ce nom exact a la racine du site,
 * et le charge lui-meme. Il ne s'occupe que des notifications — la mise en
 * cache reste le travail de sw.js.
 *
 * Les cles ci-dessous sont publiques : elles identifient le projet, elles
 * n'autorisent rien. L'envoi, lui, exige la cle privee qui reste au serveur.
 */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDVn7qsXMRYN-0jY3-oGpV8g-E3hDg-sVc",
  authDomain: "matulmada-3be39.firebaseapp.com",
  projectId: "matulmada-3be39",
  storageBucket: "matulmada-3be39.firebasestorage.app",
  messagingSenderId: "297315413732",
  appId: "1:297315413732:web:1255e736d67ee0a56a06f1"
});

const messaging = firebase.messaging();

// Notification recue alors que le site est ferme ou en arriere-plan.
messaging.onBackgroundMessage(function (payload) {
  const d = payload.data || {};
  const titre = d.title || 'MATULMADA';
  self.registration.showNotification(titre, {
    body: d.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: d.tag || 'matulmada',
    data: { url: d.url || '/' }
  });
});

// Un clic ramene sur le site : on reutilise l'onglet deja ouvert s'il existe,
// plutot que d'en empiler un nouveau a chaque notification.
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  const cible = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (liste) {
      for (const c of liste) {
        if ('focus' in c) { c.navigate(cible); return c.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(cible);
    })
  );
});
