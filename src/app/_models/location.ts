export class CoordinatesPositionModel {

  constructor(data?: CoordinatesPositionModel) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }
  init(_data?: any) {
    if (_data) {
      this.latitude = _data["latitude"] !== undefined ? _data["latitude"] : <any>null;
      this.latitudeText = _data["latitudeText"] !== undefined ? _data["latitudeText"] : <any>null;
      this.longitude = _data["longitude"] !== undefined ? _data["longitude"] : <any>null;
      this.longitudeText = _data["longitudeText"] !== undefined ? _data["longitudeText"] : <any>null;
      this.locationHref = _data["locationHref"] !== undefined ? _data["locationHref"] : <any>null;
      this.accuracy = _data["accuracy"] !== undefined ? _data["accuracy"] : <any>null;
      this.altitudeAccuracy = _data["altitudeAccuracy"] !== undefined ? _data["altitudeAccuracy"] : <any>null;
      this.altitude = _data["altitude"] !== undefined ? _data["altitude"] : <any>null;
      this.speed = _data["speed"] !== undefined ? _data["speed"] : <any>null;
      this.heading = _data["heading"] !== undefined ? _data["heading"] : <any>null;
      this.state = _data["state"] !== undefined ? _data["state"] : <any>null;
      this.city = _data["city"] !== undefined ? _data["city"] : <any>null;
      this.country = _data["country"] !== undefined ? _data["country"] : <any>null;
    }
  }
  latitude?: number;
  latitudeText?: string | null;
  longitude?: number;
  longitudeText?: string | null;
  locationHref?: string | null;
  accuracy?: number;
  altitudeAccuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  state?: string | null;
  city?: string | null;
  country?: string | null;
}