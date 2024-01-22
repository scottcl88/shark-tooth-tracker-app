import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { StorageService } from '../storage.service';
import { LoggerService } from '../logger.service';
import { GeocodeService } from '../geocode.service';
import { CollectionService } from '../collection.service';

export function appInitializer(storageService: StorageService, firebaseAuthService: FirebaseAuthService, collectionService: CollectionService, loggerService: LoggerService, geocodeService: GeocodeService) {
    return () => new Promise(async (resolve: any) => {
        console.debug("appInitializer starting");
        storageService.init().then(async res => {
            console.debug("StorageService init finished inside appInitializer");
            firebaseAuthService.initialize().then(async res => {
                console.debug("firebaseAuthService init finished inside appInitializer");
                collectionService.init().then(async res => {
                    console.debug("gameService init finished inside appInitializer");
                    loggerService.init().then(async res => {
                        console.debug("loggerService init finished inside appInitializer");
                        geocodeService.init().then(async res => {
                            console.debug("geocodeService init finished inside appInitializer");
                            resolve();
                        });
                    });
                });
            });
        });
    });
}