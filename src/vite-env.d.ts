/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'twisty-player': DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        alg?: string
        'experimental-setup-alg'?: string
        'experimental-setup-anchor'?: 'start' | 'end'
        puzzle?: string
        visualization?: string
        'hint-facelets'?: string
        'control-panel'?: string
        background?: string
        'back-view'?: string
      }
    }
  }
}
