class Bussinessman {
    constructor(name, phone,address,is_supplier,is_seller,is_manufacturer, is_dyer, is_calc_dyeing_net,
      is_stock, creator_id, ip_address) {
      this.name = name;
      this.phone = phone;
      this.address = address;
      this.is_supplier = is_supplier;
      this.is_seller = is_seller;
      this.is_manufacturer = is_manufacturer;
      this.is_dyer = is_dyer;
      this.is_calc_dyeing_net = is_calc_dyeing_net;
      this.is_stock = is_stock;
      this.creator_id = creator_id;
      this.ip_address = ip_address;
    }
  }
  
  module.exports = Bussinessman