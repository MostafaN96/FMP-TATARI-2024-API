class Warehouse {
  constructor(name, phone, address, storekeeper_name, is_stock, is_grade, creator_id, ip_address) {
    this.name = name;
    this.phone = phone;
    this.address = address;
    this.storekeeper_name = storekeeper_name;
    this.is_stock = is_stock;
    this.is_grade = is_grade;
    this.creator_id = creator_id;
    this.ip_address = ip_address;
  }
}

module.exports = Warehouse