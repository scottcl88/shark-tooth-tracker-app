import { CoordinatesPositionModel } from "./location";

export class ToothModel {

    constructor(data?: ToothModel) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        } else {
            this.createdDate = new Date();
        }
    }
    init(_data?: any) {
        if (_data) {
            this.toothId = _data["toothId"] !== undefined ? _data["toothId"] : <any>null;
            this.photoUrl = _data["photoUrl"] !== undefined ? _data["photoUrl"] : <any>null;
            this.description = _data["description"] !== undefined ? _data["description"] : <any>null;
            this.teethCount = _data["teethCount"] !== undefined ? _data["teethCount"] : <any>null;
            this.foundDate = _data["foundDate"] ? new Date(_data["foundDate"].toString()) : <any>null;
            this.location = _data["location"] !== undefined ? _data["location"] : <any>null;
            this.locationText = _data["locationText"] !== undefined ? _data["locationText"] : <any>null;
            this.showEditLocation = _data["showEditLocation"] !== undefined ? _data["showEditLocation"] : <any>null;
            this.searchMinutes = _data["searchMinutes"] !== undefined ? _data["searchMinutes"] : <any>null;
            this.beachName = _data["beachName"] !== undefined ? _data["beachName"] : <any>null;
            this.beachAccess = _data["beachAccess"] !== undefined ? _data["beachAccess"] : <any>null;

            this.createdDate = _data["createdDate"] ? new Date(_data["createdDate"].toString()) : <any>null;
            this.modifiedDate = _data["modifiedDate"] ? new Date(_data["modifiedDate"].toString()) : <any>null;
            this.deletedDate = _data["deletedDate"] ? new Date(_data["deletedDate"].toString()) : <any>null;
        }
    }

    toothId: number;
    firestoreId?: string | null;
    photoUrl: string;
    imageData: any;
    hasImageError: boolean;//used to hide image on error for home screen
    description: string;
    teethCount: number;
    foundDate: Date;
    location: CoordinatesPositionModel | null;
    locationText: string;
    showEditLocation: boolean;//used to undo the location
    searchMinutes: number;
    beachName: string;
    beachAccess: string;

    createdDate: Date | null;
    modifiedDate: Date | null;
    deletedDate: Date | null;
}
