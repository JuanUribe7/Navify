interface Window {
    ws: WebSocket;
}

declare module '*.png' {
    const value: string;
    export default value;
}