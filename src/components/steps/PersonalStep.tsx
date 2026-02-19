import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PersonalDetails, FormErrors } from '@/lib/types';

interface PersonalStepProps {
  data: PersonalDetails;
  updateData: (fields: Partial<PersonalDetails>) => void;
  errors: FormErrors;
}

export default function PersonalStep({ data, updateData, errors }: PersonalStepProps) {
  const handleChange =
    (field: keyof PersonalDetails) =>
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
        Personal Information
      </Typography>

      <TextField
        required
        id="fullName"
        label="Full Name"
        value={data.fullName}
        onChange={handleChange('fullName')}
        error={!!errors.fullName}
        helperText={errors.fullName}
        fullWidth
      />

      <TextField
        required
        id="email"
        label="Email Address"
        type="email"
        value={data.email}
        onChange={handleChange('email')}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
      />

      <TextField
        id="phone"
        label="Phone Number (Optional)"
        value={data.phone || ''}
        onChange={handleChange('phone')}
        error={!!errors.phone}
        helperText={errors.phone || 'Format: 10 digits starting with 6-9'}
        fullWidth
      />

      <TextField
        required
        id="address"
        label="Address"
        value={data.address}
        onChange={handleChange('address')}
        error={!!errors.address}
        helperText={errors.address}
        multiline
        rows={3}
        fullWidth
      />
    </Box>
  );
}
