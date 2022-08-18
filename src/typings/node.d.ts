export declare global {
  namespace NodeJS {
    interface Process {
      timestamp: number
    }
  }
}