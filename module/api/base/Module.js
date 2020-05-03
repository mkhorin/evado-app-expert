'use strict';

const Base = require('evado-api-base/Module');

module.exports = class BaseApiModule extends Base {

    constructor (config) {
        super({
            original: Base,
            ...config
        });
    }
};
module.exports.init(module);