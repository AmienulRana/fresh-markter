import { defineConfig, envField } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'

const isVercel = Boolean(process.env.VERCEL)

export default defineConfig({
  output: 'server',
  adapter: isVercel ? vercel() : node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      API_GATEWAY_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_MIDTRANS_CLIENT_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_MIDTRANS_SNAP_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://app.sandbox.midtrans.com/snap/snap.js',
      }),
    },
  },
})
