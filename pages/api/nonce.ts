import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { generateNonce } from "siwe";

export const ironOptions = {
	cookieName: "siwe",
	password: "complex_password_at_least_32_characters_long",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
	},
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	const { method } = req;
	switch (method) {
		case "GET":
			req.session.nonce = generateNonce();
			await req.session.save();
			res.setHeader("Content-Type", "text/plain");
			res.send(req.session.nonce);
			break;
		default:
			res.setHeader("Allow", ["GET"]);
			res.status(405).end(`Method ${method as string} Not Allowed`);
	}
};

export default withIronSessionApiRoute(handler, ironOptions);
