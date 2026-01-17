import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useGsapAnimations = () => {
  useEffect(() => {
    // Enable ScrollTrigger
    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])
}

export const useFadeInUp = (dependencies: any[] = []) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          y: 50
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }
  }, dependencies)

  return ref
}

export const useStaggerCards = (dependencies: any[] = []) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      const children = ref.current.children
      
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: 60,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }
  }, dependencies)

  return ref
}

export const useCountUp = (endValue: number, duration: number = 2) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) {
      const obj = { value: 0 }
      
      gsap.to(obj, {
        value: endValue,
        duration: duration,
        ease: 'power1.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.floor(obj.value).toString()
          }
        },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      })
    }
  }, [endValue, duration])

  return ref
}