import type { Response } from 'express'

export const sendData = (res: Response, data: unknown, status = 200) => {
  res.status(status).json({ data })
}
