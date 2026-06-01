(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const SNAP_THRESHOLD = 45;
  const SANDBOX_SOURCE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const DIFFICULTY_CONFIGS = {
    easy: {
      label: "Easy",
      minTarget: 2,
      maxTarget: 10,
      duration: 60,
      trayValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      combineMax: 10,
    },
    normal: {
      label: "Normal",
      minTarget: 10,
      maxTarget: 99,
      duration: 90,
      trayValues: [1, 2, 3, 4, 5, 10, 20, 30, 40, 50],
      combineMax: 200,
    },
    hard: {
      label: "Hard",
      minTarget: 100,
      maxTarget: 200,
      duration: 120,
      trayValues: [1, 2, 5, 10, 20, 25, 50, 75, 100, 200],
      combineMax: 200,
    },
  };
  const BLOCK_COLORS = {
    1: "#FF1A1A",
    2: "#FF8000",
    3: "#FFFF00",
    4: "#00CC00",
    5: "#3399FF",
    6: "#8A3FFC",
    7: "#FF4FB8",
    8: "#B44CFF",
    9: "#A8A8A8",
    10: "#FFFFFF",
  };
  const RAINBOW_SEVEN = [
    "#FF1A1A",
    "#FF8000",
    "#FFFF00",
    "#00CC00",
    "#3399FF",
    "#4E57FF",
    "#A04CFF",
  ];
  const TENS_REFERENCE_COLORS = {
    10: {
      fill: "#FFFFFF",
      stroke: "#E2363C",
      grid: "#E2363C",
    },
    20: {
      fillStart: "#FFF0C8",
      fillMid: "#F4D596",
      fillEnd: "#E7BC78",
      stroke: "#C57C35",
      grid: "rgba(159, 99, 35, 0.52)",
      shine: "rgba(255, 246, 218, 0.72)",
      digit: "#704318",
    },
    30: {
      fillStart: "#F7F3A6",
      fillMid: "#E6E06D",
      fillEnd: "#D1CB55",
      stroke: "#A09A36",
      grid: "rgba(129, 125, 38, 0.5)",
      shine: "rgba(255, 255, 202, 0.76)",
      digit: "#5F5A1C",
    },
    40: {
      fillStart: "#D9F7CE",
      fillMid: "#B7E9AF",
      fillEnd: "#8BD583",
      stroke: "#35B74A",
      grid: "rgba(38, 151, 58, 0.48)",
      shine: "rgba(230, 255, 222, 0.76)",
      digit: "#176A2B",
    },
    50: {
      fillStart: "#C4F1F6",
      fillMid: "#91D9E3",
      fillEnd: "#70C4D0",
      stroke: "#2B7581",
      grid: "rgba(35, 103, 114, 0.5)",
      shine: "rgba(220, 255, 255, 0.74)",
      digit: "#144A56",
    },
    60: {
      fillStart: "#B6A8F3",
      fillMid: "#967FE6",
      fillEnd: "#8064D7",
      stroke: "#5631B7",
      grid: "rgba(75, 42, 166, 0.52)",
      shine: "rgba(218, 210, 255, 0.66)",
      digit: "#2E1A78",
    },
    70: {
      gradientX2: "100%",
      gradientY2: "0%",
      gradientStops: [
        { offset: "0%", color: "#F15358" },
        { offset: "16%", color: "#F39A42" },
        { offset: "32%", color: "#F2E65F" },
        { offset: "49%", color: "#79DC77" },
        { offset: "66%", color: "#64D6E5" },
        { offset: "83%", color: "#6E85E8" },
        { offset: "100%", color: "#A06BE8" },
      ],
      stroke: "#7E53AA",
      grid: "rgba(82, 55, 129, 0.42)",
      shine: "rgba(255, 255, 255, 0.54)",
      digit: "#4A2E79",
    },
    80: {
      fillStart: "#F1B7F1",
      fillMid: "#D987DD",
      fillEnd: "#C06ACB",
      stroke: "#7D3F86",
      grid: "rgba(98, 43, 105, 0.52)",
      shine: "rgba(255, 222, 255, 0.62)",
      digit: "#682D73",
    },
    90: {
      fillStart: "#BFCBD0",
      fillMid: "#8E9EA5",
      fillEnd: "#63737A",
      stroke: "#3F4B51",
      grid: "rgba(45, 56, 61, 0.5)",
      shine: "rgba(236, 246, 250, 0.58)",
      digit: "#263238",
    },
    100: {
      fillStart: "#E9A0A8",
      fillMid: "#D36B76",
      fillEnd: "#B85865",
      stroke: "#75323D",
      grid: "rgba(105, 43, 53, 0.5)",
      shine: "rgba(255, 212, 216, 0.58)",
      digit: "#5E2530",
    },
  };
  const DEFAULT_COMPOSITE_COLORS = {
    fillStart: "#FFFFFF",
    fillMid: "#DCE5EF",
    fillEnd: "#F8FBFF",
    stroke: "rgba(22, 42, 66, 0.35)",
    grid: "rgba(74, 99, 132, 0.16)",
    shine: "rgba(255, 255, 255, 0.82)",
    digit: "#132136",
  };

  const sandbox = document.querySelector("#sandbox");
  const trayLane = document.querySelector("#trayLane");
  const resetButton = document.querySelector("#resetButton");
  const themeToggle = document.querySelector("#themeToggle");
  const challengeHud = document.querySelector("#challengeHud");
  const targetBubble = document.querySelector("#targetBubble");
  const timerFill = document.querySelector("#timerFill");
  const modeOverlay = document.querySelector("#modeOverlay");
  const modeHome = document.querySelector("#modeHome");
  const difficultyPanel = document.querySelector("#difficultyPanel");
  const backToModesButton = document.querySelector("#backToModes");
  const confettiLayer = document.querySelector("#confettiLayer");
  const activeBlocks = [];
  const blockElements = new Map();
  const gameState = {
    mode: "sandbox",
    difficulty: null,
    target: null,
    timeLimit: 0,
    timerDeadline: 0,
    timerFrame: 0,
    challengeActive: false,
    targetHistory: [],
    trayValues: [...SANDBOX_SOURCE_VALUES],
  };

  let activeDrag = null;
  let nextId = 1;
  let nextPaintId = 1;
  let topZ = 5;
  let resizeFrame = 0;
  let audioContext = null;

  window.activeBlocks = activeBlocks;
  window.checkVerticalSnap = checkVerticalSnap;
  window.combineBlocks = combineBlocks;
  window.gameState = gameState;

  function configureResponsiveUnit() {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 720;
    const compact = viewportHeight <= 410;
    const tight = viewportHeight <= 520;
    const topHeight = compact ? 44 : tight ? 48 : 56;
    const trayHeight = compact ? 92 : tight ? 104 : 144;
    const preferredUnit = compact ? 38 : tight ? 44 : 60;
    const sandboxHeight = Math.max(1, viewportHeight - topHeight - trayHeight - 18);
    const fitTenUnit = Math.floor(sandboxHeight / 10);
    const unit = clamp(Math.min(preferredUnit, fitTenUnit), 22, 60);
    document.documentElement.style.setProperty("--unit", `${unit}px`);
  }

  function getUnitSize() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--unit");
    return Number.parseFloat(raw) || 60;
  }

  function isCompositeValue(value) {
    return value > 10;
  }

  function getShape(value) {
    if (isCompositeValue(value)) {
      if (value >= 100) {
        return {
          columns: 3,
          rows: 1.9,
          className: "shape-hundred-flat",
          composite: true,
          viewWidth: 300,
          viewHeight: 190,
        };
      }

      return {
        columns: 2.35,
        rows: 1.3,
        className: "shape-ten-rod",
        composite: true,
        viewWidth: 235,
        viewHeight: 130,
      };
    }

    if (value === 4) {
      return { columns: 2, rows: 2, className: "shape-square-2" };
    }

    if (value === 9) {
      return { columns: 3, rows: 3, className: "shape-square-3" };
    }

    return { columns: 1, rows: value, className: "shape-tower" };
  }

  function getMetrics(value, unitOverride) {
    const unit = unitOverride ?? getUnitSize();
    const shape = getShape(value);

    return {
      ...shape,
      unit,
      width: shape.columns * unit,
      height: shape.rows * unit,
      viewWidth: shape.viewWidth ?? shape.columns * 100,
      viewHeight: shape.viewHeight ?? shape.rows * 100,
    };
  }

  function getSegmentFill(value, index) {
    if (value === 7) {
      return RAINBOW_SEVEN[index % RAINBOW_SEVEN.length];
    }

    if (value === 10) {
      return TENS_REFERENCE_COLORS[10].fill;
    }

    return BLOCK_COLORS[value] || "#FFFFFF";
  }

  function getSegmentStroke(value) {
    if (value === 10) {
      return TENS_REFERENCE_COLORS[10].stroke;
    }

    return "rgba(0, 0, 0, 0.28)";
  }

  function getCompositeColors(value) {
    return TENS_REFERENCE_COLORS[value] || DEFAULT_COMPOSITE_COLORS;
  }

  function lockSvgPaint(element) {
    element.style.setProperty("color-scheme", "only light", "important");
    element.style.setProperty("forced-color-adjust", "none", "important");
  }

  function setLockedPaint(element, property, value) {
    element.setAttribute(property, value);
    element.style.setProperty(property, value, "important");
    lockSvgPaint(element);
  }

  function lockExistingSvgPaint(svg) {
    lockSvgPaint(svg);
    svg.querySelectorAll("*").forEach((element) => {
      lockSvgPaint(element);
      ["fill", "stroke", "stop-color"].forEach((property) => {
        const value = element.getAttribute(property);
        if (value !== null) {
          element.style.setProperty(property, value, "important");
        }
      });
    });
  }

  function createNumberblockElement(value, options = {}) {
    const metrics = getMetrics(value, options.unitOverride);
    const block = document.createElement("div");
    block.className = `numberblock ${metrics.className}`;
    block.dataset.value = String(value);

    if (options.id) {
      block.dataset.id = options.id;
    }

    if (options.preview) {
      block.classList.add("preview");
      block.setAttribute("aria-hidden", "true");
    }

    renderNumberblock(block, value, options.unitOverride);
    return block;
  }

  function renderNumberblock(block, value, unitOverride) {
    const metrics = getMetrics(value, unitOverride);
    block.className = block.className
      .replace(/\bshape-\S+/g, "")
      .trim();
    block.classList.add(metrics.className);
    block.style.width = `${metrics.width}px`;
    block.style.height = `${metrics.height}px`;
    block.innerHTML = "";
    block.appendChild(createBodySvg(value, metrics));
    if (!metrics.composite) {
      block.appendChild(createFaceContainer(value, metrics));
    }
  }

  function createBodySvg(value, metrics) {
    if (metrics.composite) {
      return createCompositeBodySvg(value, metrics);
    }

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "block-body");
    svg.setAttribute("viewBox", `0 0 ${metrics.viewWidth} ${metrics.viewHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("xmlns", SVG_NS);
    lockSvgPaint(svg);

    let index = 0;
    for (let row = 0; row < metrics.rows; row += 1) {
      for (let column = 0; column < metrics.columns; column += 1) {
        if (index >= value) {
          break;
        }

        const rect = document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("class", "segment-rect");
        rect.setAttribute("x", String(column * 100));
        rect.setAttribute("y", String(row * 100));
        rect.setAttribute("width", "100");
        rect.setAttribute("height", "100");
        setLockedPaint(rect, "fill", getSegmentFill(value, index));
        setLockedPaint(rect, "stroke", getSegmentStroke(value));
        rect.setAttribute("stroke-width", "1");
        svg.appendChild(rect);
        index += 1;
      }
    }

    return svg;
  }

  function createCompositeBodySvg(value, metrics) {
    const svg = document.createElementNS(SVG_NS, "svg");
    const colors = getCompositeColors(value);
    const id = `composite-fill-${value}-${nextPaintId}`;
    const majorLines = value >= 100 ? 5 : 4;
    const minorLines = value >= 100 ? 3 : 2;
    nextPaintId += 1;
    svg.setAttribute("class", "block-body composite-body");
    svg.setAttribute("viewBox", `0 0 ${metrics.viewWidth} ${metrics.viewHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("xmlns", SVG_NS);
    lockSvgPaint(svg);

    const defs = document.createElementNS(SVG_NS, "defs");
    const gradientStops = colors.gradientStops || [
      { offset: "0%", color: colors.fillStart },
      { offset: "52%", color: colors.fillMid },
      { offset: "100%", color: colors.fillEnd },
    ];
    defs.innerHTML = `
      <linearGradient
        id="${id}"
        x1="0%"
        y1="0%"
        x2="${colors.gradientX2 || "100%"}"
        y2="${colors.gradientY2 || "100%"}"
      >
        ${gradientStops
          .map((stop) => `<stop offset="${stop.offset}" stop-color="${stop.color}" />`)
          .join("")}
      </linearGradient>
    `;
    svg.appendChild(defs);

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", "3");
    rect.setAttribute("y", "3");
    rect.setAttribute("width", String(metrics.viewWidth - 6));
    rect.setAttribute("height", String(metrics.viewHeight - 6));
    rect.setAttribute("rx", "16");
    setLockedPaint(rect, "fill", `url(#${id})`);
    setLockedPaint(rect, "stroke", colors.stroke);
    rect.setAttribute("stroke-width", "3");
    svg.appendChild(rect);

    for (let column = 1; column < majorLines; column += 1) {
      const line = document.createElementNS(SVG_NS, "line");
      const x = (metrics.viewWidth / majorLines) * column;
      line.setAttribute("x1", String(x));
      line.setAttribute("x2", String(x));
      line.setAttribute("y1", "10");
      line.setAttribute("y2", String(metrics.viewHeight - 10));
      setLockedPaint(line, "stroke", colors.grid);
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    }

    for (let row = 1; row < minorLines; row += 1) {
      const line = document.createElementNS(SVG_NS, "line");
      const y = (metrics.viewHeight / minorLines) * row;
      line.setAttribute("x1", "10");
      line.setAttribute("x2", String(metrics.viewWidth - 10));
      line.setAttribute("y1", String(y));
      line.setAttribute("y2", String(y));
      setLockedPaint(line, "stroke", colors.grid);
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    }

    const shine = document.createElementNS(SVG_NS, "path");
    shine.setAttribute("d", `M 18 24 C ${metrics.viewWidth * 0.36} 4 ${metrics.viewWidth * 0.66} 8 ${metrics.viewWidth - 18} 28`);
    setLockedPaint(shine, "stroke", colors.shine);
    shine.setAttribute("stroke-width", "8");
    shine.setAttribute("stroke-linecap", "round");
    setLockedPaint(shine, "fill", "none");
    svg.appendChild(shine);

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("class", "composite-digit");
    text.setAttribute("x", String(metrics.viewWidth / 2));
    text.setAttribute("y", String(metrics.viewHeight / 2 + metrics.viewHeight * 0.14));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", value >= 100 ? "76" : "66");
    setLockedPaint(text, "fill", colors.digit);
    setLockedPaint(text, "stroke", "rgba(255, 255, 255, 0.65)");
    text.setAttribute("stroke-width", "3");
    text.textContent = String(value);
    svg.appendChild(text);
    lockExistingSvgPaint(svg);

    return svg;
  }

  function createFaceContainer(value, metrics) {
    const faceContainer = document.createElement("div");
    faceContainer.className = "face-container";
    faceContainer.style.width = `${metrics.unit}px`;
    faceContainer.style.height = `${metrics.unit}px`;

    if (value === 4) {
      faceContainer.style.width = `${metrics.width}px`;
      faceContainer.style.height = `${metrics.height}px`;
    }

    if (value === 9) {
      faceContainer.style.width = `${metrics.width}px`;
      faceContainer.style.height = `${metrics.unit * 2}px`;
    }

    faceContainer.appendChild(createFaceSvg(value));
    return faceContainer;
  }

  function createFaceSvg(value) {
    const svg = document.createElementNS(SVG_NS, "svg");
    const mouthPath = value === 1
      ? "M 34 66 Q 50 78 66 66"
      : "M 30 64 Q 50 85 70 64 Z";
    const mouthFill = value === 1 ? "none" : "#111111";
    const mouthStroke = value === 1 ? "#111111" : "none";
    const eyeLeft = value === 4 || value === 9 ? 33 : 35;
    const eyeRight = value === 4 || value === 9 ? 67 : 65;
    const eyeY = value === 9 ? 38 : 40;

    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("class", "block-face");
    lockSvgPaint(svg);
    svg.innerHTML = `
      <g class="eyes">
        <circle cx="${eyeLeft}" cy="${eyeY}" r="12" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" />
        <circle cx="${eyeLeft}" cy="${eyeY}" r="5" fill="#111111" />
        <circle cx="${eyeRight}" cy="${eyeY}" r="12" fill="#FFFFFF" stroke="#111111" stroke-width="2.5" />
        <circle cx="${eyeRight}" cy="${eyeY}" r="5" fill="#111111" />
      </g>
      <g class="eyebrows" stroke="#111111" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M 25 25 Q 35 20 45 25" />
        <path d="M 55 25 Q 65 20 75 25" />
      </g>
      <g class="mouth">
        <path d="${mouthPath}" fill="${mouthFill}" stroke="${mouthStroke}" stroke-width="5" stroke-linecap="round" />
      </g>
    `;
    lockExistingSvgPaint(svg);

    return svg;
  }

  function renderTray() {
    trayLane.innerHTML = "";
    const sourceValues = gameState.trayValues;
    const laneWidth = trayLane.clientWidth || 720;
    const laneHeight = trayLane.clientHeight || 110;
    const columns = laneWidth < 620 ? Math.min(5, sourceValues.length) : sourceValues.length;
    const rows = Math.ceil(sourceValues.length / columns);
    const gap = laneWidth < 620 ? 8 : 10;
    const cellWidth = Math.max(36, Math.floor((laneWidth - gap * (columns - 1)) / columns));
    const cellHeight = Math.max(42, Math.floor((laneHeight - gap * (rows - 1)) / rows));
    const visualWidth = Math.max(24, cellWidth - 16);
    const visualHeight = Math.max(20, cellHeight - 40);
    trayLane.style.setProperty("--tray-columns", String(columns));

    for (const value of sourceValues) {
      const shape = getShape(value);
      const previewUnit = Math.max(
        4,
        Math.min(
          getUnitSize(),
          Math.floor(visualWidth / shape.columns),
          Math.floor(visualHeight / shape.rows)
        )
      );
      const source = document.createElement("button");
      const blocked = isTrayValueBlocked(value);
      source.className = "tray-source";
      source.type = "button";
      source.dataset.value = String(value);
      source.disabled = blocked;
      source.setAttribute(
        "aria-label",
        blocked
          ? `Build ${value} from other blocks`
          : `Spawn block ${value}`
      );
      source.appendChild(createNumberblockElement(value, {
        preview: true,
        unitOverride: previewUnit,
      }));
      trayLane.appendChild(source);
    }
  }

  function isTrayValueBlocked(value) {
    return (
      gameState.mode === "time" &&
      gameState.difficulty === "easy" &&
      gameState.challengeActive &&
      gameState.target === value
    );
  }

  function spawnBlock(value, x, y, options = {}) {
    const metrics = getMetrics(value);
    const id = `block-${nextId}`;
    nextId += 1;
    const position = clampToSandbox(x, y, metrics.width, metrics.height);
    const element = createNumberblockElement(value, { id });

    element.style.zIndex = String(topZ);
    topZ += 1;
    sandbox.appendChild(element);

    const block = {
      id,
      value,
      x: position.x,
      y: position.y,
      width: metrics.width,
      height: metrics.height,
    };

    activeBlocks.push(block);
    blockElements.set(id, element);
    applyPosition(block);

    if (options.celebrate) {
      element.classList.add("is-born", "is-celebrating");
      window.setTimeout(() => {
        element.classList.remove("is-born", "is-celebrating");
      }, 380);
    }

    return block;
  }

  function removeBlock(id) {
    const index = activeBlocks.findIndex((block) => block.id === id);
    if (index >= 0) {
      activeBlocks.splice(index, 1);
    }

    const element = blockElements.get(id);
    if (element) {
      element.remove();
      blockElements.delete(id);
    }
  }

  function resetSandbox() {
    for (const element of blockElements.values()) {
      element.remove();
    }

    activeBlocks.splice(0, activeBlocks.length);
    blockElements.clear();
    nextId = 1;
    topZ = 5;
  }

  function applyPosition(block) {
    const element = blockElements.get(block.id);
    if (!element) {
      return;
    }

    element.style.setProperty("--x", `${block.x}px`);
    element.style.setProperty("--y", `${block.y}px`);
    element.style.transform = `translate3d(${block.x}px, ${block.y}px, 0)`;
  }

  function setBlockPosition(block, x, y, shouldClamp = true) {
    const position = shouldClamp ? clampToSandbox(x, y, block.width, block.height) : { x, y };
    block.x = position.x;
    block.y = position.y;
    applyPosition(block);
  }

  function clampToSandbox(x, y, width, height) {
    const maxX = Math.max(0, sandbox.clientWidth - width);
    const maxY = Math.max(0, sandbox.clientHeight - height);

    return {
      x: clamp(x, 0, maxX),
      y: clamp(y, 0, maxY),
    };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getPointInSandbox(event) {
    const rect = sandbox.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function getBlockById(id) {
    return activeBlocks.find((block) => block.id === id) || null;
  }

  function beginDrag(event, block, options = {}) {
    if (activeDrag) {
      return;
    }

    const element = blockElements.get(block.id);
    if (!element) {
      return;
    }

    event.preventDefault();
    element.classList.remove("is-returning", "is-snapping", "is-rejected");
    element.classList.add("is-dragging");
    element.style.zIndex = String(topZ);
    topZ += 1;

    const point = getPointInSandbox(event);
    activeDrag = {
      pointerId: event.pointerId,
      blockId: block.id,
      startX: block.x,
      startY: block.y,
      offsetX: options.offsetX ?? point.x - block.x,
      offsetY: options.offsetY ?? point.y - block.y,
    };

    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Window-level listeners keep the drag alive on Safari versions that refuse capture here.
    }
  }

  function handleTrayPointerDown(event) {
    const source = event.target.closest(".tray-source");
    if (!source || source.disabled || activeDrag) {
      return;
    }

    const value = Number(source.dataset.value);
    const metrics = getMetrics(value);
    const point = getPointInSandbox(event);
    const startX = point.x - metrics.width / 2;
    const startY = point.y - metrics.height / 2;
    const block = spawnBlock(value, startX, startY);

    beginDrag(event, block, {
      offsetX: metrics.width / 2,
      offsetY: Math.min(metrics.height / 2, metrics.height - 8),
    });
  }

  function handleSandboxPointerDown(event) {
    const element = event.target.closest(".numberblock");
    if (!element || element.classList.contains("preview") || activeDrag) {
      return;
    }

    const block = getBlockById(element.dataset.id);
    if (block) {
      beginDrag(event, block);
    }
  }

  function handlePointerMove(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
      if (activeDrag) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();
    const block = getBlockById(activeDrag.blockId);
    if (!block) {
      return;
    }

    const point = getPointInSandbox(event);
    setBlockPosition(
      block,
      point.x - activeDrag.offsetX,
      point.y - activeDrag.offsetY
    );
  }

  function handlePointerUp(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
      return;
    }

    event.preventDefault();
    const drag = activeDrag;
    activeDrag = null;

    const block = getBlockById(drag.blockId);
    if (!block) {
      return;
    }

    const element = blockElements.get(block.id);
    if (element) {
      element.classList.remove("is-dragging");
      try {
        element.releasePointerCapture(event.pointerId);
      } catch {
        // Capture can already be released by the browser.
      }
    }

    settleDrop(block, drag);
  }

  function checkVerticalSnap(draggedBlock) {
    let bestMatch = null;
    let bestScore = Number.POSITIVE_INFINITY;
    const draggedBottom = draggedBlock.y + draggedBlock.height;
    const draggedCenterX = draggedBlock.x + draggedBlock.width / 2;

    for (const target of activeBlocks) {
      if (target.id === draggedBlock.id) {
        continue;
      }

      const verticalGap = Math.abs(draggedBottom - target.y);
      const horizontalOffset = Math.abs(
        draggedCenterX - (target.x + target.width / 2)
      );

      if (verticalGap < SNAP_THRESHOLD && horizontalOffset < SNAP_THRESHOLD) {
        const score = verticalGap + horizontalOffset;
        if (score < bestScore) {
          bestScore = score;
          bestMatch = {
            target,
            x: target.x + target.width / 2 - draggedBlock.width / 2,
            y: target.y - draggedBlock.height,
            verticalGap,
            horizontalOffset,
          };
        }
      }
    }

    return bestMatch;
  }

  function checkGridSnap(draggedBlock) {
    const verticalMatch = checkVerticalSnap(draggedBlock);
    let bestMatch = verticalMatch ? { ...verticalMatch, direction: "vertical" } : null;
    let bestScore = verticalMatch
      ? verticalMatch.verticalGap + verticalMatch.horizontalOffset
      : Number.POSITIVE_INFINITY;
    const draggedCenterY = draggedBlock.y + draggedBlock.height / 2;

    for (const target of activeBlocks) {
      if (target.id === draggedBlock.id) {
        continue;
      }

      const targetCenterY = target.y + target.height / 2;
      const verticalOffset = Math.abs(draggedCenterY - targetCenterY);
      const leftGap = Math.abs(draggedBlock.x - (target.x + target.width));
      const rightGap = Math.abs((draggedBlock.x + draggedBlock.width) - target.x);

      if (verticalOffset < SNAP_THRESHOLD && leftGap < SNAP_THRESHOLD) {
        const score = verticalOffset + leftGap;
        if (score < bestScore) {
          bestScore = score;
          bestMatch = {
            target,
            x: target.x + target.width,
            y: targetCenterY - draggedBlock.height / 2,
            verticalGap: verticalOffset,
            horizontalOffset: leftGap,
            direction: "horizontal",
          };
        }
      }

      if (verticalOffset < SNAP_THRESHOLD && rightGap < SNAP_THRESHOLD) {
        const score = verticalOffset + rightGap;
        if (score < bestScore) {
          bestScore = score;
          bestMatch = {
            target,
            x: target.x - draggedBlock.width,
            y: targetCenterY - draggedBlock.height / 2,
            verticalGap: verticalOffset,
            horizontalOffset: rightGap,
            direction: "horizontal",
          };
        }
      }
    }

    return bestMatch;
  }

  async function settleDrop(block, drag) {
    const snap = gameState.mode === "time"
      ? checkGridSnap(block)
      : checkVerticalSnap(block);

    if (!snap) {
      checkWinCondition();
      return;
    }

    const combinedValue = block.value + snap.target.value;
    if (combinedValue > getCombineLimit()) {
      await rejectAndReturn(block, drag.startX, drag.startY);
      return;
    }

    await moveWithTransition(block, snap.x, snap.y, "is-snapping", 100, false);
    combineBlocks(block, snap.target);
    checkWinCondition();
  }

  function moveWithTransition(block, x, y, className, duration, shouldClamp = true) {
    const element = blockElements.get(block.id);

    if (!element) {
      return Promise.resolve();
    }

    element.classList.add("is-settling", className);
    setBlockPosition(block, x, y, shouldClamp);
    window.setTimeout(() => {
      element.classList.remove("is-settling", className);
    }, duration);
    return Promise.resolve();
  }

  async function rejectAndReturn(block, startX, startY) {
    const element = blockElements.get(block.id);
    if (!element) {
      return;
    }

    element.classList.add("is-rejected", "is-settling");
    window.setTimeout(() => {
      element.classList.remove("is-rejected");
    }, 230);
    await moveWithTransition(block, startX, startY, "is-returning", 220);
  }

  function getCombineLimit() {
    if (gameState.mode !== "time") {
      return 10;
    }

    const config = DIFFICULTY_CONFIGS[gameState.difficulty];
    return config?.combineMax ?? 200;
  }

  function combineBlocks(blockA, blockB) {
    const first = getBlockById(blockA.id);
    const second = getBlockById(blockB.id);

    if (!first || !second) {
      return null;
    }

    const combinedValue = first.value + second.value;
    if (combinedValue > getCombineLimit()) {
      return null;
    }

    const newMetrics = getMetrics(combinedValue);
    let nextX;
    let nextY;

    if (gameState.mode === "time") {
      const minX = Math.min(first.x, second.x);
      const minY = Math.min(first.y, second.y);
      const maxX = Math.max(first.x + first.width, second.x + second.width);
      const maxY = Math.max(first.y + first.height, second.y + second.height);
      nextX = (minX + maxX) / 2 - newMetrics.width / 2;
      nextY = (minY + maxY) / 2 - newMetrics.height / 2;
    } else {
      const bottomEdge = Math.max(
        first.y + first.height,
        second.y + second.height
      );
      const centerX = second.x + second.width / 2;
      nextX = centerX - newMetrics.width / 2;
      nextY = bottomEdge - newMetrics.height;
    }

    removeBlock(first.id);
    removeBlock(second.id);

    return spawnBlock(combinedValue, nextX, nextY, { celebrate: true });
  }

  function setGalaxyMode(enabled) {
    document.body.classList.toggle("galaxy-mode", enabled);
    themeToggle.setAttribute(
      "aria-label",
      enabled ? "Switch to Day Mode" : "Switch to Galaxy Dark Mode"
    );

    try {
      localStorage.setItem("numberblocks-galaxy-mode", enabled ? "1" : "0");
    } catch {
      // Private browsing can disable storage; the toggle still works for this page.
    }
  }

  function initializeTheme() {
    let storedValue = "0";
    try {
      storedValue = localStorage.getItem("numberblocks-galaxy-mode") || "0";
    } catch {
      storedValue = "0";
    }

    setGalaxyMode(storedValue === "1");
  }

  function showDifficultyChoices() {
    modeHome.hidden = true;
    difficultyPanel.hidden = false;
  }

  function showModeChoices() {
    modeHome.hidden = false;
    difficultyPanel.hidden = true;
  }

  function hideModeOverlay() {
    modeOverlay.hidden = true;
  }

  function startSandboxMode() {
    cancelTimer();
    gameState.mode = "sandbox";
    gameState.difficulty = null;
    gameState.target = null;
    gameState.challengeActive = false;
    gameState.trayValues = [...SANDBOX_SOURCE_VALUES];
    challengeHud.hidden = true;
    resetSandbox();
    renderTray();
    hideModeOverlay();
  }

  function startTimeAttack(difficulty) {
    const config = DIFFICULTY_CONFIGS[difficulty];
    if (!config) {
      return;
    }

    ensureAudioContext();
    gameState.mode = "time";
    gameState.difficulty = difficulty;
    gameState.targetHistory = [];
    gameState.trayValues = [...config.trayValues];
    challengeHud.hidden = false;
    renderTray();
    hideModeOverlay();
    startNewTarget();
  }

  function startNewTarget() {
    const config = DIFFICULTY_CONFIGS[gameState.difficulty];
    if (!config) {
      return;
    }

    cancelTimer();
    resetSandbox();
    gameState.target = generateTarget(config);
    gameState.timeLimit = config.duration;
    gameState.timerDeadline = performance.now() + config.duration * 1000;
    gameState.challengeActive = true;
    targetBubble.textContent = `Make the number: ${gameState.target}!`;
    targetBubble.classList.remove("is-won");
    timerFill.style.width = "100%";
    renderTray();
    updateTimer();
  }

  function generateTarget(config) {
    let target = config.minTarget;
    let attempts = 0;

    do {
      target = randomInt(config.minTarget, config.maxTarget);
      attempts += 1;
    } while (
      gameState.targetHistory.includes(target) &&
      attempts < 8
    );

    gameState.targetHistory.push(target);
    if (gameState.targetHistory.length > 6) {
      gameState.targetHistory.shift();
    }

    return target;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function cancelTimer() {
    if (gameState.timerFrame) {
      cancelAnimationFrame(gameState.timerFrame);
      gameState.timerFrame = 0;
    }
  }

  function updateTimer() {
    if (gameState.mode !== "time" || !gameState.challengeActive) {
      return;
    }

    const remaining = Math.max(0, gameState.timerDeadline - performance.now());
    const ratio = clamp(remaining / (gameState.timeLimit * 1000), 0, 1);
    timerFill.style.width = `${ratio * 100}%`;

    if (remaining <= 0) {
      handleTimerExpired();
      return;
    }

    gameState.timerFrame = requestAnimationFrame(updateTimer);
  }

  function handleTimerExpired() {
    gameState.challengeActive = false;
    cancelTimer();
    targetBubble.textContent = "New number coming!";
    window.setTimeout(() => {
      if (gameState.mode === "time" && !gameState.challengeActive) {
        startNewTarget();
      }
    }, 900);
  }

  function checkWinCondition() {
    if (
      gameState.mode !== "time" ||
      !gameState.challengeActive ||
      gameState.target === null
    ) {
      return;
    }

    const winningBlock = activeBlocks.find((block) => block.value === gameState.target);
    if (!winningBlock) {
      return;
    }

    triggerWinSequence(winningBlock);
  }

  function triggerWinSequence(winningBlock) {
    const target = gameState.target;
    gameState.challengeActive = false;
    cancelTimer();
    timerFill.style.width = "100%";
    targetBubble.textContent = `Great! ${target}!`;
    targetBubble.classList.add("is-won");

    const element = blockElements.get(winningBlock.id);
    if (element) {
      element.classList.add("is-celebrating");
      window.setTimeout(() => element.classList.remove("is-celebrating"), 520);
    }

    burstConfetti(winningBlock);
    playCelebrateSound();

    window.setTimeout(() => {
      if (gameState.mode === "time" && !gameState.challengeActive && gameState.target === target) {
        startNewTarget();
      }
    }, 1250);
  }

  function burstConfetti(block) {
    const sandboxRect = sandbox.getBoundingClientRect();
    const originX = sandboxRect.left + block.x + block.width / 2;
    const originY = sandboxRect.top + block.y + block.height / 2;
    const colors = ["#FF1A1A", "#FF8000", "#FFFF00", "#00CC00", "#3399FF", "#8A3FFC"];

    for (let index = 0; index < 34; index += 1) {
      const piece = document.createElement("div");
      const angle = (Math.PI * 2 * index) / 34;
      const distance = randomInt(90, 230);
      piece.className = "confetti-piece";
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      piece.style.background = colors[index % colors.length];
      piece.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
      piece.style.setProperty("--ty", `${Math.sin(angle) * distance + randomInt(120, 230)}px`);
      piece.style.setProperty("--spin", `${randomInt(220, 760)}deg`);
      confettiLayer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 980);
    }
  }

  function ensureAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return audioContext;
  }

  function playCelebrateSound() {
    const context = ensureAudioContext();
    if (!context) {
      return;
    }

    const now = context.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.08);
      gain.gain.setValueAtTime(0.0001, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.14, now + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.26);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + index * 0.08);
      oscillator.stop(now + index * 0.08 + 0.28);
    });
  }

  function handleReset() {
    if (gameState.mode === "time") {
      startNewTarget();
      return;
    }

    resetSandbox();
  }

  function syncLayoutToViewport() {
    resizeFrame = 0;
    configureResponsiveUnit();
    renderTray();

    for (const block of activeBlocks) {
      const metrics = getMetrics(block.value);
      const element = blockElements.get(block.id);
      block.width = metrics.width;
      block.height = metrics.height;

      if (element) {
        renderNumberblock(element, block.value);
      }

      const clamped = clampToSandbox(block.x, block.y, block.width, block.height);
      block.x = clamped.x;
      block.y = clamped.y;
      applyPosition(block);
    }
  }

  function queueLayoutSync() {
    if (resizeFrame) {
      return;
    }

    resizeFrame = requestAnimationFrame(syncLayoutToViewport);
  }

  function preventBrowserGesture(event) {
    event.preventDefault();
  }

  trayLane.addEventListener("pointerdown", handleTrayPointerDown, { passive: false });
  sandbox.addEventListener("pointerdown", handleSandboxPointerDown, { passive: false });
  window.addEventListener("pointermove", handlePointerMove, { passive: false });
  window.addEventListener("pointerup", handlePointerUp, { passive: false });
  window.addEventListener("pointercancel", handlePointerUp, { passive: false });
  window.addEventListener("resize", queueLayoutSync);
  window.addEventListener("orientationchange", queueLayoutSync);
  document.addEventListener("touchmove", preventBrowserGesture, { passive: false });
  document.addEventListener("gesturestart", preventBrowserGesture, { passive: false });
  document.addEventListener("dblclick", preventBrowserGesture, { passive: false });
  resetButton.addEventListener("click", handleReset);
  themeToggle.addEventListener("click", () => {
    setGalaxyMode(!document.body.classList.contains("galaxy-mode"));
  });
  modeOverlay.addEventListener("click", (event) => {
    const modeButton = event.target.closest("[data-mode]");
    const difficultyButton = event.target.closest("[data-difficulty]");

    if (modeButton?.dataset.mode === "sandbox") {
      startSandboxMode();
      return;
    }

    if (modeButton?.dataset.mode === "time") {
      showDifficultyChoices();
      return;
    }

    if (difficultyButton) {
      startTimeAttack(difficultyButton.dataset.difficulty);
    }
  });
  backToModesButton.addEventListener("click", showModeChoices);

  initializeTheme();
  showModeChoices();
  configureResponsiveUnit();
  renderTray();
})();
