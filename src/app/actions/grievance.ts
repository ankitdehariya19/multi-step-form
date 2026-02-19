'use server';

import { FormData } from '@/lib/types';
import { masterSchema } from '@/lib/schemas';

export type SubmitResult = {
    success: boolean;
    message: string;
    referenceId?: string;
    errors?: Record<string, string[]>;
};

export async function submitGrievance(data: FormData): Promise<SubmitResult> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const validationResult = masterSchema.safeParse(data);

    if (!validationResult.success) {
        return {
            success: false,
            message: 'Validation failed. Please check your inputs.',
            errors: validationResult.error.flatten().fieldErrors,
        };
    }

    try {
        console.log('--- Grievance Submission Received ---');
        console.log('Personal Details:', {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            address: data.address,
        });
        console.log('Grievance:', {
            category: data.category,
            subject: data.subject,
            date: data.incidentDate,
            description: data.description,
        });
        console.log(
            'Documents:',
            data.files.map((f) => `${f.name} (${f.size} bytes)`)
        );
        console.log('-----------------------------------');

        const referenceId = Math.random().toString(36).substring(7).toUpperCase();

        return {
            success: true,
            message: `Grievance submitted successfully!`,
            referenceId,
        };
    } catch (error) {
        console.error('Submission error:', error);
        return {
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
        };
    }
}
