/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { SiweMessage } from "siwe";
import { ironOptions } from "./nonce";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { method } = req;
	switch (method) {
		case "POST":
			try {
				const { message, signature } = req.body;
				const siweMessage = new SiweMessage(message as string);
				const fields = await siweMessage.validate(signature as string);

				if (fields.nonce !== req.session.nonce) return res.status(422).json({ message: "Invalid nonce." });

				req.session.siwe = fields;
				await req.session.save();
				res.json({ ok: true });
			} catch (_error) {
				res.json({ ok: false });
			}
			break;
		default:
			res.setHeader("Allow", ["POST"]);
			res.status(405).end(`Method ${method as string} Not Allowed`);
	}
};

export default withIronSessionApiRoute(handler, ironOptions);
