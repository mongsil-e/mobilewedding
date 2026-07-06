import * as THREE from 'three';
import { reducedMotion } from './dom';

const PHOTO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const PHOTO_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uTex;
  uniform float uTime;
  uniform vec2 uUvScale;
  uniform vec2 uUvOffset;
  uniform vec2 uPointer;    /* -0.5 .. 0.5 */
  uniform float uRipple;    /* decaying strength */
  uniform vec2 uRippleAt;   /* uv */
  uniform float uScroll;    /* 0..1 while hero leaves */
  uniform float uReveal;    /* 0..1 entrance */
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    /* cover-fit uv + gyro/pointer parallax + entrance zoom */
    float zoom = mix(1.14, 1.0, uReveal) + uScroll * 0.08;
    vec2 uv = (vUv - 0.5) / zoom + 0.5;
    uv = uv * uUvScale + uUvOffset;
    uv += uPointer * 0.022;

    /* silk-like idle drift */
    uv.x += sin(uv.y * 7.0 + uTime * 0.28) * 0.0022;
    uv.y += cos(uv.x * 6.0 + uTime * 0.22) * 0.0018;

    /* touch ripple */
    float d = distance(vUv, uRippleAt);
    float wave = sin(d * 42.0 - uTime * 7.0) * exp(-d * 7.0) * uRipple;
    uv += normalize(vUv - uRippleAt + 1e-4) * wave * 0.012;

    vec3 col = texture2D(uTex, uv).rgb;

    /* gentle warm cinematic grade */
    col = mix(col, col * vec3(1.05, 1.0, 0.94), 0.35);
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum), col, 1.06);

    /* vignette */
    float vig = smoothstep(0.95, 0.35, distance(vUv, vec2(0.5, 0.46)));
    col *= mix(0.72, 1.0, vig);

    /* animated film grain */
    float g = hash(vUv * vec2(1280.0, 2400.0) + fract(uTime) * 917.0);
    col += (g - 0.5) * 0.05;

    /* entrance fade from night */
    col = mix(vec3(0.086, 0.075, 0.063), col, smoothstep(0.0, 0.65, uReveal));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const PETAL_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uDpr;
  uniform vec2 uDrift;
  varying float vSeed;
  varying float vFade;

  void main() {
    vSeed = aSeed;
    vec3 p = position;

    float fall = mod(p.y - uTime * aSpeed * 0.055, 1.2) - 0.6;
    p.y = fall;
    p.x += sin(uTime * 0.6 + aSeed * 12.56) * 0.05 + uDrift.x * (0.4 + aSeed * 0.6);
    p.y += uDrift.y * 0.2;

    vFade = smoothstep(0.6, 0.45, abs(fall));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    /* aSize is in CSS px at z≈1; nearer petals render slightly larger */
    gl_PointSize = aSize * uDpr * clamp(1.0 / -mv.z, 0.6, 1.8);
  }
`;

const PETAL_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying float vSeed;
  varying float vFade;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float ang = uTime * (0.4 + vSeed) + vSeed * 6.28;
    float s = sin(ang), co = cos(ang);
    c = mat2(co, -s, s, co) * c;
    c.y *= 2.2; /* ellipse petal */
    float d = length(c);
    float alpha = smoothstep(0.5, 0.18, d) * 0.75 * vFade;
    vec3 col = mix(vec3(0.98, 0.88, 0.86), vec3(0.95, 0.77, 0.72), vSeed);
    gl_FragColor = vec4(col, alpha);
  }
`;

export class HeroGL {
  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private photoU!: Record<string, THREE.IUniform>;
  private petalU!: Record<string, THREE.IUniform>;
  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private pointer = new THREE.Vector2();
  private pointerTarget = new THREE.Vector2();
  private texAspect = 1;
  private disposed = false;

  readonly ok: boolean;

  constructor(private container: HTMLElement, imgUrl: string) {
    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' });
    } catch {
      this.ok = false;
      return;
    }
    this.ok = true;

    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    this.camera.position.z = 1;

