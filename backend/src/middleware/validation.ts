import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    const errorMessages = errors.array().map(error => error.msg);
    
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
      details: errors.array().map(error => ({
        field: (error as any).path || 'unknown',
        value: (error as any).value || 'unknown',
        message: error.msg
      }))
    });
    return;
  }
  
  next();
};
