import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import {
  getReviewItems,
  updateReviewStatus,
  type ReviewItem,
} from '../data/reviewStore'

import {
  addDecision,
} from '../data/decisionStore'

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>(
    getReviewItems(),
  )

  const [selectedItem, setSelectedItem] =
    useState<ReviewItem | null>(null)

  const [decision, setDecision] = useState('')
  const [rationale, setRationale] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const refreshItems = () => {
    setItems([...getReviewItems()])
  }

  const handleResolve = (item: ReviewItem) => {
    setSelectedItem(item)
    setDecision('')
    setRationale('')
    setSaveError(null)
  }
  
  const handleClose = () => {
    if (saving) return
  
    setSelectedItem(null)
    setSaveError(null)
  }

  const handleSaveDecision = async () => {
    if (
      !selectedItem ||
      saving ||
      !decision.trim() ||
      !rationale.trim()
    ) {
      return
    }
  
    setSaving(true)
    setSaveError(null)
  
    try {
      await addDecision({
        id: crypto.randomUUID(),
        title: `Decision: ${selectedItem.requirementTitle}`,
        decision: decision.trim(),
        rationale: rationale.trim(),
        sourceConflictId: selectedItem.id,
        relatedObjectId:
          selectedItem.conflict.sourceType === 'KNOWLEDGE'
            ? selectedItem.conflict.relatedObject?.id ?? 'UNKNOWN'
            : selectedItem.conflict.relatedDecision?.id ?? 'UNKNOWN',
        status: 'APPROVED',
        version: 1,
        approvedBy: 'Demo Product Manager',
        approvedAt: new Date().toISOString(),
      })
  
      // Only resolve the review after successful database save.
      updateReviewStatus(selectedItem.id, 'RESOLVED')
  
      setSelectedItem(null)
      setDecision('')
      setRationale('')
  
      refreshItems()
    } catch (error) {
      console.error('Failed to save Product Decision:', error)
  
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Failed to save the Product Decision. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }


  const changeStatus = (
    id: string,
    status: ReviewItem['status'],
  ) => {
    updateReviewStatus(id, status)
    refreshItems()
  }

  const openItems = items.filter(
    (item) => item.status === 'OPEN',
  )

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
      >
        Review
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1, mb: 4 }}
      >
        Review detected conflicts and capture product decisions.
      </Typography>

      {openItems.length === 0 ? (
        <Alert severity="info">
          No conflicts are waiting for review.
        </Alert>
      ) : (
        openItems.map((item) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
            }}
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
                label={item.conflict.type}
                color="warning"
                size="small"
              />

              <Chip
                label={`${item.conflict.severity} severity`}
                size="small"
              />
            </Stack>

            <Typography
              variant="h6"
              sx={{ fontWeight: 600 }}
            >
              {item.requirementTitle}
            </Typography>

            <Typography sx={{ mt: 1 }}>
              {item.requirement}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              CONFLICTS WITH
            </Typography>

            <Typography
              sx={{
                fontWeight: 600,
                mt: 0.5,
              }}
            >
            {item.conflict.sourceType === 'KNOWLEDGE'
              ? `${item.conflict.relatedObject?.id} — ${item.conflict.relatedObject?.title}`
              : `Product Decision — ${item.conflict.relatedDecision?.title}`}
            </Typography>

            <Typography sx={{ mt: 2 }}>
              {item.conflict.reason}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 4,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                onClick={() => handleResolve(item)}
              >
                Resolve
              </Button>

              <Button
                variant="outlined"
                onClick={() =>
                  changeStatus(
                    item.id,
                    'INTENTIONAL',
                  )
                }
              >
                Intentional discrepancy
              </Button>

              <Button
                color="inherit"
                onClick={() =>
                  changeStatus(
                    item.id,
                    'DISMISSED',
                  )
                }
              >
                Dismiss
              </Button>
            </Stack>
          </Paper>
        ))
      )}

      <Dialog
        open={selectedItem !== null}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Create Product Decision
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Record the approved resolution so future
            requirements can be checked against it.
          </Typography>

          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}

          <TextField
            label="Decision"
            placeholder="e.g. Login email remains immutable. A separate contact email will be introduced."
            value={decision}
            onChange={(event) =>
              setDecision(event.target.value)
            }
            fullWidth
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          <TextField
            label="Rationale"
            placeholder="Why was this decision made?"
            value={rationale}
            onChange={(event) =>
              setRationale(event.target.value)
            }
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveDecision}
            disabled={
              saving ||
              !decision.trim() ||
              !rationale.trim()
            }
          >
            {saving ? 'Saving...' : 'Approve decision'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}