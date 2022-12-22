export const userConfigValidationSchema = {
    id: 'userConfig',
    type: 'object',

    properties: {
        url: {
            type: 'string',
        },

        publicContentUrl: {
            type: 'string',
        },

        publicDir: {
            type: 'string',
        },

        resize: {
            type: 'boolean',
        },

        defaultViewport: {
            $ref: 'breakPoint',
        },

        breakPoints: {
            type: 'array',

            items: {
                $ref: 'breakPoint',
            }
        },

        resizeThreshold: {
            type: 'number',
        },

        breakpointSwitchDelay: {
            type: 'number',
        },

        convert: {
            type: 'boolean',
        },

        imgFormat: {
            type: 'string',
            
        },

        detectNoAltAttr: {
            type: 'boolean',
        },

        detectNoSrcSetAttr: {
            type: 'boolean',
        },

        detectNoSrcAttr: {
            type: 'boolean',
        },

        detectNoSizeAttr: {
            type: 'boolean',
        },

        detectTypeMismatch: {
            type: 'boolean',
        },

        log: {
            type: 'boolean',
        },

        logSkipped: {
            type: 'boolean',
        },

        logImgConvert: {
            type: 'boolean',
        },

        logResizes: {
            type: 'boolean',
        },
    },

    required: ['url'],
};
