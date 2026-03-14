/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FLIPKART_CATEGORY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
