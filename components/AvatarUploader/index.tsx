import React from "react";
import { Icon } from "components/Icon";

type AvatarUploaderProps = {
	fileUpdate: (data: File) => void;
	value?: string;
};

const AvatarUploader = ({ fileUpdate, value }: AvatarUploaderProps) => {
	setTimeout(() => {
		if (typeof document !== "undefined") {
			const avatarUploaderEl = document.getElementsByClassName("avatar-uploader")[0] as HTMLElement;
			if (avatarUploaderEl && value && !value.includes("{")) {
				avatarUploaderEl.style.backgroundImage = `url('${value}')`;
				avatarUploaderEl.style.backgroundSize = "cover";

				const avatarUploaderIconEl = document.getElementsByClassName("uploader__icon")[0];
				avatarUploaderIconEl && avatarUploaderIconEl.classList.add("hidden");

				const avatarUploaderCloseIconEl = document.getElementsByClassName("uploader__icon--close")[0];
				avatarUploaderCloseIconEl && avatarUploaderCloseIconEl.classList.add("block", "right-[-8px]", "top-[0px]");
			}
		}
	}, 1);

	const handleChangeAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] as Blob;

		const reader = new FileReader();
		reader.onloadend = function () {
			if (typeof document !== "undefined") {
				// 250 MB max
				if (file.size > 2.5e8) {
					const sizeErrorEl = document.createElement("span");
					sizeErrorEl.innerText = "File size must be smaller than 250 MB. Please try again.";
					sizeErrorEl.classList.add("label-error", "size-error-label", "self-start");
					event.target &&
						event.target.parentNode &&
						event.target.parentNode.parentNode &&
						event.target.parentNode.parentNode.appendChild(sizeErrorEl);
					handleRemoveFile();
				} else {
					if (document.getElementsByClassName("size-error-label")[0]) {
						event.target &&
							event.target.parentNode &&
							event.target.parentNode.parentNode &&
							event.target.parentNode.parentNode.removeChild(document.getElementsByClassName("size-error-label")[0]);
					}
					try {
						// Video type
						if (file.type.includes("video")) {
							const avatarUploaderEl = document.getElementsByClassName("avatar-uploader")[0] as HTMLElement;
							avatarUploaderEl.style.backgroundImage = avatarUploaderEl && "none";
							avatarUploaderEl.classList.remove("min-h-[250px]");
							avatarUploaderEl.classList.add("min-h-[calc(250px-48px+7px)]");

							const videoPreviewEl = document.createElement("video");
							videoPreviewEl.controls = true;
							videoPreviewEl.src = URL.createObjectURL(file);

							const videoPreview = event.target.parentNode?.appendChild(videoPreviewEl);
							videoPreview && videoPreview.classList.add("video-preview");

							const avatarUploaderIconEl = document.getElementsByClassName("uploader__icon")[0];
							avatarUploaderIconEl && avatarUploaderIconEl.classList.add("hidden");
							const avatarUploaderCloseIconEl = document.getElementsByClassName("uploader__icon--close")[0];

							if (document.getElementsByClassName("video-preview")[0]) {
								avatarUploaderCloseIconEl && avatarUploaderCloseIconEl.classList.remove("right-0", "right-[8px]");
								avatarUploaderCloseIconEl &&
									avatarUploaderCloseIconEl.classList.add("block", "right-[8px]", "xs:right-[8px]", "sm:right-[8px]");
							}
						} else {
							if (file.type.includes("image")) {
								// Image type
								event.target.style.backgroundImage = `url('${reader.result as string}')`;
								event.target.style.backgroundSize = "cover";
								event.target.classList.add("min-h-[150px]", "max-w-[150px]");

								const avatarUploaderIconEl = document.getElementsByClassName("uploader__icon")[0];
								avatarUploaderIconEl && avatarUploaderIconEl.classList.add("hidden");
								const avatarUploaderCloseIconEl = document.getElementsByClassName("uploader__icon--close")[0];
								avatarUploaderCloseIconEl &&
									avatarUploaderCloseIconEl.classList.add("block", "right-[-8px]", "top-[0px]");
							}
						}
					} catch (error) {}
				}
			}
		};

		// Escape TypeError
		if (file) {
			reader.readAsDataURL(file);
			if (event.target.files?.[0]) {
				try {
					fileUpdate(event.target.files?.[0]);
				} catch (error) {
					console.error(error);
				}
			}
		} else {
			null;
		}
	};

	const handleRemoveFile = () => {
		if (typeof document !== "undefined") {
			const avatarUploaderEl = document.getElementsByClassName("avatar-uploader")[0] as HTMLElement;
			if (avatarUploaderEl) {
				avatarUploaderEl.style.backgroundImage = "none";
				avatarUploaderEl.classList.add("min-h-[150px]");
			}

			if (document.getElementsByClassName("video-preview")[0]) {
				avatarUploaderEl &&
					avatarUploaderEl.parentNode &&
					avatarUploaderEl.parentNode.removeChild(document.getElementsByClassName("video-preview")[0]);
			}

			const avatarUploaderIconEl = document.getElementsByClassName("uploader__icon")[0];
			avatarUploaderIconEl && avatarUploaderIconEl.classList.remove("hidden");

			const avatarUploaderCloseIconEl = document.getElementsByClassName("uploader__icon--close")[0];
			avatarUploaderCloseIconEl && avatarUploaderCloseIconEl.classList.remove("block");
		}
		fileUpdate(null!);
	};

	return (
		<div className="avatar-uploader__container">
			<input
				name="avatar_url"
				className="avatar-uploader"
				type="file"
				accept="image/*"
				onChange={handleChangeAvatar}
			></input>
			<Icon className="uploader__icon" name="User" size="64" color="#C6C6C6" />
			<Icon onClick={handleRemoveFile} className="uploader__icon--close" name="X" size="24" color="#C6C6C6" />
		</div>
	);
};

export default AvatarUploader;
