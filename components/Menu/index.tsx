/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

type MenuProps = {
	children?: React.ReactNode;
	onCancel: () => void;
};

export const MoreMenu = ({ children, onCancel }: MenuProps) => {
	return (
		<>
			<div onClick={onCancel} className="menu-bg" />
			<div className="menu-content">{children}</div>
		</>
	);
};
