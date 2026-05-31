import { memo, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import './WebGLBackground.css'

type ParticleData = {
  count: number
  positions: Float32Array
  speeds: Float32Array
}

type NetworkData = {
  lineSegArray: Float32Array
}

type PerfSettings = {
  particleCount: number
  particleSize: number
  nodeCount: number
  maxConnections: number
  maxDistance: number
  dpr: number
  canvasScale: number
}

function createParticles(count: number): ParticleData {
  const positions = new Float32Array(count * 3)
  const speeds    = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 22
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    speeds[i] = 0.002 + Math.random() * 0.006
  }
  return { count, positions, speeds }
}

function createNetwork(nodeCount: number, maxDistance: number, maxConnections: number): NetworkData {
  const nodePositions = new Float32Array(nodeCount * 3)
  for (let i = 0; i < nodeCount; i++) {
    nodePositions[i * 3]     = (Math.random() - 0.5) * 20
    nodePositions[i * 3 + 1] = (Math.random() - 0.5) * 12
    nodePositions[i * 3 + 2] = (Math.random() - 0.5) * 6
  }

  const lineSegs: number[] = []
  const connectionCounts = new Uint8Array(nodeCount)
  const maxDistSq = maxDistance * maxDistance

  for (let a = 0; a < nodeCount; a++) {
    for (let b = a + 1; b < nodeCount; b++) {
      if (connectionCounts[a] >= maxConnections || connectionCounts[b] >= maxConnections) continue
      const dx = nodePositions[a * 3]     - nodePositions[b * 3]
      const dy = nodePositions[a * 3 + 1] - nodePositions[b * 3 + 1]
      const dz = nodePositions[a * 3 + 2] - nodePositions[b * 3 + 2]
      if ((dx * dx + dy * dy + dz * dz) > maxDistSq) continue
      connectionCounts[a] += 1
      connectionCounts[b] += 1
      lineSegs.push(
        nodePositions[a * 3],     nodePositions[a * 3 + 1], nodePositions[a * 3 + 2],
        nodePositions[b * 3],     nodePositions[b * 3 + 1], nodePositions[b * 3 + 2],
      )
    }
  }

  return { lineSegArray: new Float32Array(lineSegs) }
}

// ── Shared mouse/scroll state ──
const state = {
  mouse:  new THREE.Vector2(0, 0),
  scroll: 0,
}

function useGlobalEvents() {
  useEffect(() => {
    let scrollRaf = 0
    const onMove = (e: MouseEvent) => {
      state.mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1
      state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    const updateScroll = () => {
      scrollRaf = 0
      const max = document.body.scrollHeight - window.innerHeight
      state.scroll = max > 0 ? window.scrollY / max : 0
    }
    const onScroll = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(updateScroll)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll',    onScroll)
      if (scrollRaf) cancelAnimationFrame(scrollRaf)
    }
  }, [])
}

// ── Particle Field ──
const ParticleField = memo(function ParticleField({ data, size }: { data: ParticleData; size: number }) {
  const meshRef = useRef<THREE.Points>(null!)

  // Copy positions so mutations don't affect the original
  const positions = useMemo(() => new Float32Array(data.positions), [data.positions])
  const speeds    = data.speeds
  const count     = data.count

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [positions])

  useFrame(({ clock }) => {
    const pts = meshRef.current
    if (!pts) return
    const pos = pts.geometry.attributes.position.array as Float32Array
    const t   = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * 0.4
      pos[i * 3]     += Math.sin(t * speeds[i] * 3 + i) * 0.003
      if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = -7
    }
    pts.geometry.attributes.position.needsUpdate = true
    pts.rotation.x += (state.mouse.y * 0.05 - pts.rotation.x) * 0.03
    pts.rotation.y += (state.mouse.x * 0.06 - pts.rotation.y) * 0.03
    pts.position.y += (state.scroll * -1.5 - pts.position.y) * 0.025
  })

  return (
    <points ref={meshRef} geometry={geo}>
      <pointsMaterial
        size={size}
        color="#00d4ff"
        transparent
        opacity={0.55}
        sizeAttenuation={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
})

// ── Network Lines ──
const NetworkLines = memo(function NetworkLines({ data }: { data: NetworkData }) {
  const ref = useRef<THREE.LineSegments>(null!)

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(data.lineSegArray, 3))
    return g
  }, [data.lineSegArray])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.rotation.y = t * 0.014 + state.mouse.x * 0.06
    ref.current.rotation.x = state.mouse.y * 0.04
    ref.current.rotation.z = t * 0.004
    ref.current.position.y += (state.scroll * -2 - ref.current.position.y) * 0.02
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
})

// ── Liquid Sphere ──
const LiquidSphere = memo(function LiquidSphere() {
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
    uStrength: { value: 0.28 },
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
      <icosahedronGeometry args={[2.2, 24]} />
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
})

const PerformanceController = memo(function PerformanceController({ dpr, canvasScale }: { dpr: number; canvasScale: number }) {
  const { gl, setFrameloop, invalidate } = useThree()

  useEffect(() => {
    let resizeRaf = 0
    const applySize = () => {
      resizeRaf = 0
      gl.setPixelRatio(dpr)
      gl.setSize(window.innerWidth * canvasScale, window.innerHeight * canvasScale, false)
    }
    const onResize = () => {
      if (resizeRaf) return
      resizeRaf = requestAnimationFrame(applySize)
    }
    applySize()
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      if (resizeRaf) cancelAnimationFrame(resizeRaf)
    }
  }, [canvasScale, dpr, gl])

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        setFrameloop('never')
      } else {
        setFrameloop('always')
        invalidate()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [invalidate, setFrameloop])

  return null
})

// ── Scene ──
const Scene = memo(function Scene({ particleData, networkData, particleSize }: {
  particleData: ParticleData
  networkData: NetworkData
  particleSize: number
}) {
  useGlobalEvents()
  return (
    <>
      <ambientLight intensity={0.1} />
      <ParticleField data={particleData} size={particleSize} />
      <NetworkLines data={networkData} />
      <LiquidSphere />
    </>
  )
})

// ── Export ──
const WebGLBackground = memo(function WebGLBackground() {
  const isLowEnd = useMemo(() => {
    if (typeof window === 'undefined') return true
    return navigator.hardwareConcurrency <= 4
      || !window.matchMedia('(min-resolution: 2dppx)').matches
  }, [])

  const settings = useMemo<PerfSettings>(() => ({
    particleCount:  isLowEnd ? 80 : 180,
    particleSize:   isLowEnd ? 1.2 : 1.8,
    nodeCount:      isLowEnd ? 70 : 140,
    maxConnections: isLowEnd ? 3 : 5,
    maxDistance:    isLowEnd ? 80 : 150,
    dpr:            isLowEnd ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 2),
    canvasScale:    isLowEnd ? 0.75 : 1,
  }), [isLowEnd])

  const particleData = useMemo(() => createParticles(settings.particleCount), [settings.particleCount])
  const networkData  = useMemo(
    () => createNetwork(settings.nodeCount, settings.maxDistance, settings.maxConnections),
    [settings.maxConnections, settings.maxDistance, settings.nodeCount],
  )

  return (
    <div className="webgl-bg" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={settings.dpr}
        style={{ background: 'transparent' }}
      >
        <PerformanceController dpr={settings.dpr} canvasScale={settings.canvasScale} />
        <Scene
          particleData={particleData}
          networkData={networkData}
          particleSize={settings.particleSize}
        />
      </Canvas>
    </div>
  )
})

export default WebGLBackground