# Regional climate gameplay

This revision applies automatically to new games. Existing saved rooms retain their original weather and rules. No weather API, subscription, database migration or new service is needed.

## Geography and seasons

- Alder Quay: cool maritime. Rainy coastal winters and gentle summers; no routine winter snow.
- Saffron Reach: Mediterranean. Dry warm/hot summers; mild winters with sustained rain and sunny intervals.
- Glasssteppe: continental highland. Short mild summers; cold relatively dry winters, where modest snowfall persists on frozen ground.
- Pelagia: tropical monsoon. Warm year-round, heavy summer/early-autumn rain, drier trade-wind intervals; no cold or snow season.
- Ember Mesa: arid interior. Hot dry summers, mild daytime winter sun and rapid cooling on clear evenings.

Each season contains two authored conditions. Their order is fixed by the public room code, region and season. Private story seeds never affect weather. Visiting another region, loading a save or changing seats cannot reroll the forecast.

## Mechanical choices

Explicit outdoor activity tags determine exposure, not a venue's visual appearance. Hot weather adds 4 energy to strenuous outdoor activities. Cold or heavy monsoon rain adds 3; other sustained wet weather adds 2. Gentle leisure and district exploration cost 2 extra energy in heat, cold or heavy rain. These adjustments are included in the shared action preview and authoritative energy eligibility check.

Regional travel uses the larger exposure cost at the departure or arrival region, never their sum: heavy monsoon rain adds 3 energy, heat/cold adds 2, sustained rain adds 1, and mild conditions add none. Both forecasts appear before confirmation; the actual energy charge is in the exact-effects preview and any energy requirement. Ordinary prose explains exposure and practical alternatives without displaying internal budgets. Weather changes no travel fares, time blocks, wages or bills. Local map navigation remains free.

All outdoor and travel exposure shares a per-player maximum of 8 extra energy each month. Traveling does not reset that budget. The existing happiness budget remains 4 per month and indoor cold-weather recovery remains 8. Sunny leisure grants up to 2 happiness; rainy sheltered activities grant up to 2; cold-weather cozy activities restore up to 4 energy. Only actually received bonuses consume their budgets.

Home rest is always an essential, no-cash indoor recovery option and never incurs exposure. Indoor regional work remains available without weather penalties. Outdoor regional rest still recovers energy even in harsh conditions. No forecast shuts a route or essential venue.

The existing shared neighborhood opportunity changes setting to match the local forecast; wet-weather gatherings move indoors and can share the capped sheltered happiness bonus. Its cash, skill, craft and social rewards remain unchanged. An opportunity is still claimable only once for the table that month.

## Compatibility and validation

Every current life uses regional climates. The additive `weatherUsage.exposure` counter resets only when the month changes.

Client and server share byte-identical weather, game and world modules, verified by the engine manifest. Tests cover all five regions, all eight months, multiple room codes, 1–4 seats, sanitized snapshots, normal activity outcomes, regional journeys, explicit-player authority, departure/arrival ownership, failed energy gates, indoor recovery at zero resources, duplicate receipts, reloads, cap consumption, opportunity resource clamping and interrupted journeys.
