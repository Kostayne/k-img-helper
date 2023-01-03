export function parseCliOptions(options: Record<string, string | number | boolean>) {
    for (const prop of Object.keys(options)) {
        const val = options[prop];

        // parse numbers
        const num = parseInt(val as string);

        if (!isNaN(num)) {
            options[prop] = num;
        }

        // parse boolean
        if (val === 'false') {
            options[prop] = false;
        }

        if (val === 'true') {
            options[prop] = true;
        }
    }

    return options;
}
