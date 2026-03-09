# Water Tracker & Reminder PWA

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Daily water intake tracker with customizable goal (default 2000ml)
- Central fluid-fill bubble with animated wave effect that rises based on intake %
- Quick-action buttons: 250ml, 500ml, and custom amount via FAB
- Reminder toggle using setInterval to check if water was logged in last 60 min; triggers browser Notification API if not
- History drawer (slide-up) with timestamped log of today's drinks
- Glassmorphism/iOS-inspired aesthetic: #0077FF, #E0F2FE, #FFFFFF palette
- San Francisco / system sans-serif typography
- PWA manifest and service worker for installability

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store daily intake entries (amount ml, timestamp) and goal setting per user
2. Frontend: wave bubble animation (SVG/CSS), quick-add buttons, custom amount modal, reminder toggle with Notification API, history drawer, glassmorphism UI
3. PWA: manifest.json, service worker registration
