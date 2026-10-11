import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { addReviewItem } from '../data/reviewStore'

import {
    checkConsistency,
  type ConflictResult,
} from '../services/consistencyChecker'

export default function CheckPage() {
  const [title, setTitle] = useState('')
  const [requirement, setRequirement] = useState('')
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('')
  const [results, setResults] = useState<ConflictResult[] | null>(null)

  const handleCheck = () => {
    const conflicts = checkConsistency(title, requirement)
    setResults(conflicts)
  }

  const handleSendToReview = (result: ConflictResult) => {
  addReviewItem({
    id: crypto.randomUUID(),
    requirementTitle: title,
    requirement,
    conflict: result,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  })
}

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
      >
        Check product consistency
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1, mb: 4 }}
      >
        Analyze a new requirement against existing product knowledge.
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
          }}
        >
          New requirement
        </Typography>

        <TextField
          label="Title"
          placeholder="e.g. Allow administrators to change login email"
          fullWidth
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Requirement"
          placeholder="Describe the expected product behavior..."
          fullWidth
          multiline
          rows={4}
          value={requirement}
          onChange={(event) => setRequirement(event.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Acceptance criteria"
          placeholder="Add the main acceptance criteria..."
          fullWidth
          multiline
          rows={3}
          value={acceptanceCriteria}
          onChange={(event) =>
            setAcceptanceCriteria(event.target.value)
          }
        />

        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<FactCheckOutlinedIcon />}
            onClick={handleCheck}
            disabled={!title || !requirement}
          >
            Check consistency
          </Button>
        </Box>
      </Paper>

      {results !== null && (
        <Box sx={{ mt: 4 }}>
          {results.length === 0 ? (
            <Alert severity="success">
              No consistency issues detected.
            </Alert>
          ) : (
            <>
              <Alert
                severity="warning"
                icon={<WarningAmberOutlinedIcon />}
                sx={{ mb: 3 }}
              >
                {results.length} potential consistency issue detected.
              </Alert>

              {results.map((result, index) => (
                <Paper
                  key={
                    result.relatedObject?.id ??
                    result.relatedDecision?.id ??
                    `conflict-${index}`
                  }
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mb: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label={result.type}
                      color="warning"
                      size="small"
                    />

                    <Chip
                      label={`${result.severity} severity`}
                      size="small"
                    />

                    <Chip
                      label={`${Math.round(
                        result.confidence * 100,
                      )}% confidence`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
  variant="h6"
  sx={{ fontWeight: 600 }}
>
  {result.sourceType === 'KNOWLEDGE'
    ? `Conflicts with ${result.relatedObject?.id}`
    : 'Conflicts with approved Product Decision'}
</Typography>

<Typography
  color="text.secondary"
  sx={{ mt: 0.5 }}
>
  {result.sourceType === 'KNOWLEDGE'
    ? result.relatedObject?.title
    : result.relatedDecision?.title}
</Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 0.5 }}
                  >
                    Why this matters
                  </Typography>

                  <Typography>
                    {result.reason}
                  </Typography>

                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      bgcolor: '#f7f8fa',
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {result.sourceType === 'KNOWLEDGE'
                        ? 'EXISTING PRODUCT KNOWLEDGE'
                        : 'APPROVED PRODUCT DECISION'}
                    </Typography>

                    <Typography sx={{ mt: 1 }}>
                      {result.sourceType === 'KNOWLEDGE'
                        ? result.relatedObject?.content
                        : result.relatedDecision?.decision}
                    </Typography>

                    {result.sourceType === 'KNOWLEDGE' ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          mt: 2,
                        }}
                      >
                        Source: {result.relatedObject?.source}
                        {' • '}
                        Owner: {result.relatedObject?.owner}
                      </Typography>
                    ) : (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          mt: 2,
                        }}
                      >
                        Version: {result.relatedDecision?.version}
                        {' • '}
                        Approved by: {result.relatedDecision?.approvedBy}
                      </Typography>
                    )}
                  </Box>
                    <Box
                        sx={{
                            mt: 3,
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                        >
                        <Button
                            variant="outlined"
                            onClick={() => handleSendToReview(result)}
                        >
                            Send to review
                        </Button>
                        </Box>


                </Paper>
              ))}
            </>
          )}
        </Box>
      )}
    </Box>
  )
}