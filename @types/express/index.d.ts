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
      params?: ParamsType
    } | string) => Response<any, Record<string, any>>,

    successfulCreated: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: ParamsType
    } | string) => Response<any, Record<string, any>>,

    warning: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: ParamsType
    } | string) => Response<any, Record<string, any>>,

    error: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: ParamsType
    } | string) => Response<any, Record<string, any>>,

    notFound: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: ParamsType
    } | string) => Response<any, Record<string, any>>,

    forbidden: (resultObject?: Record<string, any>, message?: {
      code: string,
      message?: string,
      params?: ParamsType
    } | string) => Response<any, Record<string, any>>,
  }
}
