declare module 'tuyapi' {
  interface TuyAPIOptions {
    id: string;
    key: string;
    ip?: string;
    port?: number;
    version?: string;
    issueRefreshOnConnect?: boolean;
  }

  interface SetOptions {
    dps?: number;
    set: boolean | number | string;
  }

  interface GetOptions {
    dps?: number;
    schema?: boolean;
  }

  class TuyAPI {
    constructor(options: TuyAPIOptions);
    find(options?: { timeout?: number }): Promise<void>;
    connect(): Promise<void>;
    disconnect(): void;
    get(options?: GetOptions): Promise<boolean | Record<string, unknown>>;
    set(options: SetOptions): Promise<void>;
    on(event: 'connected', callback: () => void): this;
    on(event: 'disconnected', callback: () => void): this;
    on(event: 'error', callback: (error: Error) => void): this;
    on(
      event: 'data',
      callback: (data: Record<string, unknown>) => void,
    ): this;
    on(
      event: 'dp-refresh',
      callback: (data: Record<string, unknown>) => void,
    ): this;
  }

  export default TuyAPI;
}
