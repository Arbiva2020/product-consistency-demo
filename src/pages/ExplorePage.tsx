import { Typography } from '@mui/material'

export default function ExplorePage() {
  return (
    <>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
      >
        Explore
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Understand your product, decisions and dependencies.
      </Typography>
    </>
  )
}