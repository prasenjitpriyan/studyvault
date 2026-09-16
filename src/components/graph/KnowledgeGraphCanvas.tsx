'use client'

import type { GraphLink, GraphNode } from '@/app/api/graph/route'
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useReducedMotion } from 'motion/react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface GraphCanvasRef {
  zoomIn: () => void
  zoomOut: () => void
  resetCamera: () => void
  focusNode: (node: GraphNode) => void
}

interface KnowledgeGraphCanvasProps {
  nodes: GraphNode[]
  links: GraphLink[]
  selectedType: string
  viewMode: '3D' | '2D'
  selectedNode: GraphNode | null
  onSelectNode: (node: GraphNode | null) => void
}

interface SimNode extends GraphNode {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  mesh?: THREE.Mesh
  haloMesh?: THREE.Mesh
}

interface ProjectedLabel {
  id: string
  label: string
  color: string
  x: number
  y: number
  visible: boolean
  type: string
}

const KnowledgeGraphCanvas = forwardRef<GraphCanvasRef, KnowledgeGraphCanvasProps>(
  function KnowledgeGraphCanvas(
    { nodes, links, selectedType, viewMode, selectedNode, onSelectNode },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Three.js instances ref
    const threeRef = useRef<{
      scene: THREE.Scene
      camera: THREE.PerspectiveCamera
      renderer: THREE.WebGLRenderer
      controls: OrbitControls
      raycaster: THREE.Raycaster
      mouse: THREE.Vector2
      simNodes: SimNode[]
      linesGeometry: THREE.BufferGeometry
      linesMesh: THREE.LineSegments
      animationFrameId: number
      targetCamPos: THREE.Vector3 | null
      targetLookAt: THREE.Vector3 | null
    } | null>(null)

    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
    const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([])

    const shouldReduceMotion = useReducedMotion()
    const shouldReduceMotionRef = useRef(shouldReduceMotion)
    shouldReduceMotionRef.current = shouldReduceMotion

    const requestRenderRef = useRef<() => void>(() => {})

    const visibleNodeIds = useMemo(
      () =>
        new Set(
          nodes.filter((n) => selectedType === 'all' || n.type === selectedType).map((n) => n.id)
        ),
      [nodes, selectedType]
    )

    const visibleNodeIdsRef = useRef(visibleNodeIds)
    visibleNodeIdsRef.current = visibleNodeIds

    // Initialize Three.js WebGL Scene
    useEffect(() => {
      const container = containerRef.current
      const canvas = canvasRef.current
      if (!container || !canvas) return

      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight

      // 1. Scene
      const scene = new THREE.Scene()

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000)
      camera.position.set(0, 0, 480)

      // 3. Renderer with high DPI support & anti-aliasing
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // 4. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
      scene.add(ambientLight)

      const dirLight = new THREE.DirectionalLight(0xffffff, 2.0)
      dirLight.position.set(100, 200, 300)
      scene.add(dirLight)

      const pointLight = new THREE.PointLight(0x6366f1, 3.0, 1200)
      pointLight.position.set(0, 0, 200)
      scene.add(pointLight)

      // 5. Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.06
      controls.maxDistance = 1400
      controls.minDistance = 60
      controls.autoRotate = false
      controls.autoRotateSpeed = 0.6

      // 6. Raycasting
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2(-1000, -1000)

      // Initialize Simulation Nodes
      const simNodes: SimNode[] = nodes.map((node, i) => {
        // Spread initial positions in a 3D sphere or 2D circle
        const phi = Math.acos(-1 + (2 * i) / Math.max(nodes.length, 1))
        const theta = Math.sqrt(nodes.length * Math.PI) * phi
        const radius = 180 + (i % 3) * 30

        const is2D = viewMode === '2D'
        const x = is2D
          ? Math.cos((i / nodes.length) * 2 * Math.PI) * radius
          : radius * Math.sin(phi) * Math.cos(theta)
        const y = is2D
          ? Math.sin((i / nodes.length) * 2 * Math.PI) * radius
          : radius * Math.sin(phi) * Math.sin(theta)
        const z = is2D ? 0 : radius * Math.cos(phi)

        // Create Node Mesh
        const geometry = new THREE.SphereGeometry(node.val, 24, 24)
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(node.color),
          roughness: 0.25,
          metalness: 0.3,
          emissive: new THREE.Color(node.color),
          emissiveIntensity: 0.25,
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        mesh.userData = { nodeId: node.id }
        scene.add(mesh)

        // Create subtle outer halo for selection/hover glow
        const haloGeo = new THREE.SphereGeometry(node.val * 1.5, 16, 16)
        const haloMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(node.color),
          transparent: true,
          opacity: 0.12,
          wireframe: true,
        })
        const haloMesh = new THREE.Mesh(haloGeo, haloMat)
        haloMesh.position.set(x, y, z)
        scene.add(haloMesh)

        return {
          ...node,
          x,
          y,
          z,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          vz: (Math.random() - 0.5) * 2,
          mesh,
          haloMesh,
        }
      })

      // Create Link lines
      const linePositions = new Float32Array(links.length * 2 * 3)
      const lineColors = new Float32Array(links.length * 2 * 3)

      const linesGeometry = new THREE.BufferGeometry()
      linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
      linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))

      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      })

      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial)
      scene.add(linesMesh)

      threeRef.current = {
        scene,
        camera,
        renderer,
        controls,
        raycaster,
        mouse,
        simNodes,
        linesGeometry,
        linesMesh,
        animationFrameId: 0,
        targetCamPos: null,
        targetLookAt: null,
      }

      // Resize Handler
      const handleResize = () => {
        if (!container || !threeRef.current) return
        const w = container.clientWidth
        const h = container.clientHeight
        threeRef.current.camera.aspect = w / h
        threeRef.current.camera.updateProjectionMatrix()
        threeRef.current.renderer.setSize(w, h)
      }

      window.addEventListener('resize', handleResize)

      // Animation / Demand-Driven Render Loop
      let simTicks = 0
      let idleFrames = 0
      let isLoopActive = false

      const requestRender = () => {
        idleFrames = 0
        if (!isLoopActive && threeRef.current) {
          isLoopActive = true
          animate()
        }
      }
      requestRenderRef.current = requestRender

      const animate = () => {
        const state = threeRef.current
        if (!state) {
          isLoopActive = false
          return
        }

        // Pause loop if browser tab is hidden
        if (typeof document !== 'undefined' && document.hidden) {
          isLoopActive = false
          return
        }

        state.controls.update()

        let hasCameraActivity = false
        // Smooth camera interpolation if transitioning
        if (state.targetCamPos && state.targetLookAt) {
          hasCameraActivity = true
          if (shouldReduceMotionRef.current) {
            state.camera.position.copy(state.targetCamPos)
            state.controls.target.copy(state.targetLookAt)
            state.targetCamPos = null
            state.targetLookAt = null
          } else {
            state.camera.position.lerp(state.targetCamPos, 0.08)
            state.controls.target.lerp(state.targetLookAt, 0.08)

            if (state.camera.position.distanceTo(state.targetCamPos) < 1.0) {
              state.targetCamPos = null
              state.targetLookAt = null
            }
          }
        }

        let hasSimActivity = false
        // Physics Relaxation (Coulomb repulsion + Hooke link attraction)
        if (simTicks < 200) {
          simTicks++
          hasSimActivity = true
          const nodesList = state.simNodes
          const is2DMode = viewMode === '2D'

          // 1. Repulsion between all nodes
          for (let i = 0; i < nodesList.length; i++) {
            const n1 = nodesList[i]
            for (let j = i + 1; j < nodesList.length; j++) {
              const n2 = nodesList[j]
              const dx = n1.x - n2.x
              const dy = n1.y - n2.y
              const dz = is2DMode ? 0 : n1.z - n2.z
              const distSq = dx * dx + dy * dy + dz * dz + 1.0
              const dist = Math.sqrt(distSq)

              if (dist < 450) {
                const rep = 800 / distSq
                const fx = (dx / dist) * rep
                const fy = (dy / dist) * rep
                const fz = (dz / dist) * rep

                n1.vx += fx
                n1.vy += fy
                if (!is2DMode) n1.vz += fz

                n2.vx -= fx
                n2.vy -= fy
                if (!is2DMode) n2.vz -= fz
              }
            }
          }

          // 2. Attraction along links
          const nodeMap = new Map(nodesList.map((n) => [n.id, n]))
          for (const link of links) {
            const s = nodeMap.get(
              typeof link.source === 'object' ? (link.source as { id: string }).id : link.source
            )
            const t = nodeMap.get(
              typeof link.target === 'object' ? (link.target as { id: string }).id : link.target
            )

            if (s && t) {
              const dx = t.x - s.x
              const dy = t.y - s.y
              const dz = is2DMode ? 0 : t.z - s.z
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1
              const targetDist = 90
              const spring = (dist - targetDist) * 0.015

              const fx = (dx / dist) * spring
              const fy = (dy / dist) * spring
              const fz = (dz / dist) * spring

              s.vx += fx
              s.vy += fy
              if (!is2DMode) s.vz += fz

              t.vx -= fx
              t.vy -= fy
              if (!is2DMode) t.vz -= fz
            }
          }

          // 3. Centering gravity & damping
          for (const n of nodesList) {
            n.vx -= n.x * 0.008
            n.vy -= n.y * 0.008
            if (!is2DMode) n.vz -= n.z * 0.008

            n.vx *= 0.88
            n.vy *= 0.88
            n.vz *= 0.88

            n.x += n.vx
            n.y += n.vy
            n.z = is2DMode ? 0 : n.z + n.vz

            if (n.mesh) n.mesh.position.set(n.x, n.y, n.z)
            if (n.haloMesh) n.haloMesh.position.set(n.x, n.y, n.z)
          }

          // Update Link lines buffer
          const posAttr = state.linesGeometry.attributes.position as THREE.BufferAttribute
          const colorAttr = state.linesGeometry.attributes.color as THREE.BufferAttribute
          let lineIdx = 0

          for (const link of links) {
            const s = nodeMap.get(
              typeof link.source === 'object' ? (link.source as { id: string }).id : link.source
            )
            const t = nodeMap.get(
              typeof link.target === 'object' ? (link.target as { id: string }).id : link.target
            )

            if (s && t) {
              posAttr.setXYZ(lineIdx, s.x, s.y, s.z)
              posAttr.setXYZ(lineIdx + 1, t.x, t.y, t.z)

              const c1 = new THREE.Color(s.color)
              const c2 = new THREE.Color(t.color)

              colorAttr.setXYZ(lineIdx, c1.r, c1.g, c1.b)
              colorAttr.setXYZ(lineIdx + 1, c2.r, c2.g, c2.b)

              lineIdx += 2
            }
          }
          posAttr.needsUpdate = true
          colorAttr.needsUpdate = true
        }

        // Calculate projected 2D screen positions for labels
        const tempVec = new THREE.Vector3()
        const labels: ProjectedLabel[] = []

        for (const n of state.simNodes) {
          if (!visibleNodeIdsRef.current.has(n.id)) continue

          tempVec.set(n.x, n.y, n.z)
          tempVec.project(state.camera)

          // Check if node is in front of camera
          if (tempVec.z < 1.0) {
            const screenX = ((tempVec.x + 1) * width) / 2
            const screenY = ((-tempVec.y + 1) * height) / 2

            labels.push({
              id: n.id,
              label: n.label,
              color: n.color,
              x: screenX,
              y: screenY,
              visible: true,
              type: n.type,
            })
          }
        }
        setProjectedLabels(labels)

        // Render Three.js scene
        state.renderer.render(state.scene, state.camera)

        // Demand-driven frame dispatch
        if (!hasCameraActivity && !hasSimActivity) {
          idleFrames++
          if (idleFrames > 35) {
            isLoopActive = false
            return // Halt loop to conserve battery and CPU/GPU
          }
        } else {
          idleFrames = 0
        }

        state.animationFrameId = requestAnimationFrame(animate)
      }

      isLoopActive = true
      animate()

      // Wire controls change to request render
      controls.addEventListener('change', requestRender)

      const handleVisibilityChange = () => {
        if (typeof document !== 'undefined' && !document.hidden) {
          requestRender()
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        window.removeEventListener('resize', handleResize)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        controls.removeEventListener('change', requestRender)
        if (threeRef.current) {
          cancelAnimationFrame(threeRef.current.animationFrameId)
          threeRef.current.renderer.dispose()
        }
      }
    }, [nodes, links, viewMode])

    // Update visibility & selection highlights
    useEffect(() => {
      const state = threeRef.current
      if (!state) return

      state.simNodes.forEach((n) => {
        const isVisible = visibleNodeIds.has(n.id)
        const isSelected = selectedNode?.id === n.id
        const isHovered = hoveredNode?.id === n.id

        if (n.mesh) {
          n.mesh.visible = isVisible
          const scale = isSelected ? 1.4 : isHovered ? 1.25 : 1.0
          n.mesh.scale.set(scale, scale, scale)

          const mat = n.mesh.material as THREE.MeshStandardMaterial
          mat.emissiveIntensity = isSelected ? 0.7 : isHovered ? 0.5 : 0.25
        }

        if (n.haloMesh) {
          n.haloMesh.visible = isVisible && (isSelected || isHovered)
          const scale = isSelected ? 1.8 : isHovered ? 1.5 : 1.0
          n.haloMesh.scale.set(scale, scale, scale)
        }
      })

      requestRenderRef.current()
    }, [selectedType, selectedNode, hoveredNode, visibleNodeIds])

    // Pointer move handler (Raycasting)
    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const state = threeRef.current
      const container = containerRef.current
      if (!state || !container) return

      const rect = container.getBoundingClientRect()
      state.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      state.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      state.raycaster.setFromCamera(state.mouse, state.camera)
      const meshes = state.simNodes
        .filter((n) => visibleNodeIds.has(n.id) && n.mesh)
        .map((n) => n.mesh!)
      const intersects = state.raycaster.intersectObjects(meshes, false)

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object
        const hitNode = state.simNodes.find((n) => n.mesh === hitMesh)
        if (hitNode && hoveredNode?.id !== hitNode.id) {
          setHoveredNode(hitNode)
          container.style.cursor = 'pointer'
        }
      } else if (hoveredNode) {
        setHoveredNode(null)
        container.style.cursor = 'default'
      }
    }

    // Pointer click handler
    const handlePointerClick = () => {
      if (hoveredNode) {
        onSelectNode(hoveredNode)
        focusNodeOnCanvas(hoveredNode)
      } else {
        onSelectNode(null)
      }
    }

    // Focus and fly camera to target node
    const focusNodeOnCanvas = useCallback(
      (targetNode: GraphNode) => {
        const state = threeRef.current
        if (!state) return

        const sim = state.simNodes.find((n) => n.id === targetNode.id)
        if (!sim) return

        const is2D = viewMode === '2D'
        state.targetLookAt = new THREE.Vector3(sim.x, sim.y, sim.z)
        state.targetCamPos = new THREE.Vector3(sim.x, sim.y, is2D ? 280 : sim.z + 200)
      },
      [viewMode]
    )

    // Expose HUD Controls imperative handle
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        if (!threeRef.current) return
        threeRef.current.camera.position.multiplyScalar(0.8)
        requestRenderRef.current()
      },
      zoomOut: () => {
        if (!threeRef.current) return
        threeRef.current.camera.position.multiplyScalar(1.25)
        requestRenderRef.current()
      },
      resetCamera: () => {
        if (!threeRef.current) return
        const is2D = viewMode === '2D'
        if (shouldReduceMotionRef.current) {
          threeRef.current.camera.position.set(0, 0, is2D ? 450 : 480)
          threeRef.current.controls.target.set(0, 0, 0)
          threeRef.current.targetCamPos = null
          threeRef.current.targetLookAt = null
        } else {
          threeRef.current.targetCamPos = new THREE.Vector3(0, 0, is2D ? 450 : 480)
          threeRef.current.targetLookAt = new THREE.Vector3(0, 0, 0)
        }
        requestRenderRef.current()
      },
      focusNode: (node: GraphNode) => {
        focusNodeOnCanvas(node)
        requestRenderRef.current()
      },
    }))

    return (
      <div
        ref={containerRef}
        className="relative w-full h-full select-none overflow-hidden bg-radial from-card/60 via-background to-background"
      >
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onClick={handlePointerClick}
          className="w-full h-full block"
        />

        {/* Screen-Projected Crisp Node Badges */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {projectedLabels.map((item) => {
            const isSelected = selectedNode?.id === item.id
            const isHovered = hoveredNode?.id === item.id

            return (
              <div
                key={item.id}
                style={{
                  transform: `translate(${item.x}px, ${item.y}px) translate(-50%, -100%)`,
                  marginTop: '-12px',
                }}
                className={`absolute transition-transform duration-100 ease-out flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md whitespace-nowrap select-none shadow-md ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 scale-110 shadow-lg z-20'
                    : isHovered
                      ? 'bg-card/95 text-foreground border-indigo-500/60 scale-105 z-10'
                      : 'bg-card/75 text-muted-foreground/90 border-border/40 hover:text-foreground'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate max-w-32.5 sm:max-w-45">{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

export default KnowledgeGraphCanvas
