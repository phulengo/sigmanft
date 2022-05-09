import React from "react";
import { Icon } from "components/Icon";

type ArtworkUploaderProps = {
	fileUpdate: (data: File) => void;
	value?: string;
};

const ArtworkUploader = ({ fileUpdate, value }: ArtworkUploaderProps) => {
	// setTimeout(() => {
	// 	if (typeof document !== "undefined") {
	// 		const artworkUploaderEl = document.getElementsByClassName("artwork-uploader")[0] as HTMLElement;
	// 		if (artworkUploaderEl && value) {
	// 			artworkUploaderEl.style.backgroundImage = `url('${value}')`;
	// 			artworkUploaderEl.style.backgroundSize = "cover";
	// 		}
	// 	}
	// }, 1);

	const handleChangeArtwork = (event: React.ChangeEvent<HTMLInputElement>) => {
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
							const artworkUploaderEl = document.getElementsByClassName("artwork-uploader")[0] as HTMLElement;
							artworkUploaderEl.style.backgroundImage = artworkUploaderEl && "none";
							artworkUploaderEl.classList.remove("min-h-[250px]");
							artworkUploaderEl.classList.add("min-h-[calc(250px-48px+7px)]");

							const videoPreviewEl = document.createElement("video");
							videoPreviewEl.controls = true;
							videoPreviewEl.src = URL.createObjectURL(file);

							const videoPreview = event.target.parentNode?.appendChild(videoPreviewEl);
							videoPreview && videoPreview.classList.add("video-preview");

							const artworkUploaderIconEl = document.getElementsByClassName("uploader__icon")[0];
							artworkUploaderIconEl && artworkUploaderIconEl.classList.add("hidden");
							const artworkUploaderCloseIconEl = document.getElementsByClassName("uploader__icon--close")[0];

							if (document.getElementsByClassName("video-preview")[0]) {
								artworkUploaderCloseIconEl && artworkUploaderCloseIconEl.classList.remove("right-0", "right-[8px]");
								artworkUploaderCloseIconEl &&
									artworkUploaderCloseIconEl.classList.add("block", "right-[8px]", "xs:right-[8px]", "sm:right-[8px]");
							}
						} else {
							if (file.type.includes("image")) {
								// Image type
								event.target.style.backgroundImage = `url('${reader.result as string}')`;
								event.target.style.backgroundSize = "cover";
								event.target.classList.add("min-h-[250px]");

								const artworkUploaderIconEl = document.getElementsByClassName("uploader__icon")[0];
								artworkUploaderIconEl && artworkUploaderIconEl.classList.add("hidden");
								const artworkUploaderCloseIconEl = document.getElementsByClassName("uploader__icon--close")[0];
								artworkUploaderCloseIconEl && artworkUploaderCloseIconEl.classList.add("block", "right-[8px]");
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
			const artworkUploaderEl = document.getElementsByClassName("artwork-uploader")[0] as HTMLElement;
			artworkUploaderEl.style.backgroundImage = artworkUploaderEl && "none";
			artworkUploaderEl.classList.add("min-h-[250px]");

			if (document.getElementsByClassName("video-preview")[0]) {
				artworkUploaderEl &&
					artworkUploaderEl.parentNode &&
					artworkUploaderEl.parentNode.removeChild(document.getElementsByClassName("video-preview")[0]);
			}

			const artworkUploaderIconEl = document.getElementsByClassName("uploader__icon")[0];
			artworkUploaderIconEl && artworkUploaderIconEl.classList.remove("hidden");

			const artworkUploaderCloseIconEl = document.getElementsByClassName("uploader__icon--close")[0];
			artworkUploaderCloseIconEl && artworkUploaderCloseIconEl.classList.remove("block");
		}
		fileUpdate(undefined!);
	};

	return (
		<div className="artwork-uploader__container">
			<input
				name="artwork_url"
				className="artwork-uploader"
				type="file"
				accept="image/gif, image/jpeg, image/jpg, image/png, video/mp4, video/quicktime"
				onChange={handleChangeArtwork}
			></input>
			<Icon className="uploader__icon" name="Image" size="64" color="#C6C6C6" />
			<Icon onClick={handleRemoveFile} className="uploader__icon--close" name="X" size="24" color="#C6C6C6" />
		</div>
	);
};

export default ArtworkUploader;
