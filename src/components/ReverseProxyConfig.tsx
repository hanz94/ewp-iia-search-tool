export const REVERSE_PROXY_PROTOCOL = import.meta.env.VITE_EWP_RP_PROTOCOL;
export const REVERSE_PROXY_DOMAIN = import.meta.env.VITE_EWP_RP_DOMAIN;
export const REVERSE_PROXY_PORT = import.meta.env.VITE_EWP_RP_PORT;
export const REVERSE_PROXY_URL = `${import.meta.env.VITE_EWP_RP_PROTOCOL}://${import.meta.env.VITE_EWP_RP_DOMAIN}:${import.meta.env.VITE_EWP_RP_PORT}`;
