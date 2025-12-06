// utils/formData.helper.ts
export function objectToFormData(
    obj: Record<string, unknown>,
    files?: File[],
    formData = new FormData()
): FormData {
    Object.keys(obj).forEach(key => {
        const value = obj[key];

        if (value === null || value === undefined) {
            return; // Skip
        }

        // Jika value adalah array atau object → JSON.stringify
        if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
        } else {
            formData.append(key, String(value));
        }
    });

    // Tambahkan files jika ada
    if (files && files.length > 0) {
        files.forEach((file) => {
            formData.append('files', file);
        });
    }

    return formData;
}