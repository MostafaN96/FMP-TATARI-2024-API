const bcrypt = require("bcrypt")

function checkInt() { //اللى داخل لازم يبقى رقم مش حروف //id هنا بتاكد ان

    return (request, response, next) => {
        const id = +request.params.id

        console.log(`the id is ${id}`)
        if (Number.isFinite(id)) {
            next();
        } else {
            response.status(400).json("id must be integer")
        }
    }
}


function checkMissingData(mandatoryColumns) {

    return (request, response, next) => {
        const payload = request.body

        const payloadKeys = Object.keys(payload)

        const mandatoryColumnsExists = mandatoryColumns.every(mc => payloadKeys.includes(mc))
        console.log(`mandatoryColumnsExists : ${mandatoryColumnsExists}`)
        if (mandatoryColumnsExists) {
            next()
        } else {
            response.status(400).json("missing Data")
        }

    }

}


function checkAuth() {

    return (request, response, next) => {
        // console.log(request.body);
        const jwt = require("jsonwebtoken")
        const authorization = request.headers.authorization
        if (authorization) {
            const token = authorization.split(" ")[1]
            const secret = "q@3z25QWS@!!2"
            jwt.verify(token, secret, {}, (error, decodedToken) => {
                if (error) {
                    response.status(401).json(`authentication error ${error}`)
                } else {
                    request.decoded = decodedToken;
                    next();
                }
            })
        } else {
            response.status(403).json("no token provided")
        }

    }
}

function getEncryptedPassword() {

    return (request, response, next) => {
        const password = request.body.userPassword

        bcrypt.genSalt(10, (error, salt) => {

            bcrypt.hash(password, salt, (error, hash) => {
                request.hashedPassword = hash;
                next();
            })
        })
    }
}

function getEncryptedPasswordDynamic(attrName) {

    return (request, response, next) => {
        const password = request.body[attrName]

        bcrypt.genSalt(10, (error, salt) => {

            bcrypt.hash(password, salt, (error, hash) => {
                request.hashedPassword = hash;
                next();
            })
        })
    }
}


function checkIdentity(identity) {

    return (request, response, next) => {

        if (identity == request.decoded.userType) {
            next();
        } else {
            response.status(401).json("un autorized")
        }

    }
}

function checkBodyErrors() {

    return (request, response, next) => {
        console.log(request.body);
        const {
            body,
            validationResult
        } = require('express-validator');

        // console.log("in errors");
        const errors = validationResult(request);
        if (errors.array()[0] != null) {
            console.log(errors.array());
            response.status(400).json("Bad request")
        } else {
            next()
        }

    }
}





module.exports = {
    checkMissingData,
    checkInt,
    checkAuth,
    getEncryptedPassword,
    getEncryptedPasswordDynamic,
    checkBodyErrors,
    checkIdentity,

}