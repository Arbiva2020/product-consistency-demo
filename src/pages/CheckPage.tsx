import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [sentToReview, setSentToReview] = useState<string[]>([])
  const [sendingToReview, setSendingToReview] = useState<string | null>(null)
  const [reviewError, setReviewError] = useState<{
    conflictKey: string
    message: string
  } | null>(null)

  const handleCheck = async () => {
    if (checking || !title.trim() || !requirement.trim()) {
      return
    }

    setChecking(true)
    setCheckError(null)
    setResults(null)
    setSentToReview([])

    try {
      const conflicts = await checkConsistency(title, requirement)
      setResults(conflicts)
    } catch (error) {
      console.error('Consistency check failed:', error)

      setCheckError(
        error instanceof Error
          ? error.message
          : 'Failed to check product consistency.',
      )
    } finally {
      setChecking(false)
    }
  }

  const getConflictKey = (result: ConflictResult, index: number) =>
    `${result.sourceType}-${result.relatedObject?.id ?? result.relatedDecision?.id ?? index}-${result.type}`


  const handleSendToReview = async (
    result: ConflictResult,
    index: number,
  ) => {
    const key = getConflictKey(result, index)
  
    if (
      sentToReview.includes(key) ||
      sendingToReview !== null
    ) {
      return
    }
  
    setSendingToReview(key)
    setReviewError(null)
  
    try {
      await addReviewItem({
        id: crypto.randomUUID(),
        requirementTitle: title,
        requirement,
        conflict: result,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
      })
  
      setSentToReview((previous) => [...previous, key])
    } catch (error) {
      console.error('Failed to send conflict to Review:', error)
  
      setReviewError({
        conflictKey: key,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send the conflict to Review.',
      })

    } finally {
      setSendingToReview(null)
    }
  }
  

  const handleRequirementChange = (value: string) => {
    setRequirement(value)
    setResults(null)
    setCheckError(null)
    setSentToReview([])
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setResults(null)
    setCheckError(null)
    setSentToReview([])
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Check product consistency
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
        Analyze a new requirement against existing product knowledge.
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 4, borderRadius: 3 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 3 }}
        >
          New requirement
        </Typography>

        <TextField
          label="Title"
          placeholder="e.g. Allow administrators to change login email"
          fullWidth
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Requirement"
          placeholder="Describe the expected product behavior..."
          fullWidth
          multiline
          rows={4}
          value={requirement}
          onChange={(event) => handleRequirementChange(event.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          label="Acceptance criteria"
          placeholder="Add the main acceptance criteria..."
          fullWidth
          multiline
          rows={3}
          value={acceptanceCriteria}
          onChange={(event) => setAcceptanceCriteria(event.target.value)}
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
            startIcon={
              checking
                ? <CircularProgress size={18} color="inherit" />
                : <FactCheckOutlinedIcon />
            }
            onClick={handleCheck}
            disabled={checking || !title.trim() || !requirement.trim()}
          >
            {checking ? 'Checking...' : 'Check consistency'}
          </Button>
        </Box>
      </Paper>


      {checkError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {checkError}
        </Alert>
      )}

      {results !== null && (
        <Box sx={{ mt: 4 }}>
          {results.length === 0 ? (
            <Alert severity="success">
              No consistency issues detected by the current checks.
            </Alert>
          ) : (
            <>
              <Alert
                severity="warning"
                icon={<WarningAmberOutlinedIcon />}
                sx={{ mb: 3 }}
              >
                {results.length}{' '}
                potential consistency {results.length === 1 ? 'issue' : 'issues'} detected.
              </Alert>

              {results.map((result, index) => {
                const conflictKey = getConflictKey(result, index)
                const alreadySent = sentToReview.includes(conflictKey)

                return (
                  <Paper
                    key={conflictKey}
                    variant="outlined"
                    sx={{ p: 3, mb: 3, borderRadius: 3 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 2, flexWrap: 'wrap' }}
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
                        label="Rule-based match"
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
                        : 'Potential conflict with approved Product Decision'}
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
                          sx={{ display: 'block', mt: 2 }}
                        >
                          Source: {result.relatedObject?.source}
                          {' • '}
                          Owner: {result.relatedObject?.owner}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 2 }}
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
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => void handleSendToReview(result, index)}
                        disabled={alreadySent || sendingToReview !== null}
                      >
                        {alreadySent
                          ? 'Sent to review'
                          : sendingToReview === conflictKey
                            ? 'Sending...'
                            : 'Send to review'}
                      </Button>

                      {reviewError?.conflictKey === conflictKey && (
                        <Alert
                          severity="error"
                          sx={{
                            width: '100%',
                            mt: 1,
                          }}
                        >
                          {reviewError.message}
                        </Alert>
                      )}
                    </Box>

                  </Paper>
                )
              })}
            </>
          )}
        </Box>
      )}
    </Box>
  )
}