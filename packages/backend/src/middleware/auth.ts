import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { config } from '../config';

const jwksClient = jwksRsa({
  jwksUri: `https://cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.userPoolId}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 600000,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Development bypass - mock admin user (for demo/PoC environments)
  if (config.stage === 'development') {
    req.user = {
      id: 'b2c3d4e5-2222-4000-8000-000000000001',
      email: 'sarah.chen@maine.gov',
      roles: ['SYSTEM_ADMIN'],
      agencyId: '',
      agencyScope: [],
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await new Promise<any>((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          issuer: `https://cognito-idp.${config.cognito.region}.amazonaws.com/${config.cognito.userPoolId}`,
          algorithms: ['RS256'],
        },
        (err, payload) => {
          if (err) reject(err);
          else resolve(payload);
        }
      );
    });

    req.user = {
      id: decoded.sub,
      email: decoded.email || decoded['cognito:username'],
      roles: decoded['custom:roles']?.split(',') || [],
      agencyId: decoded['custom:agencyId'] || '',
      agencyScope: decoded['custom:agencyScope']?.split(',') || [],
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
