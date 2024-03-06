// Services
const logsService = require("../../services/config/logs");

exports.log = async (request, response, next) => {
    console.log("log");
    // logging
    const { url, body, method } = request

    const { personid: creatorId, ipaddress: ipAddress } = body

    // call service
    logsService.log({
        url,
        body,
        method,
        creatorId,
        ipAddress
    });


    next()
};