// Services
const bussinessmanService = require("../../services/general/bussinessman");
const bussinessmanModel = require("../../models/general/bussinessman");
const generalService = require("../../services/general/general");

// Validation
const bussinessmanValidation = require("../../validations/general/bussinessman");

// Util
const constants = require("../../util/constants");


exports.selectSuppliers = async (request, response) => {
  // logging

  // call service
  const results = await bussinessmanService.selectSuppliers();
  response.status(200).json(results);
};

exports.selectSellers = async (request, response) => {
  // logging

  // call service
  const results = await bussinessmanService.selectSellers();
  response.status(200).json(results);
};

exports.selectDyerHasServices = async (request, response) => {
  // logging

  // call service
  const results = await bussinessmanService.selectDyerHasServices();
  response.status(200).json(results);
};

// Wa
exports.selectYarnSuppliersBoughtFromWa = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectSuppliersBoughtFromWa();
  response.status(200).json(results);
};

// WB

exports.selectManufacturer = async (request, response) => {
  // logging

  // call service
  const results = await bussinessmanService.selectManufacturer();
  response.status(200).json(results);
};

exports.selectManufacturerFromWb = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectManufacturerFromWb();
  response.status(200).json(results);
};

exports.selectNotSelectedManufacturerWb = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await bussinessmanService.selectNotSelectedManufacturerWb(id);
  response.status(200).json(results);
};

exports.selectManufacturerManufactured = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectManufacturerManufactured();
  response.status(200).json(results);
};

exports.selectTransportedManufacturersInWb = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectTransportedManufacturersInWb();
  response.status(200).json(results);
};

exports.selectTransportedManufacturersNotSelectedInWb = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await bussinessmanService.selectTransportedManufacturersNotSelectedInWb(id);
  response.status(200).json(results);
};

exports.selectSellerManufacturingOrdered = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectSellerManufacturingOrdered();
  response.status(200).json(results);
};

// WC
exports.selectFabricSuppliersBoughtFromWc = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectSuppliersBoughtFromWc();
  response.status(200).json(results);
};

// WD
exports.selectDyer = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectDyer();
  response.status(200).json(results);
};

exports.selectDyeingFromWd = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectDyeingFromWd();
  response.status(200).json(results);
};

exports.selectDyerDyeing = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectDyerDyeing();
  response.status(200).json(results);
};

exports.selectSellersOrderedFromDyeing = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectSellersOrderedFromDyeing();
  response.status(200).json(results);
};

exports.selectDyerHasForm = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectDyerHasForm();
  response.status(200).json(results);
};


exports.selectNotSelectedDyeingWd = async (request, response) => {
  // logging
  const { id } = request.params;

  // call service
  const results = await bussinessmanService.selectNotSelectedDyeingWd(id);
  response.status(200).json(results);
};

// We
exports.selectFabricSuppliersBoughtFromWe = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectSuppliersBoughtFromWe();
  response.status(200).json(results);
};

exports.selectSellersSellFromWe = async (request, response) => {
  // call service
  const results = await bussinessmanService.selectSellersSellFromWe();
  response.status(200).json(results);
};

exports.select = async (request, response) => {
  // logging

  // call service
  const results = await bussinessmanService.select();
  response.status(200).json(results);
};


exports.selectDeleted = async (request, response) => {
  // logging

  // call service
  const results = await bussinessmanService.selectDeleted();
  response.status(200).json(results);
};

exports.create = async (request, response) => {
  const bodyPalod = request.body;
  // create Model
  const bussinessman = new bussinessmanModel(
    bodyPalod.name, 
    bodyPalod.phone, 
    bodyPalod.address, 
    bodyPalod.isSupplier,
    bodyPalod.isSeller, 
    bodyPalod.isManufacturer, 
    bodyPalod.isDyer, 
    bodyPalod.isCalcDyeingNet,
    bodyPalod.isStock,
    bodyPalod.personid, bodyPalod.ipaddress);

  // Validation
  if (!bussinessmanValidation.isValid(bussinessman)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  //   send data to service
  const results = await bussinessmanService.create(bussinessman);

  if (results === constants.insertError) {
    return response.status(500).json(results);
  } else if (results === constants.duplicatedData) {
    return response.status(200).json(constants.duplicatedData);
  } else {
    return response.status(201).json(constants.insertSuccess);
  }
};


exports.update = async (request, response) => {
  // logging
  const { id } = request.params;
  const bodyPalod = request.body;

  // create Model
  const bussinessman = new bussinessmanModel(
    bodyPalod.name, 
    bodyPalod.phone, 
    bodyPalod.address, 
    bodyPalod.isSupplier,
    bodyPalod.isSeller, 
    bodyPalod.isManufacturer, 
    bodyPalod.isDyer, 
    bodyPalod.isCalcDyeingNet, 
    bodyPalod.isStock,
    bodyPalod.personid, bodyPalod.ipaddress);
  
    // Validation
  if (!bussinessmanValidation.isValid(bussinessman)) {
    // logging
    return response.status(400).json(constants.invalidDataResponse);
  }
  bussinessman.id = id
  const updateResults = await bussinessmanService.update(bussinessman);
  // response
  switch (updateResults) {
    case constants.itemNotFound:
      return response.status(200).json(constants.itemNotFound)
    case constants.duplicatedData:
      return response.status(200).json(constants.duplicatedData)
    case constants.updateError:
      return response.status(500).json(constants.updateError)
      break;
    case constants.updateSuccess:
      return response.status(200).json(constants.updateSuccess)
  }

};



exports.delete = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  const results = await bussinessmanService.dalete(bodyPalod);
  if (results === constants.deleteError) {
    return response.status(500).json(constants.deleteError);
  } else if (results === constants.itemNotFound) {
    return response.status(404).json(constants.itemNotFound);
  } else {
    return response.status(200).json(constants.deleteSuccess);
  }
};

exports.restore = async (request, response) => {
  // logging
  const bodyPalod = request.body;

  // call services
  const results = await bussinessmanService.restore(bodyPalod);
  if (results === constants.restoreError) {
    return response.status(500).json(constants.restoreError);
  } else if (results === constants.itemNotFound) {
    return response.status(404).json(constants.itemNotFound);
  }

  return response.status(200).json(constants.restoreSuccess);
};