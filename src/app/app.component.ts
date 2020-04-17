import { Component } from '@angular/core';
import { pipe } from 'rxjs';

import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { SwUpdate, SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  displayToken: string;
  title = 'PushDemo';
  constructor(updates: SwUpdate, push: SwPush) {
    updates.available.subscribe(_ => updates.activateUpdate().then(() => {
      console.log('reload for update');
      document.location.reload();
    }));
    push.messages.subscribe(msg => console.log('push message', msg));
    push.notificationClicks.subscribe(click => console.log('notification click', click));
    if (!firebase.apps.length) {
      firebase.initializeApp(environment.firebaseConfig);
      navigator.serviceWorker.getRegistration().then(swr => firebase.messaging().useServiceWorker(swr));
    }
  }

  permitToNotify() {
    const messaging = firebase.messaging();
    messaging.requestPermission()
      .then(() => messaging.getToken().then(token => this.displayToken = token))
      .catch(err => {
        console.log('Unable to get permission to notify.', err);
      });
  }

  deniedToNotify() {
    const messaging = firebase.messaging();
    navigator.serviceWorker.getRegistration().then(swr => firebase.messaging().useServiceWorker(swr));
    messaging.getToken().then(token => messaging.deleteToken(token));
    //messaging.deleteToken(token);

    /*messaging.getToken
      .pipe(mergeMap(token => messaging.deleteToken(token)))
      .subscribe(
        (token) => { console.log('Token deleted!'); },
      );*/
  }
}
