import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { StorageService } from '../storage.service';
import { LoggerService } from '../logger.service';

export function appInitializer(storageService: StorageService, firebaseAuthService: FirebaseAuthService, loggerService: LoggerService) {
    return () => new Promise(async (resolve: any) => {
        console.debug("appInitializer starting");
        storageService.init().then(async res => {
            console.debug("StorageService init finished inside appInitializer");
            firebaseAuthService.initialize().then(async res => {
                console.debug("firebaseAuthService init finished inside appInitializer");
                loggerService.init().then(async res => {
                    console.debug("loggerService init finished inside appInitializer");
                    resolve();
                });
            });
        });
    });
}