import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import './WebGLBackground.css'

// ── All random data generated ONCE at module level (outside component) ──
const PARTICLE_COUNT = 2800
const NODE_COUNT     = 180

// Particles
const _particlePositions = new Float32Array(PARTICLE_COUNT * 3)
const _particleSpeeds    = new Float32Array(PARTICLE_COUNT)
for (let i = 0; i < PARTICLE_COUNT; i++) {
  _particlePositions[i * 3]     = (Math.random() - 0.5) * 22
  _particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14
  _particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10
  _particleSpeeds[i] = 0.002 + Math.random() * 0.006
}

const _particleSizes = new Float32Array(PARTICLE_COUNT)
for (let i = 0; i < PARTICLE_COUNT; i++) {
  _particleSizes[i] = 0.5 + Math.random() * 2.5
}

// Network nodes + line segments
const _nodePositions = new Float32Array(NODE_COUNT * 3)
for (let i = 0; i < NODE_COUNT; i++) {
  _nodePositions[i * 3]     = (Math.random() - 0.5) * 20
  _nodePositions[i * 3 + 1] = (Math.random() - 0.5) * 12
  _nodePositions[i * 3 + 2] = (Math.random() - 0.5) * 6
}
const _lineSegs: number[] = []
for (let a = 0; a < NODE_COUNT; a++) {
  for (let b = a + 1; b < NODE_COUNT; b++) {
    const dx = _nodePositions[a*3]   - _nodePositions[b*3]
    const dy = _nodePositions[a*3+1] - _nodePositions[b*3+1]
    const dz = _nodePositions[a*3+2] - _nodePositions[b*3+2]
    if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 3.2) {
      _lineSegs.push(
        _nodePositions[a*3], _nodePositions[a*3+1], _nodePositions[a*3+2],
        _nodePositions[b*3], _nodePositions[b*3+1], _nodePositions[b*3+2],
      )
    }
  }
}
const _lineSegArray = new Float32Array(_lineSegs)

// ── Shared mouse/scroll state ──
const state = {
  mouse:  new THREE.Vector2(0, 0),
  scroll: 0,
}

function useGlobalEvents() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      state.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
      state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight
      state.scroll = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener('mousemove', onMove,   { passive: true })
    window.addEventListener('scroll',    onScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll',    onScroll)
    }
  }, [])
}

// ── Particle Field ──
function ParticleField() {
  const meshRef = useRef<THREE.Points>(null!)

  // Copy positions so mutations don't affect the original
  const positions = useMemo(() => new Float32Array(_particlePositions), [])
  const speeds    = _particleSpeeds

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('size',     new THREE.BufferAttribute(_particleSizes, 1))
    return g
  }, [positions])

  useFrame(({ clock }) => {
    const pts = meshRef.current
    if (!pts) return
    const pos = pts.geometry.attributes.position.array as Float32Array
    const t   = clock.getElapsedTime()
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.4
      pos[i * 3]     += Math.sin(t * speeds[i] * 3 + i) * 0.003
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -7
    }
    pts.geometry.attributes.position.needsUpdate = true
    pts.rotation.x += (state.mouse.y * 0.06 - pts.rotation.x) * 0.04
    pts.rotation.y += (state.mouse.x * 0.08 - pts.rotation.y) * 0.04
    pts.position.y += (state.scroll * -2 - pts.position.y) * 0.03
  })

  return (
    <points ref={meshRef} geometry={geo}>
      <pointsMaterial
        size={0.028}
        color="#00d4ff"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ── Network Lines ──
function NetworkLines() {
  const ref = useRef<THREE.LineSegments>(null!)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(_lineSegArray, 3))
    return g
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.018 + state.mouse.x * 0.08
    ref.current.rotation.x = state.mouse.y * 0.05
    ref.current.rotation.z = t * 0.006
    ref.current.position.y += (state.scroll * -3 - ref.current.position.y) * 0.025
  })

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial
        color="#6b5ce7"
        transparent
        opacity={0.12}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

// ── Liquid Sphere ──
function LiquidSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const matRef  = useRef<THREE.ShaderMaterial>(null!)

  const vertexShader = `
    uniform float uTime;
    uniform float uStrength;
    varying vec3 vNormal;
    varying vec2 vUv;
    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
    vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
      vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
      float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
      vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
      return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
    void main(){
      vUv=uv;vNormal=normal;
      vec3 pos=position;
      float n=snoise(pos*1.4+uTime*0.28);
      pos+=normal*n*uStrength;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main(){
      vec3 cyan=vec3(0.,0.83,1.);
      vec3 violet=vec3(0.42,0.36,0.91);
      float m=.5+.5*sin(uTime*.4+vUv.x*3.14);
      vec3 col=mix(cyan,violet,m);
      float alpha=0.06+0.04*dot(vNormal,vec3(0.,0.,1.));
      gl_FragColor=vec4(col,alpha);
    }
  `

  const uniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uStrength: { value: 0.38 },
  }), [])

  useFrame(({ clock }) => {
    if (matRef.current)  matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.position.x += (state.mouse.x * 2.0 - meshRef.current.position.x) * 0.025
      meshRef.current.position.y += (state.mouse.y * 1.2 - meshRef.current.position.y) * 0.025
      meshRef.current.position.z += (state.scroll * -4  - meshRef.current.position.z)  * 0.03
    }
  })

  return (
    <mesh ref={meshRef} position={[3.5, 0.5, -3]}>
      <icosahedronGeometry args={[2.4, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// ── Scene ──
function Scene() {
  useGlobalEvents()
  return (
    <>
      <ambientLight intensity={0.1} />
      <ParticleField />
      <NetworkLines />
      <LiquidSphere />
    </>
  )
}

// ── Export ──
export default function WebGLBackground() {
  return (
    <div className="webgl-bg" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}