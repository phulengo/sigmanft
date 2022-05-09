import Link from "next/link";
import { Icon } from "components/Icon";
import Logo from "components/Logo";

export const Footer = () => {
	return (
		<footer>
			<div className="footer-wrapper">
				<div className="footer--left">
					<Link href={"/"} passHref>
						<a className="w-auto">
							<Logo theme="white" width="32" height="32" />
						</a>
					</Link>
					<div className="footer__items__wrapper">
						<div className="footer__items">© 2022 Sigmanft, Inc</div>
						<div className="footer__items">Terms of Service</div>
						<div className="footer__items">Privacy</div>
					</div>
				</div>
				<div className="footer__social-links">
					<Icon className="footer__social-icons" name="Facebook" size={24} color="#717171" />
					<Icon className="footer__social-icons" name="Twitter" size={24} color="#717171" />
					<Icon className="footer__social-icons" name="Instagram" size={24} color="#717171" />
					<Icon className="footer__social-icons" name="Linkedin" size={24} color="#717171" />
					<Icon className="footer__social-icons" name="Slack" size={24} color="#717171" />
				</div>
			</div>
		</footer>
	);
};
