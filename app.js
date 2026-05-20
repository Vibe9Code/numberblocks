(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const SNAP_THRESHOLD = 45;
  const SOURCE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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

  const sandbox = document.querySelector("#sandbox");
  const trayLane = document.querySelector("#trayLane");
  const resetButton = document.querySelector("#resetButton");
  const activeBlocks = [];
  const blockElements = new Map();

  let activeDrag = null;
  let nextId = 1;
  let topZ = 5;
  let resizeFrame = 0;

  window.activeBlocks = activeBlocks;
  window.checkVerticalSnap = checkVerticalSnap;
  window.combineBlocks = combineBlocks;

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

  function getShape(value) {
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
    };
  }

  function getSegmentFill(value, index) {
    if (value === 7) {
      return RAINBOW_SEVEN[index % RAINBOW_SEVEN.length];
    }

    if (value === 10) {
      return index === 0 ? "#FF1A1A" : "#FFFFFF";
    }

    return BLOCK_COLORS[value] || "#FFFFFF";
  }

  function getSegmentStroke(value) {
    if (value === 10) {
      return "#FF1A1A";
    }

    return "rgba(0, 0, 0, 0.28)";
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
    block.appendChild(createFaceContainer(value, metrics));
  }

  function createBodySvg(value, metrics) {
    const svg = document.createElementNS(SVG_NS, "svg");
    const viewWidth = metrics.columns * 100;
    const viewHeight = metrics.rows * 100;
    svg.setAttribute("class", "block-body");
    svg.setAttribute("viewBox", `0 0 ${viewWidth} ${viewHeight}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("xmlns", SVG_NS);

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
        rect.setAttribute("fill", getSegmentFill(value, index));
        rect.setAttribute("stroke", getSegmentStroke(value));
        rect.setAttribute("stroke-width", "1");
        svg.appendChild(rect);
        index += 1;
      }
    }

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

    return svg;
  }

  function renderTray() {
    trayLane.innerHTML = "";
    const laneWidth = trayLane.clientWidth || 720;
    const laneHeight = trayLane.clientHeight || 110;
    const columns = laneWidth < 620 ? 5 : SOURCE_VALUES.length;
    const rows = Math.ceil(SOURCE_VALUES.length / columns);
    const gap = laneWidth < 620 ? 8 : 10;
    const cellWidth = Math.max(36, Math.floor((laneWidth - gap * (columns - 1)) / columns));
    const cellHeight = Math.max(42, Math.floor((laneHeight - gap * (rows - 1)) / rows));
    const visualWidth = Math.max(24, cellWidth - 16);
    const visualHeight = Math.max(20, cellHeight - 40);

    for (const value of SOURCE_VALUES) {
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
      source.className = "tray-source";
      source.type = "button";
      source.dataset.value = String(value);
      source.setAttribute("aria-label", `Spawn Numberblock ${value}`);
      source.appendChild(createNumberblockElement(value, {
        preview: true,
        unitOverride: previewUnit,
      }));
      trayLane.appendChild(source);
    }
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
    if (!source || activeDrag) {
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

  async function settleDrop(block, drag) {
    const snap = checkVerticalSnap(block);

    if (!snap) {
      return;
    }

    const combinedValue = block.value + snap.target.value;
    if (combinedValue > 10) {
      await rejectAndReturn(block, drag.startX, drag.startY);
      return;
    }

    await moveWithTransition(block, snap.x, snap.y, "is-snapping", 100, false);
    combineBlocks(block, snap.target);
  }

  function moveWithTransition(block, x, y, className, duration, shouldClamp = true) {
    const element = blockElements.get(block.id);

    if (!element) {
      return Promise.resolve();
    }

    element.classList.add("is-settling", className);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setBlockPosition(block, x, y, shouldClamp);
        window.setTimeout(() => {
          element.classList.remove("is-settling", className);
          resolve();
        }, duration);
      });
    });
  }

  async function rejectAndReturn(block, startX, startY) {
    const element = blockElements.get(block.id);
    if (!element) {
      return;
    }

    element.classList.add("is-rejected", "is-settling");
    await wait(230);
    element.classList.remove("is-rejected");
    await moveWithTransition(block, startX, startY, "is-returning", 220);
  }

  function wait(duration) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, duration);
    });
  }

  function combineBlocks(blockA, blockB) {
    const first = getBlockById(blockA.id);
    const second = getBlockById(blockB.id);

    if (!first || !second) {
      return null;
    }

    const combinedValue = first.value + second.value;
    if (combinedValue > 10) {
      return null;
    }

    const newMetrics = getMetrics(combinedValue);
    const bottomEdge = Math.max(
      first.y + first.height,
      second.y + second.height
    );
    const centerX = second.x + second.width / 2;
    const nextX = centerX - newMetrics.width / 2;
    const nextY = bottomEdge - newMetrics.height;

    removeBlock(first.id);
    removeBlock(second.id);

    return spawnBlock(combinedValue, nextX, nextY, { celebrate: true });
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
  resetButton.addEventListener("click", resetSandbox);

  configureResponsiveUnit();
  renderTray();
})();
