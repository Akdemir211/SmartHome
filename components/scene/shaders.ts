/* ── Simplex noise (paylaşılan) ── */

const SIMPLEX_NOISE_GLSL = /* glsl */ `
vec3 mod289v3(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289v4(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute4(vec4 x){ return mod289v4(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt4(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289v3(i);
  vec4 p = permute4(permute4(permute4(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt4(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

/* ── Nöral ağ node shader'ları ── */

export const neuralNodeVertexShader = /* glsl */ `
uniform float uTime;
uniform float uLevel;
uniform float uLow;
uniform float uMid;
uniform float uHigh;
uniform float uState;

attribute float aSeed;
attribute float aSize;

varying float vBrightness;
varying float vSeed;
varying float vDist;

${SIMPLEX_NOISE_GLSL}

void main() {
  vec3 dir = normalize(position);
  float dist = length(position);

  float audio = uLevel * 0.5 + uMid * 0.3 + uHigh * 0.2;

  float n1 = snoise(position * 0.8 + vec3(uTime * 0.05, 0.0, uTime * 0.04));
  float n2 = snoise(position * 1.6 + vec3(0.0, uTime * 0.08, uTime * -0.05));

  float scatter = n1 * 0.15 + n2 * 0.08;
  float audioScatter = audio * (n1 * 0.25 + 0.15);

  float isThinkin = step(2.5, uState) * (1.0 - step(3.5, uState));
  float thinkPulse = isThinkin * 0.08 * sin(uTime * 5.0 + aSeed * 10.0);
  float breath = 0.01 * sin(uTime * 0.3 + aSeed * 6.2831);

  vec3 displaced = position + dir * (scatter + audioScatter + thinkPulse + breath);

  vDist = dist;
  vSeed = aSeed;
  vBrightness = 0.65 + audio * 0.6 + abs(n1) * 0.35;

  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mv;

  float baseSize = aSize * (0.25 + audio * 0.35);
  gl_PointSize = baseSize * (56.0 / -mv.z);
}
`;

export const neuralNodeFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uLevel;

varying float vBrightness;
varying float vSeed;
varying float vDist;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float core = smoothstep(0.5, 0.0, d);
  core = pow(core, 1.8);

  float twinkle = 0.88 + 0.12 * sin(uTime * 3.0 + vSeed * 15.0);
  float distFade = smoothstep(2.8, 0.2, vDist);

  float brightness = vBrightness * twinkle * distFade;

  vec3 color = vec3(0.3, 0.5, 1.0) * brightness;

  float alpha = core * brightness * (0.9 + uLevel * 0.1);

  gl_FragColor = vec4(color, alpha);
}
`;

/* ── Nöral bağlantı çizgi shader'ları ── */

export const neuralLineVertexShader = /* glsl */ `
uniform float uTime;
uniform float uLevel;

attribute float aAlpha;

varying float vAlpha;

${SIMPLEX_NOISE_GLSL}

void main() {
  float audio = uLevel * 0.4;

  float n = snoise(position * 0.6 + vec3(uTime * 0.03));
  vec3 displaced = position + normalize(position) * n * 0.06 * (1.0 + audio);

  vAlpha = aAlpha;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

export const neuralLineFragmentShader = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uLevel;

varying float vAlpha;

void main() {
  float pulse = 0.7 + 0.3 * sin(uTime * 1.5 + vAlpha * 20.0);
  float brightness = (0.25 + uLevel * 0.3) * pulse;

  vec3 color = vec3(0.25, 0.4, 0.9) * brightness;
  float alpha = vAlpha * brightness * 0.6;

  gl_FragColor = vec4(color, alpha);
}
`;

/* ── Eski orb shader'ları (geriye uyumluluk) ── */

export const orbVertexShader = /* glsl */ `
uniform float uTime;
uniform float uLevel;
uniform float uLow;
uniform float uMid;
uniform float uHigh;
uniform float uState;

attribute float aSeed;

varying vec3 vWorldPos;
varying float vDisplacement;
varying float vSeed;

${SIMPLEX_NOISE_GLSL}

void main() {
  vec3 dir = normalize(position);
  float breath = 0.005 * sin(uTime * 0.5 + aSeed * 6.2831);
  float wave1 = snoise(dir * 2.0 + vec3(uTime * 0.12, 0.0, uTime * 0.08)) * 0.04;
  float wave2 = snoise(dir * 3.5 + vec3(0.0, uTime * 0.15, uTime * -0.1)) * 0.02;
  float audio = uLevel * 0.6 + uMid * 0.3 + uLow * 0.1;
  float ripple = snoise(dir * 5.0 + vec3(uTime * 0.6)) * (0.01 + audio * 0.15);
  float isThinkin = step(2.5, uState) * (1.0 - step(3.5, uState));
  float thinkPulse = isThinkin * 0.03 * sin(uTime * 6.0 + aSeed * 12.0);
  float displacement = breath + wave1 + wave2 + ripple + thinkPulse;
  vec3 displaced = position + dir * displacement;
  vWorldPos = displaced;
  vDisplacement = displacement;
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mv;
  float baseSize = 0.8 + audio * 1.2;
  gl_PointSize = baseSize * (200.0 / -mv.z);
}
`;

export const orbFragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uLevel;
uniform float uState;
uniform vec3 uColorPurple;
uniform vec3 uColorCyan;
varying vec3 vWorldPos;
varying float vDisplacement;
varying float vSeed;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float shape = smoothstep(0.5, 0.15, d);
  float gradientT = smoothstep(-1.0, 1.0, vWorldPos.x);
  vec3 color = mix(uColorPurple, uColorCyan, gradientT);
  float twinkle = 0.92 + 0.08 * sin(uTime * 3.0 + vSeed * 8.0);
  color *= 0.55;
  float alpha = shape * twinkle * (0.7 + uLevel * 0.25);
  gl_FragColor = vec4(color, alpha);
}
`;

export const glowVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glowFragmentShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColorPurple;
uniform vec3 uColorCyan;
uniform float uIntensity;
void main() {
  vec2 p = vUv - 0.5;
  float dist = length(p);
  float glow = smoothstep(0.5, 0.0, dist);
  glow = pow(glow, 2.5);
  float lr = smoothstep(-0.5, 0.5, p.x);
  vec3 color = mix(uColorPurple, uColorCyan, lr);
  float alpha = glow * uIntensity * 0.2;
  gl_FragColor = vec4(color, alpha);
}
`;
