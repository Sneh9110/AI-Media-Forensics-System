/**
 * API response formatter for standardized API responses
 */
export class APIResponseFormatter {
  static successResponse<T>(
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ): { success: true; data: T; message: string; statusCode: number } {
    return {
      success: true,
      data,
      message,
      statusCode,
    }
  }

  static errorResponse(
    error: string,
    statusCode: number = 400,
    details?: any
  ): { success: false; error: string; statusCode: number; details?: any } {
    return {
      success: false,
      error,
      statusCode,
      ...(details && { details }),
    }
  }

  static paginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
  ): {
    success: true
    data: T[]
    pagination: { total: number; page: number; pageSize: number; totalPages: number }
  } {
    const totalPages = Math.ceil(total / pageSize)
    return {
      success: true,
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    }
  }

  static validationErrorResponse(
    errors: Record<string, string[]>
  ): { success: false; error: string; statusCode: number; validationErrors: Record<string, string[]> } {
    return {
      success: false,
      error: "Validation failed",
      statusCode: 422,
      validationErrors: errors,
    }
  }
}

export const apiResponseFormatter = new APIResponseFormatter()
