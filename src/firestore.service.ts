/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Injectable } from '@angular/core';
import { FirebaseAuthentication, User } from '@capacitor-firebase/authentication';
import { Observable, ReplaySubject } from 'rxjs';
import { RemoteConfig } from "firebase/remote-config";
import { LoggerService } from './app/logger.service';
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { ToothModel } from './app/_models/toothModel';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private currentUser: User | null;
  private readonly currentUserSubject = new ReplaySubject<User | null>(1);
  private loadedData: any = {};

  public remoteConfig: RemoteConfig;

  constructor(private readonly logger: LoggerService) {
  }

  public get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.debug("FirestoreService initialize() called");
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      this.currentUserSubject.next(this.currentUser);
    } catch (err: any) {
      this.logger.error("Error on firestore initialize: " + err + " ||| " + JSON.stringify(err), err);
    }
  }
  public async loadProfile() {
    return new Promise<any>(async (resolve, reject) => {
      try {
        this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
        const { snapshot } = await FirebaseFirestore.getDocument({
          reference: `users/${this.currentUser?.uid}`,
        });
        this.loadedData = snapshot;
        resolve(this.loadedData);
      } catch (err: any) {
        this.logger.errorWithContext("loadProfile in firebaseAuth Firestore: ", err);
        reject(err instanceof Error ? err : new Error(err?.message || 'loadProfile failed'));
      }
    });
  }

  public async loadCollection() {
    return new Promise<any>(async (resolve, reject) => {
      try {
        this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
        const collectionData = await FirebaseFirestore.getCollection({
          reference: `users/${this.currentUser?.uid}/teeth`,
        });
        let data = collectionData.snapshots;
        resolve(data);
      } catch (err: any) {
        this.logger.errorWithContext("loadCollection in firebaseAuth Firestore: ", err);
        reject(err instanceof Error ? err : new Error(err?.message || 'loadCollection failed'));
      }
    });
  }

  public async doSaveTeethToFirebase(teeth: ToothModel[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        for (const tooth of teeth) {
          await this.doSaveToothToFirebase(tooth);
        }
        resolve();
      } catch (err: any) {
        this.logger.errorWithContext("doSaveTeethToFirestore error", {
          userId: this.currentUser?.uid,
          errorMessage: err?.message || 'Unknown error',
          errorCode: err?.code,
        });
        reject(new Error(err?.message || 'Unknown error occurred'));
      }
    });
  }

  public async doSaveToothToFirebase(tooth: ToothModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Enhanced authentication verification with retry logic
        const authResult = await FirebaseAuthentication.getCurrentUser();
        this.currentUser = authResult.user;

        if (!this.currentUser?.uid) {
          const errorContext = {
            hasUser: !!this.currentUser,
            hasUid: !!this.currentUser?.uid,
            isAnonymous: this.currentUser?.isAnonymous,
            operation: 'doSaveToothToFirebase'
          };
          this.logger.errorWithContext("Authentication failed: User or UID missing", errorContext);
          reject(new Error("User not authenticated or UID missing"));
          return;
        }

        // Verify the user is still authenticated by checking token
        try {
          await FirebaseAuthentication.getIdToken();
        } catch (tokenErr: any) {
          this.logger.errorWithContext("Authentication token validation failed", {
            userId: this.currentUser.uid,
            tokenError: tokenErr?.message
          });
          reject(new Error("Authentication token expired"));
          return;
        }

        // Deep clone and serialize data with enhanced error handling
        const serializedData = this.serializeForFirestore(tooth); // Use simple serialization for now

        this.logger.debug("Attempting to save tooth to Firestore", {
          userId: this.currentUser.uid,
          toothId: tooth.toothId,
          hasFirestoreId: !!tooth.firestoreId,
          hasSerializedData: !!serializedData,
          dataSize: JSON.stringify(serializedData).length
        });

        // Use retry logic for Firestore operations
        if (tooth.firestoreId) {
          await FirebaseFirestore.setDocument({
            reference: `users/${this.currentUser.uid}/teeth/${tooth.firestoreId}`,
            data: serializedData,
            merge: true,
          });
          this.logger.debug("Successfully updated existing tooth in Firestore");
          resolve(tooth.firestoreId);
        } else {
          let addDocumentResult = await FirebaseFirestore.addDocument({
            reference: `users/${this.currentUser.uid}/teeth/`,
            data: serializedData,
          });
          this.logger.debug("Successfully added new tooth to Firestore");
          resolve(addDocumentResult.reference.id);
        }
      } catch (err: any) {
        this.logger.errorWithContext("doSaveToothToFirestore error", {
          userId: this.currentUser?.uid,
          toothId: tooth?.toothId,
          errorMessage: err?.message || 'Unknown error',
          errorCode: err?.code,
          errorDetails: err?.details,
          isPermissionDenied: err?.message?.includes('PERMISSION_DENIED') || err?.code === 'permission-denied'
        }, err);
        reject(new Error(err?.message || 'Unknown error occurred'));
      }
    });
  }

  public async doSaveProfileToFirebase(dataObj: any) {
    try {
      this.logger.debug("Saved to firebase in FirestoreService ", { hasSeenWhatsNewVersion: dataObj?.hasSeenWhatsNewVersion });

      // Get fresh user authentication
      const authResult = await FirebaseAuthentication.getCurrentUser();
      this.currentUser = authResult.user;

      // Enhanced authentication check
      if (!this.currentUser?.uid) {
        const errorContext = {
          hasUser: !!this.currentUser,
          hasUid: !!this.currentUser?.uid
        };
        this.logger.errorWithContext("Authentication failed: User or UID missing", errorContext);
        throw new Error("User not authenticated or UID missing");
      }

      // Verify the user is still authenticated
      const isAuthenticated = await FirebaseAuthentication.getCurrentUser();
      if (!isAuthenticated.user) {
        this.logger.error("User authentication expired during operation");
        throw new Error("User authentication expired");
      }

      this.logger.debug("Current user UID", { uid: this.currentUser.uid });

      const serializedData = this.serializeForFirestore(dataObj);
      this.logger.debug("Serialized data for Firestore", { serializedData });

      const documentReference = `users/${this.currentUser.uid}`;
      this.logger.debug("Document reference", { documentReference });

      // Log the exact operation being performed
      this.logger.debug("Attempting Firestore setDocument operation", {
        reference: documentReference,
        hasData: !!serializedData,
        dataKeys: Object.keys(serializedData || {}),
        merge: true
      });

      await FirebaseFirestore.setDocument({
        reference: documentReference,
        data: serializedData,
        merge: true,
      });

      this.logger.debug("Successfully saved profile to Firestore");
    } catch (err: any) {
      this.logger.errorWithContext("doSaveProfileToFirestore error", {
        userId: this.currentUser?.uid,
        errorMessage: err?.message || 'Unknown error',
        errorCode: err?.code,
        errorDetails: err?.details
      }, err);
      throw err; // Re-throw to let caller handle
    }
  }

  /**
   * Validates data structure before serialization
   */
  private validateDataStructure(obj: any): void {
    if (!obj) {
      throw new Error('Object is null or undefined');
    }

    // Check for common data corruption patterns
    if (typeof obj === 'string' && obj.includes('D.indexOf')) {
      throw new Error('Detected corrupted data with indexOf reference');
    }

    // Validate array structures
    if (Array.isArray(obj)) {
      this.validateArrayStructure(obj);
      return;
    }

    // Validate object properties
    if (typeof obj === 'object' && obj !== null) {
      this.validateObjectStructure(obj);
    }
  }

  private validateArrayStructure(arr: any[]): void {
    arr.forEach((item, index) => {
      if (item && typeof item === 'object') {
        this.validateDataStructure(item);
      }
    });
  }

  private validateObjectStructure(obj: any): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value && typeof value === 'object') {
          this.validateDataStructure(value);
        }
      }
    }
  }

  private removeUndefinedValues(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj
        .map(item => this.removeUndefinedValues(item))
        .filter(v => v !== undefined);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = this.removeUndefinedValues(obj[key]);
        if (obj[key] === undefined) {
          delete obj[key];
        }
      }
    }
    return { ...obj };
  }

  /**
   * Serialize for Firestore with reduced complexity
   */
  private serializeForFirestore(obj: any): any {
    // Handle primitive types first
    if (obj === null || typeof obj === 'boolean' || typeof obj === 'string') {
      return obj;
    }

    if (typeof obj === 'number') {
      return Number.isFinite(obj) ? obj : null;
    }

    // Handle special types
    if (this.isDate(obj)) {
      return { __date: obj.getTime() };
    }

    if (this.isTimestamp(obj) || this.isGeoPoint(obj) || this.isBlob(obj)) {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.serializeForFirestore(item));
    }

    // Handle objects
    if (typeof obj === 'object') {
      return this.serializeObjectForFirestore(obj);
    }

    // Fallback
    return obj;
  }

  private serializeObjectForFirestore(obj: any): any {
    if (typeof obj.toPlainObject === 'function') {
      return this.serializeForFirestore(obj.toPlainObject());
    }

    const plain: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        plain[key] = this.serializeForFirestore(obj[key]);
      }
    }
    return plain;
  }

  /** TYPE‐CHECK HELPERS **/

  // Date: via toString check
  private isDate(obj: any): any {
    return Object.prototype.toString.call(obj) === '[object Date]'
      && !Number.isNaN(obj.valueOf());  // valid date :contentReference[oaicite:0]{index=0}
  }

  // Firestore Timestamp–like: has toDate() + numeric seconds/nanoseconds
  private isTimestamp(obj: any): any {
    return obj != null
      && typeof obj.toDate === 'function'
      && (
        (typeof obj.seconds === 'number' && typeof obj.nanoseconds === 'number')
        || (typeof obj._seconds === 'number' && typeof obj._nanoseconds === 'number')
      );  // matches both client & admin shapes :contentReference[oaicite:1]{index=1}
  }

  // GeoPoint–like: has numeric latitude & longitude
  private isGeoPoint(obj: any): any {
    return obj != null
      && typeof obj.latitude === 'number'
      && typeof obj.longitude === 'number';  // Firestore GeoPoint shape :contentReference[oaicite:2]{index=2}
  }

  // Binary Blob: Node.js Buffer
  private isBlob(obj: any): any {
    // Guard against Node-specific Buffer in browser/test without polyfill
    const anyGlobal: any = (globalThis as any);
    const Buf = anyGlobal?.Buffer;
    return typeof Buf !== 'undefined' && typeof Buf.isBuffer === 'function' && Buf.isBuffer(obj);
  }

}