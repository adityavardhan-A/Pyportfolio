> **Research version (Oct 2026):** the reproducible paper pipeline (TACO + ZeroWaste-f
> segmentation with real masks, WaDaBa polymer ID with object-disjoint CV, Kaggle/Colab/PC runners,
> LaTeX tables) lives in **`research/`** - start with `research/README.md`. The app auto-loads
> `models/plastic_material3_seg_best.pt` and `models/polymer_best.pt` once you run
> `python -m research.install_models`.

# AI Plastic Waste Intelligence Platform

Detection · Instance Segmentation · **Segregation** · Polymer Classification ·
Grad-CAM Explainability · Recyclability Assessment · **Adaptive Recycling Optimization**

A production-style Streamlit application that takes a single image of mixed
plastic waste and returns, **per object**: bounding box, segmentation mask,
isolated ROI, polymer type, recyclability score (5 weighted CV metrics),
explanation, recommended recycling pathway and optimization score — plus
fleet-level sustainability analytics.

---

## Quick start

```bash
pip install -r requirements.txt
streamlit run app.py
```

Open the URL Streamlit prints (default http://localhost:8501). Pick a built-in
**demo scene** (or upload an image) and press **Run analysis**.

The app runs out-of-the-box with **zero model downloads** thanks to built-in
fallbacks. Installing `torch` + `ultralytics` (in `requirements.txt`) unlocks
the real deep-learning pipeline.

---

## Plug in real models

| Capability | Default (fallback) | Production |
|---|---|---|
| Detection + segmentation | Classical-CV segmenter | **Ultralytics YOLO26** (`yolo26l-seg.pt`, auto-downloaded) — see below |
| Polymer classification    | Deterministic visual-cue heuristic | `PLASTIC_CLF_WEIGHTS=/path/polymer_cnn.pt` (state_dict for `core.classifier.PolymerCNN`) |

### Detector backbone — YOLO26

`core/detection.py` loads checkpoints through `config.YOLO_WEIGHTS_CHAIN`,
trying each in turn (see `Detector._load_yolo`):

1. **Your fine-tuned weights** — auto-discovered at
   `models/plastic_yolo26_seg_best.pt` if present (this is exactly what
   `tools/train_yolo.py` produces — see **`dataset/README.md`** for the full
   "drop your photos in → train → done" workflow)
2. **`PLASTIC_YOLO_WEIGHTS`** env var override, if set
3. **`yolo26l-seg.pt`** — COCO-pretrained YOLO26 (large), instance-segmentation
   head, auto-downloaded by Ultralytics on first use
4. **`yolo26l.pt`** — YOLO26 detection-only head (boxes only; the detector then
   derives a rectangular mask from each box)
5. **`yolov8n-seg.pt`** — small last-resort DL fallback
6. **Classical-CV segmenter** — always available, no DL/network required

```bash
# Option A — point at any checkpoint explicitly (always wins, skips the chain):
export PLASTIC_YOLO_WEIGHTS=/path/to/weights.pt
export PLASTIC_CLF_WEIGHTS=weights/polymer_cnn.pt
streamlit run app.py

# Option B — fine-tune YOLO26 on YOUR plastic-waste photos (recommended for
# best accuracy on dense/overlapping real-world piles): see dataset/README.md
python tools/prepare_dataset.py
python tools/train_yolo.py
streamlit run app.py   # auto-discovers models/plastic_yolo26_seg_best.pt
```

The active backend is always shown in the dashboard (object-detail panel +
data-tab status panel), e.g.:
> `Ultralytics YOLO26 L-scale -- fine-tuned on YOUR plastic-waste dataset (instance-segmentation head)`

---

## Pipeline

```
image
 └─ detection.py        YOLO26-seg (or classical-CV fallback)  → boxes + masks
     └─ segregation.py  isolate each object (background removed) → ROIs
         ├─ classifier.py        polymer type (CNN or heuristic)
         ├─ explainability.py    Grad-CAM (CNN) or CV saliency
         ├─ recyclability.py     5 CV metrics → weighted score → category
         └─ optimization.py      rank reuse pathways → recommend best
 └─ pipeline.py         orchestration + aggregated analytics
 └─ app.py              dark dashboard (Streamlit + Plotly)
```

### Recyclability formula
```
score = 0.35·Category + 0.25·Cleanliness + 0.20·MaterialComplexity
      + 0.10·Transparency/Colour + 0.10·Damage          (0–100)
```
Bands: 80–100 Highly Recyclable · 60–79 Recyclable · 40–59 Conditionally
Recyclable · 0–39 Non-Recyclable.

### Optimization score
```
score = 0.40·CarbonSaving + 0.35·DemandIndex + 0.25·CostEfficiency
```
scaled by a recyclability-derived feasibility factor, ranked per polymer.

---

## Project structure
```
plastic_waste_ai/
├── app.py                  Streamlit dashboard
├── config.py               all tunables (weights, classes, theme, KB)
├── requirements.txt
├── core/
│   ├── detection.py        YOLO26 + classical-CV fallback
│   ├── segmentation.py     annotated / overlay visuals
│   ├── segregation.py      per-object ROI isolation
│   ├── classifier.py       PolymerCNN + heuristic fallback
│   ├── explainability.py   Grad-CAM / CV saliency
│   ├── recyclability.py    5 metrics + formula + explanations
│   ├── optimization.py     reuse pathway ranking
│   ├── recommender.py      AdaptiveRecycleNet — custom AI reuse-recommendation engine
│   └── pipeline.py         end-to-end orchestration
├── utils/
│   ├── image_utils.py      image / mask / colour helpers
│   ├── viz.py              Plotly charts
│   └── samples.py          synthetic demo scenes (6 test cases)
├── tools/
│   ├── prepare_dataset.py  raw_drop/ → train/val split + data.yaml
│   └── train_yolo.py       fine-tune YOLO26 on your data → models/
├── dataset/                YOUR training images go here — see dataset/README.md
│   ├── raw_drop/           drop labelled images+labels here, then run prepare_dataset.py
│   ├── images|labels/{train,val}/   built by prepare_dataset.py
│   ├── classes.txt         editable class list
│   └── data.yaml           Ultralytics YOLO data config (auto-written)
└── models/                 trained weights live here (recommender + your fine-tuned YOLO26)
```

---

## Honest limitations (please read)

- **Polymer type cannot be reliably read from an RGB photo.** Real facilities
  use near-infrared spectroscopy. The default classifier is a **deterministic
  heuristic** stand-in; the `PolymerCNN` is a trainable scaffold that needs a
  labelled dataset.
- The recyclability metrics are **transparent CV heuristics**, useful for a
  prototype / decision-support demo, **not** certified measurements.
- Carbon figures use coarse per-kg factors and an assumed object mass; treat
  them as relative indicators.

Tune everything in `config.py`.
