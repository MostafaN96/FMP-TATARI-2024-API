class deliveryCar {
  constructor(model, plateNumber, driversName, phone, nationalId, creatorId, ipAddress) {
    this.model = model;
    this.plate_number = plateNumber;
    this.drivers_name = driversName;
    this.phone = phone;
    this.national_id = nationalId;
    this.creator_id = creatorId;
    this.ip_address = ipAddress;
  }
}

module.exports = deliveryCar