import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface CustomJwtPayload extends JwtPayload {
  userId?: string;
  email?: string;
}

type ValidTimeUnit = 'h' | 'm' | 'd' | 'w' | 'y';
type TimeValue = `${number}${ValidTimeUnit}`;

export const generateToken = (payload: object, expiresIn: number | TimeValue = '24h'): string => {
  const options: SignOptions = {
    expiresIn: expiresIn
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): CustomJwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};