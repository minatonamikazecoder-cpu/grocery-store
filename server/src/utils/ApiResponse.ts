export class ApiResponse<T> {
  public statusCode: number;
  public success: boolean;
  public message: string;
  public data: T;
  public meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
    limit?: number;
  };

  constructor(
    statusCode: number,
    data: T,
    message: string = "Success",
    meta?: {
      total?: number;
      page?: number;
      totalPages?: number;
      limit?: number;
    }
  ) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta && { meta: this.meta }),
    };
  }
}
