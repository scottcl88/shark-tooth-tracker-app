export class Account {

    constructor(){
        this.createdDate = new Date();
    }

    userId: string;
    name: string;
    email: string;
    isAnonymous: boolean;
    isVerified: boolean;
    hasSeenDisclaimer: boolean;
    providerId: string;
    tenantId: string | null;
    photoUrl: string | null;
    createdDate: Date | null;
    modifiedDate: Date | null;
}
