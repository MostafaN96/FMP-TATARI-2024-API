class WaReturnRequisitionDetails {
    constructor(date, note, price, quantity, document, statement, personid, ipaddress) {
      this.date = date;
      this.note = note;
      this.price = price;
      this.quantity = quantity;
      this.document = document;
      this.statement = statement;
      this.personid = personid;
      this.ipaddress = ipaddress;
    }
  }
  
  module.exports = WaReturnRequisitionDetails