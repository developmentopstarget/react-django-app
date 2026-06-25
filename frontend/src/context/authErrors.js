const FIELD_LABELS = {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    non_field_errors: '',
    detail: '',
};

function formatFieldName(fieldName) {
    if (FIELD_LABELS[fieldName] !== undefined) {
        return FIELD_LABELS[fieldName];
    }

    return fieldName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeMessages(value) {
    if (!value) {
        return [];
    }

    if (typeof value === 'string') {
        return [value];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeMessages(item));
    }

    if (typeof value === 'object') {
        return Object.entries(value).flatMap(([key, nestedValue]) => {
            const messages = normalizeMessages(nestedValue);
            const label = formatFieldName(key);

            return messages.map((message) =>
                label ? `${label}: ${message}` : message
            );
        });
    }

    return [String(value)];
}

export function parseAuthErrors(data, fallbackMessage = 'Something went wrong. Please try again.') {
    if (!data) {
        return [fallbackMessage];
    }

    if (typeof data === 'string' || Array.isArray(data)) {
        const messages = normalizeMessages(data);
        return messages.length > 0 ? messages : [fallbackMessage];
    }

    if (typeof data === 'object') {
        const messages = Object.entries(data).flatMap(([key, value]) => {
            const label = formatFieldName(key);
            const fieldMessages = normalizeMessages(value);

            return fieldMessages.map((message) =>
                label ? `${label}: ${message}` : message
            );
        });

        return messages.length > 0 ? messages : [fallbackMessage];
    }

    return [fallbackMessage];
}
