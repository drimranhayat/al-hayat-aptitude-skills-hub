# PipFury Step 2: Premium VSA Signals + Glossary

This update adds:

- `data/vsa-signals.json` — 82 clear VSA signal entries
- `data/vsa-glossary.json` — 150 glossary entries
- `vsa-signals/index.html` — upgraded signals library page
- `glossary/index.html` — upgraded glossary page
- `assets/js/app.js` — GitHub Pages-safe rendering for course, signals, glossary, search, tools, and modules

## Image policy

Do not scrape random TradingView screenshots. Add your own chart snapshots later using TradingView's built-in snapshot tool, keeping TradingView attribution visible. The JSON includes `imageUrl` fields and `tradingViewImageGuidance` notes for future snapshots.

## Upload command

```cmd
robocopy "C:\Users\imran\Downloads\pipfury-step2-signals-glossary\pipfury-step2-signals-glossary" "C:\Users\imran\premium\premium" /E
cd C:\Users\imran\premium\premium
git add .
git commit -m "Add premium VSA signals and glossary step 2"
git push origin main
```
