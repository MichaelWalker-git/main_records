import { Request, Response, NextFunction } from 'express';
import { authorize } from '../middleware/authorize';

function mockReqResNext(user?: any) {
  const req = { user } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('authorize middleware', () => {
  it('returns 401 if no user on request', () => {
    const { req, res, next } = mockReqResNext(undefined);
    authorize('records:read')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('allows SYSTEM_ADMIN for any permission', () => {
    const { req, res, next } = mockReqResNext({ roles: ['SYSTEM_ADMIN'] });
    authorize('records:delete')(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('allows RECORDS_OFFICER for records:read', () => {
    const { req, res, next } = mockReqResNext({ roles: ['RECORDS_OFFICER'] });
    authorize('records:read')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('denies VIEWER for records:write', () => {
    const { req, res, next } = mockReqResNext({ roles: ['VIEWER'] });
    authorize('records:write')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('denies AGENCY_STAFF for records:delete', () => {
    const { req, res, next } = mockReqResNext({ roles: ['AGENCY_STAFF'] });
    authorize('records:delete')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows if any role has the permission', () => {
    const { req, res, next } = mockReqResNext({ roles: ['VIEWER', 'RECORDS_OFFICER'] });
    authorize('records:write')(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('denies unknown role', () => {
    const { req, res, next } = mockReqResNext({ roles: ['UNKNOWN_ROLE'] });
    authorize('records:read')(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});