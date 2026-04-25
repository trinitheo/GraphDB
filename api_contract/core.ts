export namespace Api {
  export namespace V1 {
    /**
     * A generic wrapper for all API responses.
     * @template T The type of the data payload.
     */
    export interface ApiResponse<T> {
      data: T;
      error?: {
        code: string;
        message: string;
      };
    }

    /**
     * Base for entities that have a unique identifier.
     */
    export interface Entity {
      id: string;
    }
  }
}