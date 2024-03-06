const text = /^[a-zA-Z0-9\ \:\%\|\/\-\_\,\&\$\@\.\(\)\<\>\u0600-\u06FF-/]{1,120}$/
const htmlText = /^[a-zA-Z0-9\ \:\%\|\/\-\_\,\&\$\@\.\(\)\<\>\\\'\"]{3,10000}$/
const phone = /^[1-9]{8,11}$/
const name = /^[a-zA-Z\ \-\%]{1,20}$/
const email = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]{1,40}(?:\.[a-zA-Z0-9-]+){1,3}$/
const number = /^[0-9]+([.,][0-9]+)?$/
const emptyNumber = /^[0-9]([0-9.]{0,25})?$/
const numberStartByZero = /^[0-9]([0-9.]{1,25})?$/

module.exports = {
    text,
    phone,
    name,
    email,
    htmlText,
    number,
    emptyNumber,
    numberStartByZero,
}