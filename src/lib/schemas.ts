import { z } from 'zod';

export const phoneRegex = /^[6-9]\d{9}$/;

export const personalSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || phoneRegex.test(val), {
            message: 'Invalid Indian phone number',
        }),
    address: z.string().min(1, 'Address is required'),
});

export const grievanceSchema = z.object({
    category: z.enum(['Service Issue', 'Billing', 'Technical Support', 'Refund', 'Other'], {
        errorMap: () => ({ message: 'Please select a category' }),
    }),
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().min(100, 'Description must be at least 100 characters'),
    incidentDate: z.string().refine(
        (date) => {
            const d = new Date(date);
            const now = new Date();
            return d <= now;
        },
        {
            message: 'Date cannot be in the future',
        }
    ),
});

export const documentsSchema = z.object({
    files: z
        .array(
            z.object({
                name: z.string(),
                size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
                type: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
                base64: z.string(),
            })
        )
        .min(1, 'At least one document is required')
        .max(5, 'Maximum 5 files allowed'),
});

export const reviewSchema = z.object({
    agreedToTerms: z.literal(true, {
        errorMap: () => ({ message: 'You must confirm the information is correct' }),
    }),
});

export const masterSchema = personalSchema
    .merge(grievanceSchema)
    .merge(documentsSchema)
    .merge(reviewSchema);
