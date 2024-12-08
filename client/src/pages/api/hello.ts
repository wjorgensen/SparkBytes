// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

/**
 * API route handler for the hello endpoint.
 * 
 * @param req - The incoming request object, containing request data.
 * @param res - The response object used to send data back to the client.
 * 
 * This handler responds with a JSON object containing a name.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  res.status(200).json({ name: "John Doe" });
}
