/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '*.css';

declare module '*.svg' {
	const src: string;
	export default src;
}