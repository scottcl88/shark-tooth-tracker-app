import { CoordinatesPositionModel } from "./location";

export class ToothModel {

    constructor(data?: ToothModel) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        } else {
            this.createdDate = new Date();
        }
    }
    init(_data?: any) {
        if (!_data) return;
        const pick = (key: string) => _data[key] !== undefined ? _data[key] : null;
        this.toothId = pick("toothId");
        this.photoUrl = pick("photoUrl");
        this.description = pick("description");
        this.teethCount = pick("teethCount");
        this.foundDate = this.safeParseDate(pick("foundDate"));
        this.location = pick("location");
        this.locationText = pick("locationText");
        this.showEditLocation = pick("showEditLocation");
        this.searchMinutes = pick("searchMinutes");
        this.beachName = pick("beachName");
        this.beachAccess = pick("beachAccess");
        this.createdDate = this.safeParseDate(pick("createdDate"));
        this.modifiedDate = this.safeParseDate(pick("modifiedDate"));
        this.deletedDate = this.safeParseDate(pick("deletedDate"));
    }

    private safeParseDate(input: any): Date | null {
        if (!input) return null;
        try {
            // Firestore Timestamp objects may have seconds/nanoseconds or toDate()
            if (typeof input === 'object') {
                if (typeof input.toDate === 'function') {
                    const d = input.toDate();
                    return isNaN(d?.getTime()) ? null : d;
                }
                if (input.seconds !== undefined) {
                    const ms = (input.seconds * 1000) + Math.floor((input.nanoseconds || 0) / 1_000_000);
                    const d = new Date(ms);
                    return isNaN(d.getTime()) ? null : d;
                }
            }
            const d = new Date(input.toString());
            return isNaN(d.getTime()) ? null : d;
        } catch {
            return null;
        }
    }

    toothId: number;
    firestoreId?: string | null;
    photoUrl: string;
    imageData: any;
    hasImageError: boolean;//used to hide image on error for home screen
    description: string;
    teethCount: number;
    foundDate: Date | null;
    location: CoordinatesPositionModel | null;
    locationText: string;
    showEditLocation: boolean;//used to undo the location
    searchMinutes: number | null;
    beachName: string;
    beachAccess: string;

    createdDate: Date | null;
    modifiedDate: Date | null;
    deletedDate: Date | null;
}
