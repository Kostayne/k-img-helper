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

        defaultBreakPoint: {
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

        resizeDelay: {
            type: 'number',
        },

        convert: {
            type: 'boolean',
        },

        imgFormat: {
            type: 'string',
            
        },

        detectAltAttr: {
            type: 'boolean',
        },

        detectSrcSetAttr: {
            type: 'boolean',
        },

        detectSrcAttr: {
            type: 'boolean',
        },

        detectSizeAttr: {
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
