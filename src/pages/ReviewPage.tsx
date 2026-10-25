
import { useCallback, useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  getDecisions,
  type ProductDecision,
} from '../data/decisionStore'

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([])
  type ReviewFilter = 'OPEN' | 'RESOLVED' | 'CLOSED' | 'ALL'

  const [decisions, setDecisions] = useState<ProductDecision[]>([])

  const [filter, setFilter] = useState<ReviewFilter>('OPEN')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [selectedItem, setSelectedItem] =
    useState<ReviewItem | null>(null)

  const [decision, setDecision] = useState('')
  const [rationale, setRationale] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const refreshItems = useCallback(async () => {
    const [reviewData, decisionData] = await Promise.all([
      getReviewItems(),
      getDecisions(),
    ])
  
    setItems(reviewData)
    setDecisions(decisionData)
  }, [])

  useEffect(() => {
    let active = true

    const loadItems = async () => {
      try {

        const [reviewData, decisionData] = await Promise.all([
          getReviewItems(),
          getDecisions(),
        ])
        
        if (active) {
          setItems(reviewData)
          setDecisions(decisionData)
          setLoadError(null)
        }

      } catch (error) {
        console.error('Failed to load Review Items:', error)

        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Failed to load Review Items.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadItems()

    return () => {
      active = false
    }
  }, [])

  const handleResolve = (item: ReviewItem) => {
    if (updatingId !== null) return

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

    const decisionId = crypto.randomUUID()

    try {
      await addDecision({
        id: decisionId,
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

      await updateReviewStatus(
        selectedItem.id,
        'RESOLVED',
        decisionId,
      )

      setSelectedItem(null)
      setDecision('')
      setRationale('')

      await refreshItems()
    } catch (error) {
      console.error('Failed to resolve Review Item:', error)

      setSaveError(
        error instanceof Error
          ? error.message
          : 'Failed to resolve the Review Item.',
      )
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (
    id: string,
    status: ReviewItem['status'],
  ) => {
    if (updatingId !== null || saving) return

    setUpdatingId(id)
    setActionError(null)

    try {
      await updateReviewStatus(id, status)
      await refreshItems()
    } catch (error) {
      console.error('Failed to update Review status:', error)

      setActionError(
        error instanceof Error
          ? error.message
          : 'Failed to update Review status.',
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true
  
    if (filter === 'CLOSED') {
      return (
        item.status === 'DISMISSED' ||
        item.status === 'INTENTIONAL'
      )
    }
  
    return item.status === filter
  })
  
  const counts = {
    OPEN: items.filter((item) => item.status === 'OPEN').length,
    RESOLVED: items.filter((item) => item.status === 'RESOLVED').length,
    CLOSED: items.filter(
      (item) =>
        item.status === 'DISMISSED' ||
        item.status === 'INTENTIONAL',
    ).length,
    ALL: items.length,
  }

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

      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
      >
        {(['OPEN', 'RESOLVED', 'CLOSED', 'ALL'] as const).map(
          (status) => (
            <Button
              key={status}
              variant={filter === status ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All' : status}
              {' '}({counts[status]})
            </Button>
          ),
        )}
      </Stack>

      {loadError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {loadError}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {actionError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : loadError ? null : filteredItems.length === 0 ? (
        <Alert severity="info">
          No review items match the selected filter.
        </Alert>
      ) : (
        filteredItems.map((item) => (
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
              <Chip
                label={item.status}
                color={item.status === 'OPEN' ? 'warning' : 'default'}
                size="small"
                variant="outlined"
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

            {item.status === 'RESOLVED' && (
  <Box sx={{ mt: 3 }}>
    {(() => {
      const linkedDecision = decisions.find(
        (decision) => decision.id === item.resolvedDecisionId,
      )

      if (!linkedDecision) {
        return (
          <Alert severity="info">
            {item.resolvedDecisionId
              ? 'The linked Product Decision could not be loaded.'
              : 'This resolved item has no linked Product Decision.'}
          </Alert>
        )
      }

      return (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: 'wrap' }}
          >
            <Chip
              label="APPROVED DECISION"
              color="success"
              size="small"
            />

            <Chip
              label={`Version ${linkedDecision.version}`}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {linkedDecision.title}
          </Typography>

          <Typography sx={{ mt: 2 }}>
            {linkedDecision.decision}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="caption"
            color="text.secondary"
          >
            RATIONALE
          </Typography>

          <Typography sx={{ mt: 1 }}>
            {linkedDecision.rationale}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 2 }}
          >
            Approved by: {linkedDecision.approvedBy}
            {' • '}
            Version: {linkedDecision.version}
          </Typography>
        </Paper>
      )
    })()}
  </Box>
)}

{item.status === 'OPEN' && (
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
      disabled={updatingId !== null || saving}
    >
      Resolve
    </Button>

    <Button
      variant="outlined"
      disabled={updatingId !== null || saving}
      onClick={() =>
        void changeStatus(item.id, 'INTENTIONAL')
      }
    >
      {updatingId === item.id
        ? 'Updating...'
        : 'Intentional discrepancy'}
    </Button>

    <Button
      color="inherit"
      disabled={updatingId !== null || saving}
      onClick={() =>
        void changeStatus(item.id, 'DISMISSED')
      }
    >
      Dismiss
    </Button>
  </Stack>
)}
            
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
            disabled={saving}
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
            disabled={saving}
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
