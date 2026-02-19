'use client';

import * as React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

import AppStepper from '@/components/ui/AppStepper';
import PersonalStep from '@/components/steps/PersonalStep';
import GrievanceStep from '@/components/steps/GrievanceStep';
import DocumentStep from '@/components/steps/DocumentStep';
import ReviewStep from '@/components/steps/ReviewStep';

import { PersonalDetails, GrievanceDetails, DocumentsDetails, FormData, FormState } from '@/lib/types';
import { personalSchema, grievanceSchema, documentsSchema, reviewSchema } from '@/lib/schemas';
import { submitGrievance } from './actions';
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
    const [currentStep, setCurrentStep] = React.useState(0);
    const [formData, setFormData] = React.useState<FormData>(initialData);
    const [errors, setErrors] = React.useState<Partial<Record<keyof FormData | string, string>>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [draftDialogOpen, setDraftDialogOpen] = React.useState(false);
    const [draftData, setDraftData] = React.useState<FormState | null>(null);


    React.useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                const isSavedEmpty = parsed.currentStep === 0 &&
                    JSON.stringify(parsed.data) === JSON.stringify(initialData);

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
        const timer = setInterval(() => {
            if (currentStep < 3 && !showSuccess) {
                saveDraft(true);
            }
        }, 30000);
        return () => clearInterval(timer);
    }, [formData, currentStep, showSuccess]);

    const saveDraft = (silent = false) => {

        if (currentStep === 0 && JSON.stringify(formData) === JSON.stringify(initialData)) {
            localStorage.removeItem(STORAGE_KEY);
            if (!silent) {

                alert('Draft saved!');
            }
            return;
        }

        const state: FormState = {
            currentStep,
            data: formData,
            isLoaded: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        if (!silent) {

            alert('Draft saved!');
        }
    };

    const handleRestoreDraft = () => {
        if (draftData) {
            setFormData(draftData.data);
            setCurrentStep(draftData.currentStep);
        }
        setDraftDialogOpen(false);
    };

    const clearDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

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
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const updateFormData = (fields: Partial<FormData>) => {
        setFormData((prev) => ({ ...prev, ...fields }));

        const newErrors = { ...errors };
        Object.keys(fields).forEach((key) => {
            delete newErrors[key];
        });
        setErrors(newErrors);
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setIsSubmitting(true);
        try {
            const result = await submitGrievance(formData);
            if (result.success) {
                setShowSuccess(true);
                clearDraft();
                setFormData(initialData);
                setCurrentStep(0);
            }
        } catch (error) {
            console.error(error);
            alert('Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <PersonalStep data={formData} updateData={updateFormData} errors={errors as any} />;
            case 1:
                return <GrievanceStep data={formData} updateData={updateFormData} errors={errors as any} />;
            case 2:
                return <DocumentStep data={formData} updateData={updateFormData} errors={errors} />;
            case 3:
                return (
                    <ReviewStep
                        data={formData}
                        updateData={updateFormData}
                        goToStep={setCurrentStep}
                        errors={errors}
                    />
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
                Grievance Submission Portal
            </Typography>

            <AppStepper activeStep={currentStep} />

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
                {getStepContent(currentStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        disabled={currentStep === 0 || isSubmitting}
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    <Box>
                        {currentStep < 3 && (
                            <Button
                                color="inherit"
                                onClick={() => saveDraft(false)}
                                sx={{ mr: 1, display: { xs: 'none', sm: 'inline-flex' } }}
                            >
                                Save Draft
                            </Button>
                        )}

                        {currentStep === 3 ? (
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <CircularProgress size={24} /> : 'Submit Grievance'}
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
                    <Button onClick={() => { clearDraft(); setDraftDialogOpen(false); }}>No, Start New</Button>
                    <Button onClick={handleRestoreDraft} autoFocus>
                        Yes, Restore
                    </Button>
                </DialogActions>
            </Dialog>


            <Snackbar open={showSuccess} autoHideDuration={6000} onClose={() => setShowSuccess(false)}>
                <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Grievance submitted successfully!
                </Alert>
            </Snackbar>
        </Container>
    );
}
