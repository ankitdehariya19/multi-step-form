import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GrievanceDetails, GrievanceCategory, FormErrors } from '@/lib/types';

interface GrievanceStepProps {
  data: GrievanceDetails;
  updateData: (fields: Partial<GrievanceDetails>) => void;
  errors: FormErrors;
}

const categories: GrievanceCategory[] = [
  'Service Issue',
  'Billing',
  'Technical Support',
  'Refund',
  'Other',
];

export default function GrievanceStep({ data, updateData, errors }: GrievanceStepProps) {
  const handleChange =
    (field: keyof GrievanceDetails) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateData({ [field]: e.target.value });
      };

  return (
    <Box
      component="form"
      noValidate
      autoComplete="off"
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <Typography variant="h6" gutterBottom>
        Grievance Details
      </Typography>

      <TextField
        select
        required
        id="category"
        label="Category"
        value={data.category || ''}
        onChange={handleChange('category')}
        error={!!errors.category}
        helperText={errors.category}
        fullWidth
      >
        {categories.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        required
        id="subject"
        label="Subject"
        value={data.subject}
        onChange={handleChange('subject')}
        error={!!errors.subject}
        helperText={errors.subject}
        fullWidth
      />

      <TextField
        required
        id="incidentDate"
        label="Date of Incident"
        type="date"
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: new Date().toISOString().split('T')[0] }}
        value={data.incidentDate}
        onChange={handleChange('incidentDate')}
        error={!!errors.incidentDate}
        helperText={errors.incidentDate || 'Cannot be in the future'}
        fullWidth
      />

      <TextField
        required
        id="description"
        label="Description"
        value={data.description}
        onChange={handleChange('description')}
        error={!!errors.description}
        helperText={errors.description || 'Minimum 100 characters'}
        multiline
        minRows={4}
        fullWidth
      />
    </Box>
  );
}
