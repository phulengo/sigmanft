/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from "react";
import { Button } from "components/Button";
import { Icon } from "components/Icon";
import Portal from "components/Portal";

export interface ModalProps {
	children?: React.ReactNode;
	headerText?: string;
	onCancel: () => void;
}
const Modal = ({ onCancel, headerText, children }: ModalProps) => {
	return (
		<>
			<div onClick={onCancel} className="modal-bg" />
			<Portal>
				<div className="modal-container">
					<div className="flex flex-col gap-6">
						<Button icon className="modal__button--close" onClick={onCancel}>
							<Icon name="X" size={24} color="black" />
						</Button>
						<div className={`${(headerText as string) ? "modal-header" : "invisible"}`}>
							<h1>{headerText}</h1>
						</div>
						<div className="modal-content">{children}</div>
					</div>
				</div>
			</Portal>
		</>
	);
};

export default Modal;
