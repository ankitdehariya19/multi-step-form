import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Alert from '@mui/material/Alert';
import { DocumentsDetails, DocumentFile } from '@/lib/types';

interface DocumentStepProps {
    data: DocumentsDetails;
    updateData: (fields: Partial<DocumentsDetails>) => void;
    errors: Partial<Record<string, string>>;
}

export default function DocumentStep({ data, updateData, errors }: DocumentStepProps) {
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        if (!event.target.files?.length) return;

        const newFiles: DocumentFile[] = [...data.files];
        const incomingFiles = Array.from(event.target.files);

        if (newFiles.length + incomingFiles.length > 5) {
            setUploadError('Maximum 5 files allowed in total.');
            return;
        }

        for (const file of incomingFiles) {
            if (file.size > 5 * 1024 * 1024) {
                setUploadError(`File ${file.name} exceeds 5MB limit.`);
                continue;
            }
            if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setUploadError(`File ${file.name} has unsupported format.`);
                continue;
            }


            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });

            newFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                base64: base64,
            });
        }

        updateData({ files: newFiles });
    };

    const removeFile = (index: number) => {
        const newFiles = [...data.files];
        newFiles.splice(index, 1);
        updateData({ files: newFiles });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
                Supporting Documents
            </Typography>

            <Typography variant="body2" color="text.secondary">
                Upload up to 5 files (PDF, JPG, PNG). Max 5MB each.
            </Typography>

            <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ width: 'fit-content' }}
            >
                Upload Files
                <input
                    type="file"
                    hidden
                    multiple
                    accept=".pdf, .jpg, .jpeg, .png"
                    onChange={handleFileChange}
                />
            </Button>


            {errors.files && (
                <Alert severity="error">{errors.files}</Alert>
            )}


            {uploadError && (
                <Alert severity="warning" onClose={() => setUploadError(null)}>
                    {uploadError}
                </Alert>
            )}

            {data.files.length === 0 ? (
                <Box sx={{ p: 4, border: '1px dashed grey', borderRadius: 1, textAlign: 'center', color: 'text.secondary' }}>
                    No files uploaded yet.
                </Box>
            ) : (
                <List dense>
                    {data.files.map((file, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => removeFile(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                            sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, border: '1px solid #e0e0e0' }}
                        >
                            <ListItemText
                                primary={file.name}
                                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            />
                            {file.type.startsWith('image/') && (
                                <Box
                                    component="img"
                                    sx={{ height: 40, width: 40, borderRadius: 1, objectFit: 'cover', mr: 2 }}
                                    src={file.base64}
                                    alt={file.name}
                                />
                            )}
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}
