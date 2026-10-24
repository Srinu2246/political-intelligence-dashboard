'use client'

import { useId, useState } from 'react'
import { Box, Button, Divider, Popover, Stack, Typography } from '@mui/material'
import { ChevronDown, MapPin } from 'lucide-react'

type WorkspaceProfile = {
  name: string
  parliamentaryConstituency: string
  state: string
  country: string
  lokSabha: string
  censusYear: string
  population: string
  literacyRate: string
  genderRatio: string
  scStPopulation: string
}

export function WorkspaceSwitcher({
  profile,
  assemblySegmentCount,
}: {
  profile: WorkspaceProfile
  assemblySegmentCount: number
}) {
  const [anchorPosition, setAnchorPosition] = useState<{ top: number; left: number } | null>(null)
  const open = Boolean(anchorPosition)
  const profileId = useId()

  return (
    <>
      <Button
        className="workspace-switch"
        onClick={event => {
          const switcher = event.currentTarget.getBoundingClientRect()
          const sidebar = event.currentTarget.closest('.sidebar')?.getBoundingClientRect()
          setAnchorPosition({
            top: switcher.bottom,
            left: sidebar?.left ?? switcher.left,
          })
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? profileId : undefined}
      >
        <Box className="workspace-icon">{profile.name.charAt(0)}</Box>
        <Box className="workspace-switch-label">
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {profile.name} PC
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {profile.state} · {profile.country}
          </Typography>
        </Box>
        <ChevronDown size={15} aria-hidden="true" />
      </Button>
      <Popover
        id={profileId}
        open={open}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition ?? undefined}
        marginThreshold={0}
        onClose={() => setAnchorPosition(null)}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': `${profile.name} constituency overview`,
            sx: {
              width: 'var(--sidebar-width)',
              maxWidth: 'calc(100vw - 24px)',
              p: 2,
              mt: 1,
              borderRadius: 2,
            },
          },
        }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Constituency overview
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5 }}>
              <MapPin size={15} aria-hidden="true" />
              <Typography variant="body2" color="text.secondary">
                PC {profile.parliamentaryConstituency} · {profile.state}
              </Typography>
            </Stack>
          </Box>
          <Divider />
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
            <ProfileDetail label="Parliament" value={profile.lokSabha} />
            <ProfileDetail label="Assembly segments" value={String(assemblySegmentCount)} />
          </Stack>
          <Divider />
          <Typography variant="overline" color="text.secondary">
            Census profile · {profile.censusYear}
          </Typography>
          <Stack spacing={1}>
            <ProfileDetail label="Population" value={profile.population} />
            <ProfileDetail label="Literacy rate" value={profile.literacyRate} />
            <ProfileDetail label="Gender ratio" value={profile.genderRatio} />
            <ProfileDetail label="SC / ST population" value={profile.scStPopulation} />
          </Stack>
        </Stack>
      </Popover>
    </>
  )
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  )
}
