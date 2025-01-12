const joi = require("joi");
const validations = require("../../helpers/validations");
exports.isValid = (wbManufacturingRequisition) => {
    const wbManufacturingRequisitionSchema = joi.object({
        industryId: validations.joiText(15, 30),
        ordersRequisitionsId: validations.joiText(15, 30),
        yarnOrderId: validations.joiText(15, 30),
        consigmentManufacturingId: validations.joiNotRequiredText(0, 30),
        circularKnittingMachineId: validations.joiNotRequiredText(0, 100),
        isNewConsigment: validations.joiBoolean,
        warehouseId: validations.joiText(15, 30),
        fabricId: validations.joiText(15, 30),
        fabricCode: validations.joiText(3, 50),
        fabricPrice:validations.joiNumber(1, 60),
        fabricPriceDollar:validations.joiNumber(1, 60),
        fabricQuantity:validations.joiText(1, 60),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        manufacturingFee:validations.joiText(1, 60),
        manufacturingFeeDollar:validations.joiText(1, 60),
        consigmentNumber:validations.joiNotRequiredText(0, 60),
        numberFabricPieces:validations.joiText(1, 60),
        document: validations.joiNotRequiredNumber(1, 50),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items({
            waYarnOrderRequisitionDetailsId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnId: validations.joiText(15, 30),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            ratio: validations.joiNumberStartByZero(1, 60),
            wastRatio: validations.joiNumberStartByZero(1, 60),
            quantity:validations.joiNumber(1, 60),
            quantityWithWaste:validations.joiNumber(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
        })
    });
    const joiErrors = wbManufacturingRequisitionSchema.validate(wbManufacturingRequisition);

    try {
        if (joiErrors.error) {
            console.log(joiErrors.error.details);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.log(joiErrors.error.details);
        return false;
    }
};

exports.isValidOrder = (wbManufacturingRequisition) => {
    const wbManufacturingRequisitionSchema = joi.object({
        industryId: validations.joiText(15, 30),
        ordersRequisitionsId: validations.joiText(15, 30),
        yarnOrderId: validations.joiText(15, 30),
        sellerId: validations.joiText(15, 30),
        consigmentManufacturingId: validations.joiNotRequiredText(0, 30),
        circularKnittingMachineId: validations.joiNotRequiredText(0, 100),
        isNewConsigment: validations.joiBoolean,
        warehouseId: validations.joiText(15, 30),
        fabricId: validations.joiText(15, 30),
        fabricCode: validations.joiText(3, 50),
        fabricPrice:validations.joiNumber(1, 60),
        fabricPriceDollar:validations.joiNumber(1, 60),
        fabricQuantity:validations.joiText(1, 60),
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        manufacturingFee:validations.joiText(1, 60),
        manufacturingFeeDollar:validations.joiText(1, 60),
        consigmentNumber:validations.joiNotRequiredText(0, 60),
        numberFabricPieces:validations.joiText(1, 60),
        document: validations.joiNotRequiredNumber(1, 50),
        statement: validations.joiNotRequiredText(0, 10000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
        items:joi.array().items({
            waYarnOrderRequisitionDetailsId: validations.joiText(15, 30),
            yarnId: validations.joiText(15, 30),
            yarnLotId: validations.joiText(15, 30),
            consigmentYarnId: validations.joiText(15, 30),
            price: validations.joiNumber(1, 60),
            priceDollar: validations.joiNotRequiredText(0, 50),
            ratio: validations.joiNumberStartByZero(1, 60),
            wastRatio: validations.joiNumberStartByZero(1, 60),
            quantity:validations.joiNumber(1, 60),
            quantityWithWaste:validations.joiNumber(1, 60),
            statement: validations.joiNotRequiredText(0, 10000),
        }),
        itemsOrder:joi.array().items({
            manufacturingOrderRequisitionId: validations.joiText(15, 30),
            manufacturingOrderRequisitionDetailsId: validations.joiText(15, 30),
            neededQuantity:validations.joiNumber(1, 60),
            currentQuantity:validations.joiNumber(1, 60),
            quantity:validations.joiNumber(1, 60),
        })
    });
    const joiErrors = wbManufacturingRequisitionSchema.validate(wbManufacturingRequisition);

    try {
        if (joiErrors.error) {
            console.log(joiErrors.error.details);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.log(joiErrors.error.details);
        return false;
    }
};

exports.isValidUpdate = (wbManufacturing) => {
    const wbManufacturingSchema = joi.object({
        date: validations.joiText(5, 50),
        note: validations.joiNotRequiredText(0, 100000),
        status: validations.joiNotRequiredText(0, 1000),
        personid: validations.joiText(3, 50),
        ipaddress: validations.joiText(3, 50),
    });
    const joiErrors = wbManufacturingSchema.validate(wbManufacturing);

    try {
        if (joiErrors.error) {
            console.log(joiErrors.error.details);
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.log(joiErrors.error.details);
        return false;
    }
};