import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { FormData } from '@/lib/types';

interface ReviewStepProps {
    data: FormData;
    updateData: (fields: Partial<FormData>) => void;
    goToStep: (step: number) => void;
    errors: Partial<Record<string, string>>;
}

export default function ReviewStep({ data, updateData, goToStep, errors }: ReviewStepProps) {

    const SectionHeader = ({ title, step }: { title: string, step: number }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                {title}
            </Typography>
            <Button size="small" onClick={() => goToStep(step)}>
                Edit
            </Button>
        </Box>
    );

    const Row = ({ label, value }: { label: string, value: string | undefined }) => (
        <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
                <Typography variant="body1">
                    {value || '-'}
                </Typography>
            </Grid>
        </Grid>
    );

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Review & Submit
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Please review your information before submitting.
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <SectionHeader title="Personal Information" step={0} />
                <Divider sx={{ mb: 2 }} />
                <Row label="Full Name" value={data.fullName} />
                <Row label="Email" value={data.email} />
                <Row label="Phone" value={data.phone} />
                <Row label="Address" value={data.address} />

                <SectionHeader title="Grievance Details" step={1} />
                <Divider sx={{ mb: 2 }} />
                <Row label="Category" value={data.category} />
                <Row label="Subject" value={data.subject} />
                <Row label="Date of Incident" value={data.incidentDate} />
                <Row label="Description" value={data.description} />

                <SectionHeader title="Documents" step={2} />
                <Divider sx={{ mb: 2 }} />
                {data.files.length > 0 ? (
                    data.files.map((f, i) => (
                        <Row key={i} label={`File ${i + 1}`} value={f.name} />
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary">No files attached.</Typography>
                )}
            </Paper>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={data.agreedToTerms}
                        onChange={(e) => updateData({ agreedToTerms: e.target.checked })}
                    />
                }
                label="I confirm that all the information provided above is correct."
            />
            {errors.agreedToTerms && (
                <Typography variant="caption" color="error" display="block">
                    {errors.agreedToTerms}
                </Typography>
            )}
        </Box>
    );
}
