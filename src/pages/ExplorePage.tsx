import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'

import { getDecisions } from '../data/decisionStore'

export default function ExplorePage() {
  const decisions = getDecisions()

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
      >
        Explore
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1, mb: 4 }}
      >
        Explore approved product knowledge and organizational decisions.
      </Typography>

      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mb: 2 }}
      >
        Product Decisions
      </Typography>

      {decisions.length === 0 ? (
        <Alert severity="info">
          No Product Decisions have been captured yet.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {decisions.map((decision) => (
            <Paper
              key={decision.id}
              variant="outlined"
              sx={{
                p: 3,
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
                  label="PRODUCT DECISION"
                  size="small"
                  color="primary"
                />

                <Chip
                  label={`Version ${decision.version}`}
                  size="small"
                  variant="outlined"
                />

                <Chip
                  label={decision.status}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <Typography
                variant="h6"
                sx={{ fontWeight: 600 }}
              >
                {decision.title}
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 500,
                }}
              >
                {decision.decision}
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
                  RATIONALE
                </Typography>

                <Typography sx={{ mt: 0.5 }}>
                  {decision.rationale}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 2,
                }}
              >
                Related to: {decision.relatedObjectId}
                {' • '}
                Approved by: {decision.approvedBy}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  )
}