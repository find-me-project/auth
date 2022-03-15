declare namespace Express {
  export interface Request {
    accessData?: {
      accountId?: string,
      personId?: string,
      tokenId?: string,
      status?: string,
      role?: string,
      createdAt?: Date,
    },
  }
  
  export interface Response {
    success: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: Record<string, string | number | boolean>
    } | string) => any,

    successfulCreated: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: Record<string, string | number | boolean>
    } | string) => any,
    
    warning: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: Record<string, string | number | boolean>
    } | string) => any,
    
    error: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: Record<string, string | number | boolean>
    } | string) => any,
    
    notFound: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: Record<string, string | number | boolean>
    } | string) => any,
    
    forbidden: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: Record<string, string | number | boolean>
    } | string) => any,
  }
}
