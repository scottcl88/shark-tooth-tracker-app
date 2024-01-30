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
            this.foundDate = _data["foundDate"] ? new Date(_data["foundDate"].toString()) : <any>null;
            this.location = _data["location"] !== undefined ? _data["location"] : <any>null;

            this.createdDate = _data["createdDate"] ? new Date(_data["createdDate"].toString()) : <any>null;
            this.modifiedDate = _data["modifiedDate"] ? new Date(_data["modifiedDate"].toString()) : <any>null;
            this.deletedDate = _data["deletedDate"] ? new Date(_data["deletedDate"].toString()) : <any>null;
        }
    }

    toothId: number;
    photoUrl: string;
    imageData: any;
    description: string;
    foundDate: Date;
    location: CoordinatesPositionModel | null;

    createdDate: Date | null;
    modifiedDate: Date | null;
    deletedDate: Date | null;
}
