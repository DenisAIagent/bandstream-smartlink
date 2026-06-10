import { z } from "zod";

export const bandSchema = z.object({
    name: z.string().min(2, { message: 'Name is required and must be at least 2 characters' }).max(100, { message: 'Name must be less than 100 characters' }),
    domainname: z.string()
        .min(1, { message: 'Shortname is required' })
        .max(100, { message: 'Shortname must be less than 100 characters' })
        .regex(/^[a-z0-9]+$/, { message: 'Shortname can only contain lowercase letters and numbers' }),
    album: z.string().min(1, { message: 'Album is required' }).max(100, { message: 'Album must be less than 100 characters' }),
    trackingGTM: z.string()
        .optional()
        .nullable()
        .refine(
            (value) => !value || /^GTM-[A-Z0-9]{1,7}$/.test(value),
            { message: 'Invalid GTM ID format (e.g. GTM-XXXXXXX)' }
        ),
    trackingGTAG: z.string()
        .optional()
        .nullable()
        .refine(
            (value) => !value || /^G-[A-Z0-9]{10}$/.test(value),
            { message: 'Invalid GA4 Measurement ID format (e.g. G-XXXXXXXXXX)' }
        ),
    trackingMeta: z.string()
        .optional()
        .nullable()
        .refine(
            (value) => !value || /^\d{15,16}$/.test(value),
            { message: 'Invalid Meta Pixel ID format (15-16 digits)' }
        ),
    coverImage: z.instanceof(File),
    musicSample: z.instanceof(File).nullable(),
});