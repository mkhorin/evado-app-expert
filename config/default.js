'use strict';

module.exports = {

    title: 'Expert',

    components: {
        'db': {
            settings: {
                'database': process.env.MONGO_NAME || 'evado-expert',
            }
        },
        'cookie': {
            secret: 'expert.evado'
        },
        'session': {
            secret: 'expert.evado'
        },
        'i18n': {
            // language: 'ru'
        },
        'router': {
            defaultModule: 'front'
        },
        'fileStorage': {
        }
    },
    metaModels: {
        'base': {
            Class: require('evado-meta-base/base/BaseMeta'),
            DataHistoryModel: {
                Class: require('evado-module-office/model/DataHistory')
            },
            UserModel: {
                Class: require('evado-module-office/model/User')
            }
        },
        'navigation': {
            Class: require('evado-meta-navigation/base/NavMeta')
        }
    },
    modules: {
        'api': {
            config: {
                modules: {
                    'base': {
                        Class: require('../module/api/base/Module')
                    },
                    'navigation': {
                        Class: require('evado-api-navigation/Module')
                    }
                }
            }
        },
        'studio': {
            Class: require('evado-module-studio/Module')
        },
        'office': {
            Class: require('evado-module-office/Module')
        },
        'account': {
            Class: require('evado-module-account/Module')
        },
        'admin': {
            Class: require('evado-module-admin/Module')
        },
        'front': {
            Class: require('../module/front/Module')
        }
    },
    users: require('./default-users'),
    security: require('./default-security'),
    tasks: require('./default-tasks'),
    utilities: require('./default-utilities'),
    params: {
        'enablePasswordReset': false,
        'enableSignUp': false
    },
    widgets: {
        'commonMenu': {
        }
    }
};