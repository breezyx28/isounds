/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { cn } from "@/lib/utils";
import { Color, type IUniform, type Mesh, type ShaderMaterial } from "three";

function hexToNormalizedRGB(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    parseInt(normalized.slice(0, 2), 16) / 255,
    parseInt(normalized.slice(2, 4), 16) / 255,
    parseInt(normalized.slice(4, 6), 16) / 255,
  ];
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  float intensity = clamp(pattern, 0.0, 1.0);
  float alpha = smoothstep(0.42, 0.82, intensity) * 0.72;
  vec3 rgb = uColor * (0.45 + 0.55 * intensity) - vec3(rnd / 15.0 * uNoiseIntensity);
  gl_FragColor = vec4(rgb, alpha);
}
`;

interface SilkUniforms {
  uSpeed: { value: number };
  uScale: { value: number };
  uNoiseIntensity: { value: number };
  uColor: { value: Color };
  uRotation: { value: number };
  uTime: { value: number };
}

const SilkPlane = forwardRef<Mesh, { uniforms: SilkUniforms }>(function SilkPlane(
  { uniforms },
  ref,
) {
  const { viewport } = useThree();
  const innerRef = useRef<Mesh>(null);

  const setMeshRef = useCallback(
    (node: Mesh | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
        return;
      }
      if (ref && typeof ref === "object") {
        ref.current = node;
      }
    },
    [ref],
  );

  useLayoutEffect(() => {
    const mesh = innerRef.current;
    if (!mesh) return;
    const cover = Math.max(viewport.width, viewport.height) * 1.05;
    mesh.scale.set(cover, cover, 1);
  }, [viewport.width, viewport.height]);

  useFrame((_, delta) => {
    const mesh = innerRef.current;
    if (!mesh) return;
    const material = mesh.material as ShaderMaterial;
    if (material.uniforms?.uTime) {
      material.uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={setMeshRef}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms as unknown as Record<string, IUniform>}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  className?: string;
}

export function Silk({
  speed = 5,
  scale = 1,
  color = "#7B7481",
  noiseIntensity = 1.5,
  rotation = 0,
  className,
}: SilkProps) {
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo<SilkUniforms>(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 },
    }),
    [speed, scale, noiseIntensity, color, rotation],
  );

  return (
    <Canvas
      className={cn("block size-full", className)}
      dpr={[1, 2]}
      frameloop="always"
      gl={{ alpha: true, antialias: true, premultipliedAlpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      style={{ width: "100%", height: "100%", display: "block", background: "transparent" }}
    >
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
}
