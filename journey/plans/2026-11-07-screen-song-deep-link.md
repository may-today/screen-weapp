# Screen song deep link

## Goal

Open the screen page with a selected song from a named dataset through Mini Program page parameters (`dataset` and `song`).

## Plan

1. Share the dataset registry between the library picker and the screen entry.
2. On screen page load, validate the parameters, resolve the song from cache or the dataset endpoint, and set the current song.
3. Keep ordinary screen entry unchanged, report invalid or missing songs, and document the page path for external URL Link generation.
4. Run typecheck and build; record limits of simulator and real-device verification.
