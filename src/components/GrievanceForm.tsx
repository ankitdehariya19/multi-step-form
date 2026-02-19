'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { useRouter, useSearchParams } from 'next/navigation';

import AppStepper from '@/components/ui/AppStepper';
import PersonalStep from '@/components/steps/PersonalStep';
import GrievanceStep from '@/components/steps/GrievanceStep';
import DocumentStep from '@/components/steps/DocumentStep';
import ReviewStep from '@/components/steps/ReviewStep';

import { FormData, FormState, FormErrors } from '@/lib/types';
import { personalSchema, grievanceSchema, documentsSchema, reviewSchema } from '@/lib/schemas';
import { submitGrievance } from '@/app/actions/grievance';
import { ZodError } from 'zod';

const STORAGE_KEY = 'grievanceDraft';

const initialData: FormData = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    category: 'Service Issue',
    subject: '',
    description: '',
    incidentDate: '',
    files: [],
    agreedToTerms: false,
};

export default function GrievanceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();


    const initialStep = Number(searchParams.get('step')) || 0;
    const [currentStep, setCurrentStep] = React.useState(initialStep);


    React.useEffect(() => {
        const step = Number(searchParams.get('step')) || 0;
        setCurrentStep(step);
    }, [searchParams]);

    const [formData, setFormData] = React.useState<FormData>(initialData);
    const [errors, setErrors] = React.useState<FormErrors>({});
    const [isPending, startTransition] = React.useTransition();
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');


    const [draftDialogOpen, setDraftDialogOpen] = React.useState(false);
    const [draftData, setDraftData] = React.useState<FormState | null>(null);
    const [isLoaded, setIsLoaded] = React.useState(false);


    React.useEffect(() => {
        setIsLoaded(true);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                const isSavedEmpty =
                    parsed.currentStep === 0 && JSON.stringify(parsed.data) === JSON.stringify(initialData);

                if (!isSavedEmpty) {
                    setDraftData(parsed);
                    setDraftDialogOpen(true);
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (e) {
                console.error('Failed to parse draft', e);
            }
        }
    }, []);


    React.useEffect(() => {
        if (!isLoaded) return;

        const saveTimer = setTimeout(() => {
            if (currentStep < 3 && !showSuccess) {
                saveDraft(true);
            }
        }, 1000);

        return () => clearTimeout(saveTimer);
    }, [formData, currentStep, showSuccess, isLoaded]);

    const saveDraft = (silent = false) => {
        if (currentStep === 0 && JSON.stringify(formData) === JSON.stringify(initialData)) {
            return;
        }

        const state: FormState = {
            currentStep,
            data: formData,
            isLoaded: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if (!silent) {
            // Could show a small toast here
        }
    };

    const handleRestoreDraft = () => {
        if (draftData) {
            setFormData(draftData.data);
            setCurrentStep(draftData.currentStep);
            router.replace(`?step=${draftData.currentStep}`);
        }
        setDraftDialogOpen(false);
    };

    const clearDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleStartNew = () => {
        clearDraft();
        setDraftDialogOpen(false);

        setFormData(initialData);
        setCurrentStep(0);
        router.replace('?step=0');
    }

    const validateStep = (step: number) => {
        try {
            if (step === 0) personalSchema.parse(formData);
            if (step === 1) grievanceSchema.parse(formData);
            if (step === 2) documentsSchema.parse(formData);
            if (step === 3) reviewSchema.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof ZodError) {
                const newErrors: FormErrors = {};
                error.errors.forEach((err) => {
                    if (err.path && err.path.length > 0) {
                        const field = err.path[0] as keyof FormData;
                        newErrors[field] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            router.push(`?step=${nextStep}`);
        }
    };

    const handleBack = () => {
        const prevStep = currentStep - 1;
        if (prevStep >= 0) {
            setCurrentStep(prevStep);
            router.push(`?step=${prevStep}`);
        }
    };

    const handleJumpToStep = (step: number) => {
        if (step < currentStep) {
            setCurrentStep(step);
            router.push(`?step=${step}`);
        } else {
            setCurrentStep(step);
            router.push(`?step=${step}`);
        }
    };

    const updateFormData = (fields: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...fields }));
        const newErrors = { ...errors };
        Object.keys(fields).forEach((key) => {
            delete newErrors[key as keyof FormData];
        });
        setErrors(newErrors);
    };

    const handleSubmit = () => {
        if (!validateStep(3)) return;

        startTransition(async () => {
            try {
                const result = await submitGrievance(formData);
                if (result.success) {
                    setSuccessMessage(result.message || 'Grievance submitted successfully!');
                    setShowSuccess(true);
                    clearDraft();
                    setFormData(initialData);
                    setCurrentStep(0);
                    router.replace('?step=0');
                } else {
                    alert(result.message || 'Submission failed');
                    if (result.errors) {
                        const newErrors: FormErrors = {};
                        Object.entries(result.errors).forEach(([key, messages]) => {
                            if (messages && messages.length > 0) {
                                newErrors[key as keyof FormData] = messages[0];
                            }
                        });
                        setErrors(newErrors);
                    }
                }
            } catch (error) {
                console.error(error);
                alert('Submission failed. Please try again.');
            }
        });
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <PersonalStep data={formData} updateData={updateFormData} errors={errors} />;
            case 1:
                return <GrievanceStep data={formData} updateData={updateFormData} errors={errors} />;
            case 2:
                return <DocumentStep data={formData} updateData={updateFormData} errors={errors} />;
            case 3:
                return (
                    <ReviewStep
                        data={formData}
                        updateData={updateFormData}
                        goToStep={handleJumpToStep}
                        errors={errors}
                    />
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <AppStepper activeStep={currentStep} />

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, mt: 3 }}>
                {getStepContent(currentStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button disabled={currentStep === 0 || isPending} onClick={handleBack}>
                        Back
                    </Button>

                    <Box>
                        {currentStep < 3 && (
                            <Button
                                color="inherit"
                                onClick={() => saveDraft(false)}
                            >
                                Save Draft
                            </Button>
                        )}

                        {currentStep === 3 ? (
                            <Button variant="contained" onClick={handleSubmit} disabled={isPending}>
                                {isPending ? <CircularProgress size={24} color="inherit" /> : 'Submit Grievance'}
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleNext}>
                                Next
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

            <Dialog open={draftDialogOpen} onClose={() => setDraftDialogOpen(false)}>
                <DialogTitle>Restore Draft?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        We found a previously saved draft of your grievance. Would you like to restore it?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStartNew}>
                        No, Start New
                    </Button>
                    <Button onClick={handleRestoreDraft} autoFocus>
                        Yes, Restore
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={showSuccess} autoHideDuration={6000} onClose={() => setShowSuccess(false)}>
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
