function w(r, t, e) {
  return Math.min(Math.max(r, t), e);
}
function S(r, t) {
  const e = t.getBoundingClientRect(), i = r.clientX - e.left - e.width / 2, s = r.clientY - e.top - e.height / 2, n = i / (e.width / 2), a = s / (e.height / 2);
  return {
    x: n,
    y: a
  };
}
function Y(r) {
  return {
    x: r.clientX,
    y: r.clientY
  };
}
function M(r) {
  const t = r.split(",").map((i) => i.trim().toUpperCase()), e = ["X", "Y", "Z"];
  return t.filter(
    (i) => e.includes(i)
  );
}
function k(r, t) {
  let e = !1, i = 0;
  return t ? function(...s) {
    const n = Date.now();
    n - i >= t && (r.apply(this, s), i = n);
  } : function(...s) {
    e || (requestAnimationFrame(() => {
      r.apply(this, s), e = !1;
    }), e = !0);
  };
}
class X {
  constructor(t) {
    if (this.rafId = null, this.handleAttributeChange = (i) => {
      for (const s of i)
        s.type === "attributes" && this.updatePropertiesFromAttributes();
    }, !t.hasAttribute("data-kinesistransformer-element"))
      throw new Error(
        "Element does not have the 'data-kinesistransformer-element' attribute."
      );
    this.element = t, this.updatePropertiesFromAttributes();
    const e = window.getComputedStyle(this.element);
    this.initialTransform = e.transform === "none" ? "" : e.transform, this.element.style.transformOrigin = this.transformOrigin, this.mutationObserver = new MutationObserver(this.handleAttributeChange), this.mutationObserver.observe(this.element, {
      attributes: !0,
      attributeFilter: [
        "data-ks-strength",
        "data-ks-transform",
        "data-ks-transformaxis",
        "data-ks-interactionaxis",
        "data-ks-transformorigin"
      ]
    });
  }
  updatePropertiesFromAttributes() {
    const t = this.element.getAttribute("data-ks-strength"), e = parseFloat(t || "10");
    this.strength = isNaN(e) ? 10 : e, this.type = this.element.getAttribute("data-ks-transform") || "translate";
    const i = this.element.getAttribute("data-ks-transformaxis") || (this.type === "rotate" ? "Z" : "X, Y");
    this.transformAxis = M(i);
    const s = this.element.getAttribute(
      "data-ks-interactionaxis"
    );
    this.interactionAxis = s ? s.trim().toUpperCase() : null, this.interactionAxis && !["X", "Y"].includes(this.interactionAxis) && (console.warn(
      "Invalid value for data-ks-interactionaxis. Acceptable values are 'X' or 'Y'."
    ), this.interactionAxis = null), this.transformOrigin = this.element.getAttribute("data-ks-transformorigin") || "center center", this.element.style.transformOrigin = this.transformOrigin;
  }
  applyTransform(t, e) {
    this.rafId !== null && cancelAnimationFrame(this.rafId), this.rafId = requestAnimationFrame(() => {
      this.performTransform(t, e);
    });
  }
  performTransform(t, e) {
    let i = "";
    const { strength: s, type: n, transformAxis: a, interactionAxis: d } = this;
    d === "X" ? e = 0 : d === "Y" && (t = 0);
    const h = d ? 2 : 1, o = a.length === 1;
    let u = 0;
    switch (o && (u = t * 1 + e * 1), n) {
      case "translate": {
        let l = 0, c = 0, m = 0;
        a.includes("X") && (l = o ? u * s : t * s), a.includes("Y") && (c = o ? u * s : e * s), a.includes("Z") && (m = (t + e) * h * s), i = `translate3d(${l}px, ${c}px, ${m}px)`;
        break;
      }
      case "rotate": {
        let l = 0, c = 0, m = 0;
        a.includes("X") && (l = o ? u * s : e * s), a.includes("Y") && (c = o ? u * s : t * s), a.includes("Z") && (m = (t + e) * h * s), i = `rotate3d(${l !== 0 ? 1 : 0}, ${c !== 0 ? 1 : 0}, ${m !== 0 ? 1 : 0}, ${l || c || m}deg)`;
        break;
      }
      case "scale": {
        let l = 1, c = 1, m = 1;
        a.includes("X") && (l = o ? 1 + u * s * 0.01 : 1 + t * s * 0.01), a.includes("Y") && (c = o ? 1 + u * s * 0.01 : 1 + e * s * 0.01), a.includes("Z") && (m = 1 + (t + e) * h * s * 0.01), i = `scale3d(${l}, ${c}, ${m})`;
        break;
      }
      case "tilt": {
        let l = 0, c = 0;
        a.includes("X") && (l = o ? u * s : e * s), a.includes("Y") && (c = o ? u * s : t * s), i = `rotateX(${l}deg) rotateY(${-c}deg) translate3d(0,0,${s * 2}px)`;
        break;
      }
      case "tilt_inv": {
        let l = 0, c = 0;
        a.includes("X") && (l = o ? u * s : e * s), a.includes("Y") && (c = o ? u * s : t * s), i = `rotateX(${-l}deg) rotateY(${c}deg) translate3d(0,0,${s * 2}px)`;
        break;
      }
    }
    this.element.style.transform = `${this.initialTransform} ${i}`.trim(), this.rafId = null;
  }
  resetTransform() {
    this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null), this.element.style.transform = this.initialTransform;
  }
  destroy() {
    this.mutationObserver.disconnect();
  }
}
class O {
  constructor(t, e = {}) {
    if (this.elements = [], this.isActive = !0, this.initialTransform = "", this.interaction = "mouse", this.observer = null, this.perspective = "1000px", this.isMouseInside = !1, this.preserve3d = !0, this.scrollElement = window, this.onScrollBound = this.onScroll.bind(this), !t.hasAttribute("data-kinesistransformer"))
      throw new Error(
        "Container does not have the 'data-kinesistransformer' attribute."
      );
    this.container = t, this.options = e, this.updatePropertiesFromAttributes();
    const i = window.getComputedStyle(this.container);
    this.initialTransform = i.transform === "none" ? "" : i.transform, this.init(), this.mutationObserver = new MutationObserver(
      this.handleAttributeChange.bind(this)
    ), this.mutationObserver.observe(this.container, {
      attributes: !0,
      attributeFilter: [
        "data-ks-active",
        "data-ks-duration",
        "data-ks-easing",
        "data-ks-interaction",
        "data-ks-perspective",
        "data-ks-preserve3d",
        "data-ks-scroll-element"
      ]
    });
  }
  updatePropertiesFromAttributes() {
    const t = this.container.getAttribute("data-ks-active");
    this.isActive = t !== "false";
    const e = this.container.getAttribute("data-ks-interaction");
    this.interaction = e === "scroll" ? "scroll" : "mouse";
    const i = this.container.getAttribute("data-ks-perspective");
    this.perspective = i || "1000px";
    const s = this.container.getAttribute("data-ks-preserve3d");
    this.preserve3d = s !== "false";
    const n = this.container.getAttribute(
      "data-ks-scroll-element"
    );
    if (this.interaction === "scroll" && n) {
      const a = document.querySelector(n);
      a ? this.scrollElement = a : (console.warn(
        `Scroll element '${n}' not found. Falling back to window.`
      ), this.scrollElement = window);
    } else
      this.scrollElement = window;
    this.options.duration = parseInt(
      this.container.getAttribute("data-ks-duration") || "1000",
      10
    ), this.options.easing = this.container.getAttribute("data-ks-easing") || "cubic-bezier(0.23, 1, 0.32, 1)";
  }
  handleAttributeChange(t) {
    for (const e of t)
      e.type === "attributes" && (this.updatePropertiesFromAttributes(), this.init());
  }
  init() {
    this.destroy(), this.container.querySelectorAll(
      "[data-kinesistransformer-element]"
    ).forEach((i) => {
      const s = new X(i);
      i.style.transition = `transform ${this.options.duration}ms ${this.options.easing}`, this.elements.push(s);
    }), (this.elements.some(
      (i) => i.transformAxis.includes("Z")
    ) || this.perspective) && this.preserve3d ? (this.container.style.perspective = this.perspective, this.container.style.transformStyle = "preserve-3d") : this.container.style.perspective = this.perspective, this.interaction === "mouse" ? this.bindMoveEvents() : this.interaction === "scroll" && this.setupScrollInteraction();
  }
  bindMoveEvents() {
    this.isActive && (this.container.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this),
      { passive: !0 }
    ), this.container.addEventListener(
      "mouseleave",
      this.onMouseLeave.bind(this),
      { passive: !0 }
    ), this.container.addEventListener(
      "mouseenter",
      this.onMouseEnter.bind(this),
      { passive: !0 }
    ));
  }
  onMouseEnter() {
    this.isMouseInside = !0;
  }
  onMouseMove(t) {
    if (!this.isMouseInside) return;
    const e = S(t, this.container);
    this.elements.forEach((i) => {
      i.applyTransform(e.x, e.y);
    });
  }
  onMouseLeave() {
    this.isMouseInside = !1, this.elements.forEach((t) => {
      t.resetTransform();
    });
  }
  setupScrollInteraction() {
    this.isActive && (this.observer = new IntersectionObserver(
      (t) => {
        t.forEach((e) => {
          e.isIntersecting ? this.startScrollAnimation() : this.resetScrollAnimation();
        });
      },
      {
        threshold: 0.1
      }
    ), this.observer.observe(this.container));
  }
  startScrollAnimation() {
    this.scrollElement.addEventListener("scroll", this.onScrollBound, {
      passive: !0
    }), this.onScroll();
  }
  resetScrollAnimation() {
    this.scrollElement.removeEventListener("scroll", this.onScrollBound), this.elements.forEach((t) => {
      t.resetTransform();
    });
  }
  onScroll() {
    let t, e;
    this.scrollElement instanceof Window ? (t = this.container.getBoundingClientRect(), e = window.innerHeight, window.pageYOffset || document.documentElement.scrollTop) : (t = this.container.getBoundingClientRect(), this.scrollElement.getBoundingClientRect(), e = this.scrollElement.clientHeight, this.scrollElement.scrollTop);
    const i = w(
      (e - t.top) / (e + t.height),
      0,
      1
    );
    this.elements.forEach((s) => {
      const n = i, a = i;
      s.applyTransform(n, a);
    });
  }
  destroy() {
    var t, e;
    this.container.removeEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    ), this.container.removeEventListener(
      "mouseleave",
      this.onMouseLeave.bind(this)
    ), this.container.removeEventListener(
      "mouseenter",
      this.onMouseEnter.bind(this)
    ), this.scrollElement.removeEventListener("scroll", this.onScrollBound), (t = this.observer) == null || t.disconnect(), (e = this.mutationObserver) == null || e.disconnect(), this.elements.forEach((i) => {
      i.destroy();
    }), this.elements = [];
  }
}
class F {
  constructor(t) {
    if (!t.hasAttribute("data-kinesisdepth-element"))
      throw new Error(
        "Element does not have the 'data-kinesisdepth-element' attribute."
      );
    this.element = t, this.depth = parseFloat(t.getAttribute("data-ks-depth") || "10");
    const e = window.getComputedStyle(this.element);
    this.initialTransform = e.transform === "none" ? "" : e.transform, this.element.style.transform = `${this.initialTransform} translateZ(0px)`, this.element.style.transition = "transform 1s cubic-bezier(0.23, 1, 0.32, 1)";
  }
  applyDepth(t) {
    this.element.style.transform = `${this.initialTransform} translateZ(${t}px)`;
  }
  resetDepth() {
    this.element.style.transform = `${this.initialTransform} translateZ(0px)`;
  }
}
class P {
  constructor(t, e = {}) {
    if (this.elements = [], this.observer = null, this.isMouseInside = !1, this.onMouseEnter = () => {
      this.isMouseInside = !0, this.elements.forEach((s) => {
        s.applyDepth(s.depth);
      });
    }, this.onMouseMove = (s) => {
      if (!this.isMouseInside) return;
      const n = S(s, this.container), a = n.y * this.sensitivity * (this.inverted ? -1 : 1), d = n.x * this.sensitivity * (this.inverted ? -1 : 1);
      this.container.style.transform = `${this.initialTransform} rotateX(${a}deg) rotateY(${d}deg)`;
    }, this.onMouseLeave = () => {
      this.isMouseInside = !1, this.container.style.transform = this.initialTransform, this.elements.forEach((s) => {
        s.resetDepth();
      }), this.container.removeEventListener("mousemove", this.onMouseMove);
    }, !t.hasAttribute("data-kinesisdepth"))
      throw new Error(
        "Container does not have the 'data-kinesisdepth' attribute."
      );
    this.container = t, this.options = {
      active: e.active !== void 0 ? e.active : !0,
      duration: e.duration !== void 0 ? e.duration : 1e3,
      easing: e.easing !== void 0 ? e.easing : "cubic-bezier(0.23, 1, 0.32, 1)",
      perspective: e.perspective !== void 0 ? e.perspective : 1e3,
      sensitivity: e.sensitivity !== void 0 ? e.sensitivity : 40,
      inverted: e.inverted !== void 0 ? e.inverted : !1
    }, this.throttleDuration = parseInt(
      t.getAttribute("data-ks-throttle") || "100",
      10
    ), this.isActive = this.options.active, this.perspective = this.options.perspective, this.sensitivity = this.options.sensitivity, this.inverted = this.options.inverted;
    const i = window.getComputedStyle(this.container);
    this.initialTransform = i.transform === "none" ? "" : i.transform, this.init();
  }
  init() {
    this.container.querySelectorAll(
      "[data-kinesisdepth-element]"
    ).forEach((e) => {
      const i = new F(e);
      this.elements.push(i);
    }), this.container.style.perspective = `${this.perspective}px`, this.container.style.transformStyle = "preserve-3d", this.container.style.position = "relative", this.container.style.transition = `transform ${this.options.duration}ms ${this.options.easing}`, this.isActive && this.bindHoverEvents();
  }
  bindHoverEvents() {
    this.container.addEventListener("mouseenter", this.onMouseEnter), this.container.addEventListener("mousemove", k(this.onMouseMove)), this.container.addEventListener("mouseleave", this.onMouseLeave);
  }
}
class L {
  constructor(t) {
    if (this.previousValue = 0, !t.hasAttribute("data-kinesisaudio-element"))
      throw new Error(
        "Element does not have the 'data-kinesisaudio-element' attribute."
      );
    this.element = t, this.audioIndex = parseInt(
      t.getAttribute("data-ks-audioindex") || "50"
    ), this.strength = parseFloat(
      t.getAttribute("data-ks-strength") || "10"
    ), this.transform = t.getAttribute("data-ks-transform") || "translate", this.transformOrigin = t.getAttribute("data-ks-transformorigin") || "center";
    const e = t.getAttribute("data-ks-transformaxis");
    e ? (this.transformAxis = M(e), this.transformAxis.length === 0 && (this.transformAxis = this.getDefaultAxes())) : this.transformAxis = this.getDefaultAxes();
    const i = window.getComputedStyle(this.element);
    this.initialTransform = i.transform === "none" ? "" : i.transform, this.element.style.transformOrigin = this.transformOrigin, this.element.style.transform = this.initialTransform, this.element.style.setProperty("--transform-duration", "0.1s"), this.element.style.transition = "transform var(--transform-duration) ease-out", this.element.style.willChange = "transform";
  }
  getDefaultAxes() {
    switch (this.transform) {
      case "translate":
        return ["Y"];
      case "rotate":
        return ["Z"];
      case "scale":
      default:
        return ["X", "Y"];
    }
  }
  applyTransform(t) {
    const { strength: e, transform: i, transformAxis: s } = this, n = [];
    s.forEach((h) => {
      switch (i) {
        case "translate": {
          if (["X", "Y", "Z"].includes(h)) {
            const o = t * e, u = h === "X" ? o : 0, l = h === "Y" ? o : 0, c = h === "Z" ? o : 0;
            n.push(
              `translate3d(${u}px, ${l}px, ${c}px)`
            );
          }
          break;
        }
        case "rotate": {
          if (["X", "Y", "Z"].includes(h)) {
            const o = t * e;
            n.push(`rotate${h}(${o}deg)`);
          }
          break;
        }
        case "scale": {
          if (["X", "Y", "Z"].includes(h)) {
            const o = 1 + t * e * 0.1, u = h === "X" ? o : 1, l = h === "Y" ? o : 1, c = h === "Z" ? o : 1;
            n.push(`scale3d(${u}, ${l}, ${c})`);
          }
          break;
        }
      }
    });
    const a = n.join(" ");
    t > this.previousValue ? this.element.style.setProperty("--transform-duration", "0.05s") : this.element.style.setProperty("--transform-duration", "0.3s"), this.element.style.transform = `${this.initialTransform} ${a}`.trim(), this.previousValue = t;
  }
  resetTransform() {
    this.element.style.setProperty("--transform-duration", "0.5s"), this.element.style.transform = this.initialTransform, this.previousValue = 0;
  }
}
class Z {
  constructor(t, e) {
    if (this.elements = [], this.audioContext = null, this.analyser = null, this.dataArray = null, this.source = null, this.audioElement = null, this.animationId = null, this.observer = null, this.mutationObserver = null, this.isAnimating = !1, this.smoothingFactor = 0.8, this.smoothedData = null, !t.hasAttribute("data-kinesisaudio"))
      throw new Error(
        "Container does not have the 'data-kinesisaudio' attribute."
      );
    this.container = t, this.options = {
      active: e.active ?? !0,
      duration: e.duration ?? 1e3,
      easing: e.easing ?? "cubic-bezier(0.23, 1, 0.32, 1)",
      tag: e.tag ?? "div",
      perspective: e.perspective ?? 1e3,
      audio: e.audio,
      playAudio: e.playAudio ?? !1
    }, this.isActive = this.options.active, this.perspective = this.options.perspective, this.audioSrc = this.options.audio, this.playAudio = this.options.playAudio;
    const i = window.getComputedStyle(this.container);
    this.initialTransform = i.transform === "none" ? "" : i.transform, this.throttledAnimate = k(this.animate.bind(this)), this.init();
  }
  init() {
    this.container.querySelectorAll(
      "[data-kinesisaudio-element]"
    ).forEach((e) => {
      const i = new L(e);
      this.elements.push(i);
    }), this.container.style.perspective = `${this.perspective}px`, this.container.style.transformStyle = "preserve-3d", this.container.style.position = "relative", this.setupAudioElement(this.audioSrc), this.initIntersectionObserver(), this.initMutationObserver(), this.container._kinesisAudio = this;
  }
  setupAudioElement(t) {
    this.audioElement && (this.audioElement.pause(), this.audioElement.remove(), this.audioElement = null), this.audioElement = document.createElement("audio"), this.audioElement.src = t, this.audioElement.crossOrigin = "anonymous", this.audioElement.style.display = "none", this.container.appendChild(this.audioElement), this.initializeAudioContext(), this.playAudio && this.play();
  }
  initializeAudioContext() {
    this.audioContext && (this.audioContext.close(), this.audioContext = null), this.audioContext = new (window.AudioContext || window.webkitAudioContext)(), this.analyser = this.audioContext.createAnalyser(), this.analyser.fftSize = 256, this.analyser.smoothingTimeConstant = this.smoothingFactor;
    const t = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(t), this.smoothedData = new Uint8Array(t), this.smoothedData.fill(0), this.audioElement && (this.source = this.audioContext.createMediaElementSource(
      this.audioElement
    ), this.source.connect(this.analyser), this.analyser.connect(this.audioContext.destination));
  }
  initIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (t) => {
        t.forEach((e) => {
          e.isIntersecting ? this.resume() : this.pause();
        });
      },
      {
        root: null,
        threshold: 0.1
      }
    ), this.observer.observe(this.container);
  }
  initMutationObserver() {
    this.mutationObserver = new MutationObserver((t) => {
      t.forEach((e) => {
        if (e.type === "attributes" && (e.attributeName === "data-ks-playaudio" || e.attributeName === "data-ks-audio")) {
          const i = this.container.getAttribute("data-ks-playaudio") === "true", s = this.container.getAttribute("data-ks-audio");
          e.attributeName === "data-ks-playaudio" && (i ? this.play() : this.stop()), e.attributeName === "data-ks-audio" && s && (this.audioSrc = s, this.setupAudioElement(this.audioSrc));
        }
      });
    }), this.mutationObserver.observe(this.container, {
      attributes: !0,
      attributeFilter: ["data-ks-playaudio", "data-ks-audio"]
    });
  }
  play() {
    var t;
    this.audioElement && (this.audioElement.play(), (t = this.audioContext) == null || t.resume(), this.resume(), this.smoothedData && this.smoothedData.fill(0));
  }
  resume() {
    this.isAnimating || (this.isAnimating = !0, this.throttledAnimate());
  }
  pause() {
    this.isAnimating && (this.isAnimating = !1, this.animationId && (cancelAnimationFrame(this.animationId), this.animationId = null), this.resetTransforms());
  }
  stop() {
    this.audioElement && (this.audioElement.pause(), this.audioElement.currentTime = 0, this.pause(), this.smoothedData && this.smoothedData.fill(0));
  }
  animate() {
    if (!this.isAnimating || !this.analyser || !this.dataArray) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    for (let e = 0; e < this.dataArray.length; e++)
      this.smoothedData[e] = this.smoothedData[e] * this.smoothingFactor + this.dataArray[e] * (1 - this.smoothingFactor);
    const t = Array.from(this.smoothedData).map(
      (e) => e / 255
    );
    this.elements.forEach((e) => {
      const i = t[e.audioIndex];
      e.applyTransform(i);
    }), this.animationId = requestAnimationFrame(this.throttledAnimate);
  }
  resetTransforms() {
    this.elements.forEach((t) => {
      t.resetTransform();
    });
  }
  destroy() {
    var t, e, i, s, n, a, d;
    (t = this.observer) == null || t.disconnect(), (e = this.mutationObserver) == null || e.disconnect(), (i = this.audioElement) == null || i.pause(), (s = this.audioElement) == null || s.remove(), (n = this.source) == null || n.disconnect(), (a = this.analyser) == null || a.disconnect(), (d = this.audioContext) == null || d.close();
  }
}
class z {
  constructor(t, e = {}) {
    if (this.observer = null, this.onScroll = () => {
      const s = this.element.getBoundingClientRect(), n = window.innerHeight, a = w(
        (n - s.top) / (n + s.height),
        0,
        1
      );
      this.applyTransform(a);
    }, !t.hasAttribute("data-kinesisscroll-item"))
      throw new Error(
        "Element does not have the 'data-kinesisscroll-item' attribute."
      );
    this.element = t, this.options = {
      active: e.active !== void 0 ? e.active : !0,
      duration: e.duration || parseInt(t.getAttribute("data-ks-duration") || "1000"),
      easing: e.easing || t.getAttribute("data-ks-easing") || "cubic-bezier(0.23, 1, 0.32, 1)",
      transformType: e.transformType || t.getAttribute("data-ks-transform") || "translate",
      transformAxis: e.transformAxis || t.getAttribute("data-ks-transformaxis"),
      strength: e.strength !== void 0 ? e.strength : parseFloat(t.getAttribute("data-ks-strength") || "10")
    }, this.throttleDuration = parseInt(
      t.getAttribute("data-ks-throttle") || "100",
      10
    ), this.isActive = this.options.active, this.transformType = this.options.transformType, this.transformAxis = M(
      this.options.transformAxis || (this.transformType === "rotate" ? "Z" : "X, Y")
    ), this.strength = this.options.strength;
    const i = window.getComputedStyle(this.element);
    this.initialTransform = i.transform === "none" ? "" : i.transform, this.init();
  }
  init() {
    this.element.style.transition = `transform ${this.options.duration}ms ${this.options.easing}`, this.isActive && this.setupScrollInteraction();
  }
  setupScrollInteraction() {
    this.observer = new IntersectionObserver(
      (t) => {
        t.forEach((e) => {
          e.isIntersecting ? this.startScrollAnimation() : this.resetTransform();
        });
      },
      {
        threshold: 0
      }
    ), this.observer.observe(this.element);
  }
  startScrollAnimation() {
    window.addEventListener("scroll", k(this.onScroll)), this.onScroll();
  }
  applyTransform(t) {
    let e = "";
    const { strength: i, transformType: s, transformAxis: n } = this, a = t * i;
    switch (s) {
      case "translate": {
        const d = n.includes("X") ? a : 0, h = n.includes("Y") ? a : 0, o = n.includes("Z") ? a : 0;
        e = `translate3d(${d}px, ${h}px, ${o}px)`;
        break;
      }
      case "rotate": {
        const d = n.includes("X") ? a : 0, h = n.includes("Y") ? a : 0, o = n.includes("Z") ? a : 0;
        e = `rotate3d(${d !== 0 ? 1 : 0}, ${h !== 0 ? 1 : 0}, ${o !== 0 ? 1 : 0}, ${d || h || o}deg)`;
        break;
      }
      case "scale": {
        const d = n.includes("X") ? 1 + a * 0.01 : 1, h = n.includes("Y") ? 1 + a * 0.01 : 1, o = n.includes("Z") ? 1 + a * 0.01 : 1;
        e = `scale3d(${d}, ${h}, ${o})`;
        break;
      }
    }
    this.element.style.transform = `${this.initialTransform} ${e}`.trim();
  }
  resetTransform() {
    this.element.style.transform = this.initialTransform, window.removeEventListener("scroll", this.onScroll);
  }
}
class N {
  constructor(t, e, i) {
    if (!t.hasAttribute("data-kinesispath-element"))
      throw new Error(
        "Element does not have the 'data-kinesispath-element' attribute."
      );
    this.element = t, this.strength = parseFloat(t.getAttribute("data-ks-strength") || "1"), this.initialOffset = parseFloat(
      t.getAttribute("data-ks-offset") || "0"
    ), this.pathData = e, this.pathLength = i, this.element.style.offsetPath = `path('${this.pathData}')`, this.element.style.offsetDistance = `${this.initialOffset}%`, this.transitionDuration = parseInt(
      t.getAttribute("data-ks-duration") || "1000",
      10
    );
    const s = t.getAttribute("data-ks-easing") || "cubic-bezier(0.23, 1, 0.32, 1)";
    this.element.style.transition = `offset-distance ${this.transitionDuration}ms ${s}`;
  }
  updatePosition(t) {
    const e = t * this.strength, i = (this.initialOffset + e * 100) % 100;
    this.element.style.offsetDistance = `${i}%`;
  }
  resetPosition(t) {
    setTimeout(() => {
      this.element.style.offsetDistance = `${this.initialOffset}%`;
    }, t);
  }
}
class q {
  constructor(t, e = {}) {
    if (this.elements = [], this.onMouseMove = (i) => {
      const n = (S(i, this.container).x + 1) / 2;
      this.elements.forEach((a) => {
        a.updatePosition(n);
      });
    }, this.onMouseLeave = () => {
      this.elements.forEach((i) => {
        i.resetPosition(this.throttleDuration);
      });
    }, this.onScroll = () => {
      const i = this.container.getBoundingClientRect(), s = window.innerHeight, n = w(
        (s - i.top) / (s + i.height),
        0,
        1
      );
      this.elements.forEach((a) => {
        a.updatePosition(n);
      });
    }, !t.hasAttribute("data-kinesispath"))
      throw new Error(
        "Container does not have the 'data-kinesispath' attribute."
      );
    if (this.container = t, this.options = {
      active: e.active !== void 0 ? e.active : !0,
      duration: e.duration || parseInt(t.getAttribute("data-ks-duration") || "800", 10),
      easing: e.easing || t.getAttribute("data-ks-easing") || "cubic-bezier(0.23, 1, 0.32, 1)",
      path: e.path || t.getAttribute("data-ks-path") || "",
      interaction: e.interaction || t.getAttribute("data-ks-interaction") || "mouse"
    }, this.throttleDuration = parseInt(
      t.getAttribute("data-ks-throttle") || "100",
      10
    ), this.isActive = this.options.active, this.interaction = this.options.interaction, !this.options.path)
      throw new Error("No global path data provided for KinesisPath.");
    this.globalPath = this.options.path, this.globalPathLength = this.calculatePathLength(this.globalPath), this.init();
  }
  init() {
    this.container.querySelectorAll(
      "[data-kinesispath-element]"
    ).forEach((e) => {
      const i = e.getAttribute("data-ks-path") || this.globalPath;
      if (!i)
        throw new Error(
          "No path data provided for KinesisPathElement. Please provide a global path or a specific path for the element."
        );
      const s = this.calculatePathLength(i), n = new N(
        e,
        i,
        s
      );
      this.elements.push(n);
    }), this.container.style.position = "relative", this.isActive && (this.interaction === "mouse" ? this.bindMoveEvents() : this.interaction === "scroll" && this.bindScrollEvents());
  }
  calculatePathLength(t) {
    const i = document.createElementNS("http://www.w3.org/2000/svg", "path");
    return i.setAttribute("d", t), i.getTotalLength();
  }
  bindMoveEvents() {
    this.container.addEventListener(
      "mousemove",
      k(this.onMouseMove, this.throttleDuration)
    ), this.container.addEventListener("mouseleave", this.onMouseLeave);
  }
  bindScrollEvents() {
    window.addEventListener(
      "scroll",
      k(this.onScroll, this.throttleDuration)
    ), this.onScroll();
  }
}
class B {
  constructor(t, e = {}) {
    if (this.mouseX = 0, this.mouseY = 0, this.animationId = null, this.MIN_DISTANCE = 1e-4, this.onMouseMove = (s) => {
      const n = Y(s);
      this.mouseX = n.x, this.mouseY = n.y;
    }, !t.hasAttribute("data-kinesisdistance-item"))
      throw new Error(
        "Element does not have the 'data-kinesisdistance-item' attribute."
      );
    this.element = t, this.options = {
      active: e.active !== void 0 ? e.active : !0,
      strength: e.strength !== void 0 ? e.strength : 20,
      transformOrigin: e.transformOrigin || "center",
      startDistance: e.startDistance !== void 0 ? e.startDistance : parseInt(
        t.getAttribute("data-ks-startdistance") || "100",
        10
      ),
      interactionType: e.interactionType || t.getAttribute("data-ks-interaction") || "linear",
      transformType: e.transformType || t.getAttribute("data-ks-transform") || "translate"
    }, this.duration = parseInt(
      t.getAttribute("data-ks-duration") || "1000",
      10
    ), this.easing = t.getAttribute("data-ks-easing") || "cubic-bezier(0.23, 1, 0.32, 1)", this.isActive = this.options.active, this.minimumDistance = parseInt(
      t.getAttribute("data-ks-min-distance") || "5",
      10
    );
    const i = window.getComputedStyle(this.element);
    this.initialTransform = i.transform === "none" ? "" : i.transform, this.element.style.transformOrigin = this.options.transformOrigin, this.element.style.transform = this.initialTransform, this.element.style.transition = `transform ${this.duration}ms ${this.easing}`, this.isActive && this.bindEvents();
  }
  bindEvents() {
    window.addEventListener("mousemove", this.onMouseMove), this.animate();
  }
  calculateDistance() {
    const t = this.element.getBoundingClientRect(), e = t.left + t.width / 2, i = t.top + t.height / 2, s = this.mouseX - e, n = this.mouseY - i;
    return Math.sqrt(s * s + n * n);
  }
  getInteractionFactor(t) {
    const { interactionType: e, startDistance: i } = this.options, s = w(t / i, 0, 1);
    switch (e) {
      case "linear":
      case "attraction":
      case "repulsion":
        return 1 - s;
      default:
        return 1;
    }
  }
  applyTransform() {
    const t = this.calculateDistance(), { transformType: e, interactionType: i } = this.options;
    if (t < this.options.startDistance) {
      let s = this.getInteractionFactor(t), n = "";
      const a = this.element.getBoundingClientRect(), d = a.left + a.width / 2, h = a.top + a.height / 2, o = this.mouseX - d, u = this.mouseY - h, l = Math.max(t, this.MIN_DISTANCE), c = o / l, m = u / l;
      switch (e) {
        case "translate":
          let g = 0, y = 0;
          if (i === "repulsion") {
            const A = this.options.strength * s;
            g = -c * A, y = -m * A;
          } else if (t > this.minimumDistance) {
            const A = Math.min(
              this.options.strength * s,
              t - this.minimumDistance
            );
            g = c * A, y = m * A;
          } else
            g = 0, y = 0;
          n = `translate(${g}px, ${y}px)`;
          break;
        case "rotate":
          let b = Math.atan2(u, o) * 180 / Math.PI;
          i === "repulsion" && (b += 180), b = (b % 360 + 360) % 360;
          const I = b, C = this.initialTransform;
          let x = 0;
          const D = C.match(/rotate\(([-\d.]+)deg\)/);
          D && (x = parseFloat(D[1]));
          let T = I - x;
          T = (T + 180) % 360 - 180, b = x + T * s, n = `rotate(${b}deg)`;
          break;
        case "scale":
          i === "repulsion" ? n = `scale(${1 - this.options.strength / 100 * s})` : n = `scale(${1 + this.options.strength / 100 * s})`;
          break;
      }
      this.element.style.transform = `${this.initialTransform} ${n}`.trim();
    } else
      this.element.style.transform = this.initialTransform;
  }
  animate() {
    this.applyTransform(), this.animationId = requestAnimationFrame(() => this.animate());
  }
  destroy() {
    window.removeEventListener("mousemove", this.onMouseMove), this.animationId && cancelAnimationFrame(this.animationId);
  }
}
function v(r, t, e) {
  const i = r.getAttribute(t);
  return i !== null ? i !== "false" : e;
}
function p(r, t, e) {
  const i = parseInt(r.getAttribute(t) || "", 10);
  return isNaN(i) ? e : i;
}
function $(r, t, e) {
  const i = parseFloat(r.getAttribute(t) || "");
  return isNaN(i) ? e : i;
}
function f(r, t, e) {
  const i = r.getAttribute(t);
  return i !== null ? i : e;
}
function E(r, t, e, i) {
  const s = r.getAttribute(t);
  return e.includes(s) ? s : i;
}
function K() {
  const r = [
    "translate",
    "rotate",
    "scale",
    "tilt",
    "tilt_inv"
  ];
  function t(s, n, a) {
    document.querySelectorAll(s).forEach((h) => {
      if (!h.hasAttribute("data-ks-initialized"))
        try {
          const o = n(h);
          new a(h, o), h.setAttribute("data-ks-initialized", "true");
        } catch (o) {
          console.error(
            "Failed to initialize component for element:",
            h,
            o
          );
        }
    });
  }
  function e() {
    t(
      "[data-kinesistransformer]",
      (s) => ({
        active: v(s, "data-ks-active", !0),
        duration: p(s, "data-ks-duration", 1e3),
        easing: f(
          s,
          "data-ks-easing",
          "cubic-bezier(0.23, 1, 0.32, 1)"
        ),
        interaction: E(
          s,
          "data-ks-interaction",
          ["mouse", "scroll"],
          "mouse"
        )
      }),
      O
    ), t(
      "[data-kinesisdepth]",
      (s) => ({
        active: v(s, "data-ks-active", !0),
        duration: p(s, "data-ks-duration", 1e3),
        easing: f(
          s,
          "data-ks-easing",
          "cubic-bezier(0.23, 1, 0.32, 1)"
        ),
        perspective: p(s, "data-ks-perspective", 1e3),
        sensitivity: $(s, "data-ks-sensitivity", 40),
        inverted: v(s, "data-ks-invert", !1)
      }),
      P
    ), t(
      "[data-kinesisaudio]",
      (s) => ({
        active: v(s, "data-ks-active", !0),
        duration: p(s, "data-ks-duration", 1e3),
        easing: f(
          s,
          "data-ks-easing",
          "cubic-bezier(0.23, 1, 0.32, 1)"
        ),
        tag: f(s, "data-ks-tag", "div"),
        perspective: p(s, "data-ks-perspective", 1e3),
        audio: f(s, "data-ks-audio", ""),
        playAudio: v(s, "data-ks-playaudio", !1),
        axis: f(s, "data-ks-axis", "X, Y")
      }),
      Z
    ), t(
      "[data-kinesisscroll-item]",
      (s) => ({
        active: v(s, "data-ks-active", !0),
        duration: p(s, "data-ks-duration", 1e3),
        easing: f(
          s,
          "data-ks-easing",
          "cubic-bezier(0.23, 1, 0.32, 1)"
        ),
        transformType: E(
          s,
          "data-ks-transform",
          r,
          "translate"
        ),
        strength: $(s, "data-ks-strength", 10)
      }),
      z
    ), t(
      "[data-kinesispath]",
      (s) => ({
        active: v(s, "data-ks-active", !0),
        duration: p(s, "data-ks-duration", 1e3),
        easing: f(s, "data-ks-easing", "ease"),
        path: f(s, "data-ks-path", ""),
        interaction: E(
          s,
          "data-ks-interaction",
          ["mouse", "scroll"],
          "mouse"
        )
      }),
      q
    ), t(
      "[data-kinesisdistance-item]",
      (s) => ({
        active: v(s, "data-ks-active", !0),
        strength: $(s, "data-ks-strength", 20),
        transformOrigin: f(
          s,
          "data-ks-transformorigin",
          "center"
        ),
        startDistance: p(s, "data-ks-startdistance", 100),
        transformType: E(
          s,
          "data-ks-transform",
          r,
          "translate"
        ),
        duration: p(s, "data-ks-duration", 1e3),
        easing: f(
          s,
          "data-ks-easing",
          "cubic-bezier(0.23, 1, 0.32, 1)"
        )
      }),
      B
    );
  }
  e(), new MutationObserver((s) => {
    s.forEach((n) => {
      n.addedNodes.forEach((a) => {
        if (!(a instanceof HTMLElement)) return;
        const d = [
          "[data-kinesistransformer]",
          "[data-kinesisdepth]",
          "[data-kinesisaudio]",
          "[data-kinesisscroll-item]",
          "[data-kinesispath]",
          "[data-kinesisdistance-item]"
        ];
        (d.some((h) => a.matches(h)) || a.querySelectorAll(d.join(", ")).length > 0) && e();
      });
    });
  }).observe(document.body, {
    childList: !0,
    subtree: !0
  });
}
window.Kinesis = K;
// export {
//   K as initializeKinesis
// };
