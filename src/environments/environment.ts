// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  enableAuth: true,
  API_BASE_URL: "https://licenseplateapi.azurewebsites.net",
  googleApiKey: "AIzaSyDPhoPstqzWL0b7hLEWcECfnxFt-r9Kpes",
  firebaseConfig: {
    apiKey: "AIzaSyBRDTBIiPMYYBvp6bIOsPXf-Id9uXkLh4M",
    authDomain: "shark-tooth-tracker.firebaseapp.com",
    databaseURL: "https://shark-tooth-tracker-default-rtdb.firebaseio.com",
    projectId: "shark-tooth-tracker",
    storageBucket: "shark-tooth-tracker.appspot.com",
    messagingSenderId: "403064580432",
    appId: "1:403064580432:web:40288c628e26a1e8a8a455",
    measurementId: "G-C5TN65XBDG"
  }
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
