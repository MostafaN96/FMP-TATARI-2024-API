const joi = require("joi")
const patterns = require("./patterns")
const joiEmail = joi.string().not().empty().email().min(5).max(50).pattern(patterns.email).required()
const joiName = joi.string().not().empty().trim().normalize().min(3).max(45).pattern(patterns.name).required()
const joiPhone = joi.number().integer().required()
const joiId = joi.number().integer().required()
const joiText = (min, max) => joi.alternatives().try(
    joi.number().required(),
    joi.string().not().empty().trim().normalize().min(min).max(max).pattern(patterns.text).required()
)
const joiHtmlText = (min, max) => joi.string().not().empty().trim().normalize().min(min).max(max).required()
const joiNotRequiredText = (min, max) => joi.alternatives().try(
    joi.number().allow(null),
    joi.string().allow('').allow(null).not().empty().trim().normalize().min(min).max(max).pattern(patterns.text).not()
)
const joiBoolean =  joi.boolean().allow(0,1,'0','1',true,false).not().empty()
const joiNumber = (min, max) => joi.alternatives().try(
    joi.number().required(),
    joi.string().not().empty().trim().normalize().min(min).max(max).pattern(patterns.number).required()
)
const joiNotRequiredNumber = (min, max) => joi.alternatives().try(
    joi.number().allow(null),
    joi.string().allow('').allow(null).not().empty().trim().normalize().min(min).max(max).pattern(patterns.emptyNumber)
)
const joiNumberStartByZero = (min, max) => joi.string().not().empty().trim().normalize().min(min).max(max).pattern(patterns.numberStartByZero).required()
const joiNumberAny = joi.number().integer().required()


module.exports = {
    joiEmail,
    joiName,
    joiPhone,
    joiId,
    joiHtmlText,
    joiNotRequiredText,
    joiBoolean,
    joiText,
    joiNumber,
    joiNotRequiredNumber,
    joiNumberStartByZero,
    joiNumberAny
}