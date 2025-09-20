import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { StorageService } from '../storage.service';
import { LoggerService } from '../logger.service';
import { GeocodeService } from '../geocode.service';
import { CollectionService } from '../collection.service';
import { FirestoreService } from 'src/firestore.service';

export function appInitializer(storageService: StorageService, firebaseAuthService: FirebaseAuthService, firestoreService: FirestoreService, collectionService: CollectionService, loggerService: LoggerService, geocodeService: GeocodeService) {
    return () => new Promise((resolve: any) => {
        console.debug("appInitializer starting");
        storageService.init().then(res => {
            console.debug("StorageService init finished inside appInitializer");
            firebaseAuthService.initialize().then(res => {
                console.debug("firebaseAuthService init finished inside appInitializer");
                firestoreService.initialize().then(res => {
                    console.debug("firestoreService init finished inside appInitializer");
                    collectionService.init().then(res => {
                        console.debug("collectionService init finished inside appInitializer");
                        loggerService.init().then(res => {
                            console.debug("loggerService init finished inside appInitializer");
                            geocodeService.init().then(res => {
                                console.debug("geocodeService init finished inside appInitializer");
                                resolve();
                            });
                        });
                    });
                });
            });
        });
    });
}