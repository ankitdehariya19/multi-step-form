'use server';

import { FormData } from '@/lib/types';

export async function submitGrievance(data: FormData) {

    await new Promise((resolve) => setTimeout(resolve, 1500));


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
    console.log('Documents:', data.files.map(f => `${f.name} (${f.size} bytes)`));
    console.log('-----------------------------------');

    return {
        success: true,
        message: 'Grievance submitted successfully! Reference ID: ' + Math.random().toString(36).substring(7).toUpperCase(),
    };
}
