/* eslint-disable @typescript-eslint/require-await */
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironOptions } from "./nonce";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { method } = req;
	switch (method) {
		case "GET":
			req.session.destroy();
			res.send({ ok: true });
			break;
		default:
			res.setHeader("Allow", ["GET"]);
			res.status(405).end(`Method ${method as string} Not Allowed`);
	}
};

export default withIronSessionApiRoute(handler, ironOptions);
