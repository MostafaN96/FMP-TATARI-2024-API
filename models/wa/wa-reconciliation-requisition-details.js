class WaReconciliationRequisitionDetails {
    constructor(date, note, price, quantity, document, statement, 
      input_output, personid, ipaddress) {
      this.date = date;
      this.note = note;
      this.price = price;
      this.quantity = quantity;
      this.document = document;
      this.statement = statement;
      this.input_output = input_output;
      this.personid = personid;
      this.ipaddress = ipaddress;
    }
  }
  
  module.exports = WaReconciliationRequisitionDetails