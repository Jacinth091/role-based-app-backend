function charactersOnly(str) {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(str.trim());
}

module.exports = { charactersOnly };