class Fabric {
  constructor(name, code, dyeing_code, fabric_quantity_m2, waste_ratio, creator_id, ip_address) {
    this.name = name;
    this.code = code;
    this.dyeing_code = dyeing_code;
    this.fabric_quantity_m2 = fabric_quantity_m2;
    this.waste_ratio = waste_ratio;
    this.creator_id = creator_id;
    this.ip_address = ip_address;
  }
}

module.exports = Fabric