    this.photoU = {
      uTex: { value: null },
      uTime: { value: 0 },
      uUvScale: { value: new THREE.Vector2(1, 1) },
      uUvOffset: { value: new THREE.Vector2(0, 0) },
      uPointer: { value: this.pointer },
      uRipple: { value: 0 },
      uRippleAt: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uReveal: { value: 0 },
    };

    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({ vertexShader: PHOTO_VERT, fragmentShader: PHOTO_FRAG, uniforms: this.photoU })
    );
    photo.name = 'photo';
    this.scene.add(photo);

    /* petals */
    const COUNT = reducedMotion ? 0 : 130;
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    const speed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      pos[i * 3 + 2] = -Math.random() * 0.55;
      seed[i] = Math.random();
      size[i] = 5 + Math.random() * 9;
      speed[i] = 0.5 + Math.random() * 1.1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));

    this.petalU = {
      uTime: { value: 0 },
      uDpr: { value: Math.min(devicePixelRatio, 1.75) },
      uDrift: { value: new THREE.Vector2() },
    };

    if (COUNT) {
      const petals = new THREE.Points(
        geo,
        new THREE.ShaderMaterial({
          vertexShader: PETAL_VERT,
          fragmentShader: PETAL_FRAG,
          uniforms: this.petalU,
          transparent: true,
          depthWrite: false,
        })
      );
      petals.position.z = 0.25;
      this.scene.add(petals);
    }

    new THREE.TextureLoader().load(imgUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      this.texAspect = tex.image.width / tex.image.height;
      this.photoU.uTex.value = tex;
      this.resize();
      this.container.closest('.hero')?.classList.add('webgl-on');
    });

    this.resize();
    addEventListener('resize', this.resize);

    /* pointer parallax + tap ripple */
    const hero = container.closest('.hero')!;
    hero.addEventListener('pointermove', (e) => {
      const p = e as PointerEvent;
      const r = hero.getBoundingClientRect();
      this.pointerTarget.set((p.clientX - r.left) / r.width - 0.5, (p.clientY - r.top) / r.height - 0.5);
    });
    hero.addEventListener('pointerdown', (e) => {
      const p = e as PointerEvent;
      const r = hero.getBoundingClientRect();
      (this.photoU.uRippleAt.value as THREE.Vector2).set(
        (p.clientX - r.left) / r.width,
        1 - (p.clientY - r.top) / r.height
      );
      this.photoU.uRipple.value = 1;
    });

    /* gyro drift */
    addEventListener(
      'deviceorientation',
      (e) => {
        if (e.gamma == null || e.beta == null) return;
        (this.petalU.uDrift.value as THREE.Vector2).x = THREE.MathUtils.clamp(e.gamma / 90, -0.5, 0.5);
        this.pointerTarget.x = THREE.MathUtils.clamp(e.gamma / 60, -0.5, 0.5);
        this.pointerTarget.y = THREE.MathUtils.clamp((e.beta - 45) / 90, -0.5, 0.5);
      },
      true
    );

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause();
      else this.play();
    });
  }

  private resize = () => {
    if (!this.ok || this.disposed) return;
    const w = this.container.clientWidth || innerWidth;
    const h = this.container.clientHeight || innerHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    /* size photo plane to fill frustum at z=0 */
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.camera.position.z;
    const vw = vh * this.camera.aspect;
    const photo = this.scene.getObjectByName('photo') as THREE.Mesh;
    photo.scale.set(vw, vh, 1);

    /* cover-fit uv */
    const planeAspect = vw / vh;
    const scale = this.photoU.uUvScale.value as THREE.Vector2;
    const offset = this.photoU.uUvOffset.value as THREE.Vector2;
    if (planeAspect > this.texAspect) {
      scale.set(1, this.texAspect / planeAspect);
      offset.set(0, (1 - scale.y) / 2);
    } else {
      scale.set(planeAspect / this.texAspect, 1);
      offset.set((1 - scale.x) / 2, 0);
    }
  };

  private tick = () => {
    if (!this.running) return;
    const t = this.clock.getElapsedTime();
    this.photoU.uTime.value = t;
    this.petalU.uTime.value = t;
    this.pointer.lerp(this.pointerTarget, 0.045);
    this.photoU.uRipple.value *= 0.965;
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  play() {
    if (!this.ok || this.running || this.disposed) return;
    this.running = true;
    this.clock.start();
    this.raf = requestAnimationFrame(this.tick);
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  setReveal(v: number) {
    if (this.ok) this.photoU.uReveal.value = v;
  }

  setScroll(v: number) {
    if (this.ok) this.photoU.uScroll.value = v;
  }
}
