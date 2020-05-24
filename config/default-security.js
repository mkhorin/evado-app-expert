'use strict';

const parent = require('evado/config/default-security');

module.exports = {

    metaPermissions: [{
        description: 'Full access to data',
        type: 'allow',
        roles: ['administrator'],
        actions: ['all'],
        targets: [{type: 'all'}]
    }, {
        type: 'allow',
        roles: ['guest'],
        actions: ['read'],
        targets: [{
            type: 'class',
            class: 'picture'
        }]
    }],

    permissions: {
        ...parent.permissions,

        'moduleAdmin': {
            label: 'Admin module',
            description: 'Access to Admin module'
        },
        'moduleOffice': {
            label: 'Office module',
            description: 'Access to Office module'
        },
        'moduleStudio': {
            label: 'Studio module',
            description: 'Access to Studio module'
        }
    },

    roles: {
        'administrator': {
            label: 'Administrator',
            description: 'Full access to all',
            children: [
                'moduleAdmin',
                'moduleOffice',
                'moduleStudio'
            ]
        },
        'guest': {
            label: 'Guest',
            description: 'Auto-assigned role for unauthenticated users'
        }
    },

    assignments: {
        'Adam': 'administrator'
    },

    rules: {
    }
};