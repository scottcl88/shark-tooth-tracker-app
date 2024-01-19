import { CoordinatesPositionModel, Role, UserId, VehicleType } from "src/api";

export class Account {

    constructor(){
        this.createdDate = new Date();
    }

    userId: string;
    name: string;
    email: string;
    isAnonymous: boolean;
    role: Role;
    isVerified: boolean;
    homeLocation: CoordinatesPositionModel | null;
    recordLocationOption: string;
    hasSeenDisclaimer: boolean;
    selectedVehicles: VehicleType[];
    hasTriedRestorePlayGame: boolean;
    providerId: string;
    tenantId: string | null;
    photoUrl: string | null;
    disableSpaceAlert: boolean;
    disableSignInAlert: boolean;
    createdDate: Date | null;
    modifiedDate: Date | null;
    disableOfflineAlert: boolean;
    hasSeenTour: boolean;
    canContact: boolean;
}
