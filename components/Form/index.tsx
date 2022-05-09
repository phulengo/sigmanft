/* eslint-disable @typescript-eslint/no-misused-promises */
import Router, { useRouter } from "next/router";
import { FormEvent, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SigmaNFT as ISigmaNFT, SigmaNFTMarketplace as ISigmaNFTMarketplace } from "typechain-types";
import ArtworkUploader from "components/ArtworkUploader";
import AvatarUploader from "components/AvatarUploader";
import { Button } from "components/Button";
import { MarketplaceContext } from "components/ContractProvider/MarketplaceProvider";
import { NFTContext } from "components/ContractProvider/NFTProvider";
import { Icon, IconWallet } from "components/Icon";
import { Input } from "components/Input";
import { Label } from "components/Label";
import { TextArea } from "components/TextArea";
import { checkUsernameExisted, updateUserProfile, uploadAvatar } from "pages/api/users/user";
import { IArtworkData, IArtworkProps, IUserData } from "lib/interfaces";
import { createNewArtwork } from "lib/ipfs";
import { compareObject } from "utils/compareObject";
import getRandomAvatarColorFromAddress from "utils/getRandomAvatarColorFromAddress";
import { handleLongWalletAddress } from "utils/handleLongWalletAddress";

interface IArtworkFormValidation {
	fileValidation: {
		state: string;
		description: string;
	};
	nameValidation: {
		state: string;
		description: string;
	};
	priceValidation: {
		state: string;
		description: string;
	};
}

export const CreateNewArtworkForm = () => {
	const [artwork, setArtwork] = useState<File>();
	const [formData, setFormData] = useState<IArtworkData>();
	const [formValidation, setFormValidation] = useState<IArtworkFormValidation>();
	const [isFormValidated, setIsFormValidated] = useState(false);
	const router = useRouter();

	const marketplace = useContext(MarketplaceContext);
	const nft = useContext(NFTContext);

	const handleFormChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...(formData as IArtworkData),
			[event.target.name]: event.target.value,
		});

		if (event.target.name === "artwork_name") {
			if (event.target.value === "") {
				setFormValidation({
					...(formValidation as IArtworkFormValidation),
					nameValidation: {
						state: "warning",
						description: "The artwork name must not be blank.",
					},
				});
			} else {
				setFormValidation({
					...(formValidation as IArtworkFormValidation),
					nameValidation: {
						state: "typing",
						description: "Typing",
					},
				});
			}
		}

		if (event.target.name === "price") {
			if (event.target.value === "" || +event.target.value === 0 || event.target.value.startsWith(".")) {
				setFormValidation({
					...(formValidation as IArtworkFormValidation),
					priceValidation: {
						state: "warning",
						description: "The artwork price must not be blank or zero or have invalid characters.",
					},
				});
			} else if (+event.target.value < 0) {
				setFormValidation({
					...(formValidation as IArtworkFormValidation),
					priceValidation: {
						state: "error",
						description: "The artwork price must not be a negative number.",
					},
				});
				// https://ethereum.stackexchange.com/questions/118896/can-an-erc-20-have-more-than-18-decimals
			} else if (event.target.value.includes(".") && event.target.value.split(".")[1].length > 18) {
				setFormValidation({
					...(formValidation as IArtworkFormValidation),
					priceValidation: {
						state: "error",
						description: "The price cannot have precision greater than 18 decimal places.",
					},
				});
			} else {
				setFormValidation({
					...(formValidation as IArtworkFormValidation),
					priceValidation: {
						state: "typing",
						description: "Typing",
					},
				});
			}
		}
	};

	const fileUpdate = (data: File) => {
		data ? setArtwork(data) : setArtwork(undefined);
		data
			? setFormValidation({
					...(formValidation as IArtworkFormValidation),
					fileValidation: {
						state: "uploaded",
						description: "File has been uploaded",
					},
			  })
			: setFormValidation({
					...(formValidation as IArtworkFormValidation),
					fileValidation: {
						state: "error",
						description: "No file is uploaded.",
					},
			  });
		return artwork;
	};

	const handleCreateNewArtwork = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		const tokenId = await marketplace?.itemCount();

		try {
			if (artwork) {
				if (typeof document !== "undefined") {
					(document.querySelector("button[type='submit']") as HTMLButtonElement).disabled = true;
					(document.querySelector("button[type='submit']") as HTMLButtonElement).classList.remove("btn-primary");
					(document.querySelector("button[type='submit']") as HTMLButtonElement).classList.add("btn-disabled");
				}

				const newItem =
					nft &&
					nft.signer &&
					marketplace &&
					marketplace.signer &&
					(await createNewArtwork(
						marketplace,
						nft,
						artwork,
						formData?.artwork_name as string,
						(formData?.artwork_description as string) || "",
						formData?.price as number,
						tokenId?.toNumber() as number
					));
				const newOwnerId =
					newItem &&
					(newItem as unknown as IArtworkData[]).length > 0 &&
					(newItem as unknown as IArtworkData[])[0].owner_id;
				const newArtworkId =
					newItem && (newItem as unknown as IArtworkData[]).length > 0 && (newItem as unknown as IArtworkData[])[0].id;
				void router.replace(`/${newOwnerId as string}/${newArtworkId as string}`);
			}
		} catch (error) {
			throw error;
		}
	};

	useEffect(() => {
		formValidation &&
		formValidation.fileValidation &&
		formValidation.nameValidation &&
		formValidation.priceValidation &&
		formValidation?.fileValidation.state !== null &&
		formValidation?.fileValidation.state !== "" &&
		formValidation?.fileValidation.state !== "error" &&
		formValidation?.fileValidation.state !== "warning" &&
		formValidation?.nameValidation.state !== null &&
		formValidation?.nameValidation.state !== "" &&
		formValidation?.nameValidation.state !== "error" &&
		formValidation?.nameValidation.state !== "warning" &&
		formValidation?.priceValidation.state !== null &&
		formValidation?.priceValidation.state !== "" &&
		formValidation?.priceValidation.state !== "error" &&
		formValidation?.priceValidation.state !== "warning"
			? setIsFormValidated(true)
			: setIsFormValidated(false);
	}, [formValidation, artwork, isFormValidated]);

	return (
		<>
			<div className="form__container">
				<form onSubmit={handleCreateNewArtwork}>
					<div className="form-header">
						<h1>Create New Artwork</h1>
						<hr />
					</div>
					<div className="form-group">
						<Label size="text-body">Media file</Label>
						<span className="sub-label">File types supported: .GIF, .JPEG, .PNG, .MP4, .MOV. Max size: 250 MB</span>
						<ArtworkUploader fileUpdate={fileUpdate} />
					</div>
					<div className="form-group">
						<Label size="text-body">Artwork name</Label>
						<span className="sub-label">Examples: XXX, YYY, ZZZ</span>
						<Input
							name="artwork_name"
							type="text"
							required
							onChange={handleFormChange}
							placeholder="Provide a name of your artwork"
						/>
						{formValidation &&
							formValidation.nameValidation &&
							(formValidation.nameValidation.state === "error" ? (
								<span className={`label-error`}>{formValidation.nameValidation.description}</span>
							) : formValidation.nameValidation.state === "warning" ? (
								<span className={`label-warning`}>{formValidation.nameValidation.description}</span>
							) : (
								<></>
							))}
					</div>
					<div className="form-group">
						<Label optional size="text-body">
							Description
						</Label>
						<span className="sub-label">Examples: XXX, YYY, ZZZ</span>
						<TextArea
							name="artwork_description"
							required={false}
							onChange={handleFormChange}
							placeholder="Provide a detail description of your artwork"
						/>
					</div>
					<div className="form-group">
						<Label size="text-body">Price (ETH)</Label>
						<span className="sub-label">Examples: 0.1, 1.0, 10.0</span>
						{/* TODO: Regex for currency */}
						<div className="input__suffix-icon">
							<Input
								name="price"
								type="number"
								min={0.001}
								step={0.001}
								required
								onChange={handleFormChange}
								placeholder="0.00"
							/>
							<IconWallet className="suffix-icon" size="32" name="ethereum" />
						</div>
						{formValidation &&
							formValidation.priceValidation &&
							(formValidation.priceValidation.state === "error" ? (
								<span className={`label-error`}>{formValidation.priceValidation.description}</span>
							) : formValidation.priceValidation.state === "warning" ? (
								<span className={`label-warning`}>{formValidation.priceValidation.description}</span>
							) : (
								<></>
							))}
					</div>
					<div className="flex flex-col gap-2">
						<hr />
						<span className="flex justify-between">
							<p>Service Fee</p>
							<p>1%</p>
						</span>
					</div>
					<Button
						type="submit"
						disabled={!isFormValidated ? true : false}
						className={`${isFormValidated ? "btn-primary" : "btn-disabled"}`}
					>
						Create & sell artwork
					</Button>
				</form>
			</div>
		</>
	);
};

interface IProfileValidation {
	usernameValidation: {
		state: string;
		description: string;
	};
	emailValidation: {
		state: string;
		description: string;
	};
}

export const EditUserProfileForm = ({ userData }: any) => {
	const [avatar, setAvatar] = useState<File>();
	const [editUserFormData, setEditUserFormData] = useState<IUserData>(userData as IUserData);
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [formValidation, setFormValidation] = useState<IProfileValidation>();
	const router = useRouter();

	const fileUpdate = (data: File) => {
		if (data === null) {
			setAvatar(null!);
			editUserFormData.avatar_url = JSON.stringify(getRandomAvatarColorFromAddress(editUserFormData.id as string));
		} else {
			setAvatar(data);
		}
		return avatar;
	};

	const fileUpload = async () => {
		if (avatar) {
			try {
				const avatarUrl = await uploadAvatar(avatar, editUserFormData.id as string);
				editUserFormData.avatar_url = avatarUrl;
			} catch (error) {
				throw new Error("Avatar upload error!");
			}
		} else if (avatar === null) {
			editUserFormData.avatar_url = JSON.stringify(getRandomAvatarColorFromAddress(editUserFormData.id as string));
		}
	};

	const handleFormChange = async (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		if (event.target.name === "profile_name") {
			setEditUserFormData({
				...editUserFormData,
				name: event.target.value,
			});
		}

		if (event.target.name === "profile_username") {
			setEditUserFormData({
				...editUserFormData,
				username: event.target.value.trim() === "" ? null! : `@${event.target.value}`,
			});

			const usernameCheckResult = await checkUsernameExisted(`@${event.target.value.trim()}`);
			if (event.target.value.trim() !== "") {
				if (!usernameCheckResult) {
					setFormValidation({
						...(formValidation as IProfileValidation),
						usernameValidation: {
							state: "success",
							description: "Username is available.",
						},
					});
				} else if (`@${event.target.value.trim()}` === (userData as IUserData).username) {
					setFormValidation({
						...(formValidation as IProfileValidation),
						usernameValidation: {
							state: "loaded",
							description: "Loaded",
						},
					});
				} else {
					setFormValidation({
						...(formValidation as IProfileValidation),
						usernameValidation: {
							state: "error",
							description: "Username has existed. Please try again.",
						},
					});
				}
			}
		}

		if (event.target.name === "profile_email") {
			setEditUserFormData({
				...editUserFormData,
				email: event.target.value,
			});

			const emailRegex =
				/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
			const emailRegexCheck = event.target.value.match(emailRegex);

			if (event.target.value !== "") {
				if (!emailRegexCheck) {
					setFormValidation({
						...(formValidation as IProfileValidation),
						emailValidation: {
							state: "error",
							description: "Invalid email format. Please try again.",
						},
					});
				} else if (event.target.value === (userData as IUserData).email) {
					setFormValidation({
						...(formValidation as IProfileValidation),
						emailValidation: {
							state: "loaded",
							description: "Loaded",
						},
					});
				} else {
					setFormValidation({
						...(formValidation as IProfileValidation),
						emailValidation: {
							state: "success",
							description: "Email is valid.",
						},
					});
				}
			} else if (event.target.value === "") {
				setEditUserFormData({
					...editUserFormData,
					email: null!,
				});
				setFormValidation({
					...(formValidation as IProfileValidation),
					emailValidation: {
						state: "null",
						description: "Null",
					},
				});
			}
		}

		if (event.target.name === "profile_bio") {
			setEditUserFormData({
				...editUserFormData,
				bio: event.target.value,
			});
		}

		if (event.target.name === "links_facebook") {
			setEditUserFormData({
				...editUserFormData,
				social_facebook: event.target.value,
			});
		}

		if (event.target.name === "links_twitter") {
			setEditUserFormData({
				...editUserFormData,
				social_twitter: event.target.value,
			});
		}

		if (event.target.name === "links_website") {
			setEditUserFormData({
				...editUserFormData,
				social_website: event.target.value,
			});
		}
	};

	const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await fileUpload();
		await updateUserProfile(editUserFormData);
		router.reload();
	};

	useEffect(() => {
		if (compareObject(editUserFormData, userData as object) && typeof avatar === "undefined") {
			setIsFormValidated(false);
		} else {
			if (
				(formValidation && formValidation.usernameValidation && formValidation.usernameValidation.state === "error") ||
				(formValidation && formValidation.emailValidation && formValidation.emailValidation.state === "error")
			) {
				setIsFormValidated(false);
			} else {
				setIsFormValidated(true);
			}
		}
	}, [editUserFormData, formValidation, avatar]);
	return (
		<>
			<div className="form__container">
				<form onSubmit={handleUpdateProfile}>
					<div className="form-header">
						<h1>Edit Profile</h1>
						<hr />
					</div>
					<div className="form-group">
						<Label optional size="text-body">
							Name
						</Label>
						<span className="sub-label">Examples: XXX, YYY, ZZZ</span>
						<Input
							value={editUserFormData.name}
							type="text"
							name="profile_name"
							required={false}
							onChange={handleFormChange}
							placeholder="Provide your name"
						/>
					</div>
					<div className="form-group">
						<Label optional size="text-body">
							Username
						</Label>
						<span className="sub-label">Examples: xxx, yyy, zzz</span>
						<div className="input__prefix-icon">
							<Input
								value={editUserFormData.username?.replace("@", "")}
								type="text"
								name="profile_username"
								required={false}
								onChange={handleFormChange}
								placeholder="username"
							/>
							<div className="prefix-icon">
								<Icon name="AtSign" size="16" color="#717171" />
							</div>
						</div>
						{formValidation &&
							formValidation.usernameValidation &&
							(formValidation.usernameValidation.state === "success" ? (
								<span className={`label-success`}>{formValidation.usernameValidation.description}</span>
							) : formValidation.usernameValidation.state === "error" ? (
								<span className={`label-error`}>{formValidation.usernameValidation.description}</span>
							) : null)}
					</div>
					<div className="form-group">
						<Label optional size="text-body">
							Email
						</Label>
						<span className="sub-label">Examples: xyz@xyz.com</span>
						<Input
							value={editUserFormData.email}
							type="email"
							name="profile_email"
							required={false}
							onChange={handleFormChange}
							placeholder="Provide your email"
						/>
						{formValidation &&
							formValidation.emailValidation &&
							(formValidation.emailValidation.state === "success" ? (
								<span className={`label-success`}>{formValidation.emailValidation.description}</span>
							) : formValidation.emailValidation.state === "error" ? (
								<span className={`label-error`}>{formValidation.emailValidation.description}</span>
							) : null)}
					</div>
					<div className="form-group">
						<Label optional size="text-body">
							Bio
						</Label>
						<span className="sub-label">Examples: More information about you</span>
						<TextArea
							value={editUserFormData.bio}
							name="profile_bio"
							required={false}
							onChange={handleFormChange}
							placeholder="Provide your extra information in bio"
						/>
					</div>
					<div className="form-group">
						<Label optional size="text-body">
							Social links
						</Label>
						<span className="sub-label">Examples: facebook, twitter, website</span>
						<div className="input__prefix-icon">
							<Input
								value={editUserFormData.social_facebook}
								type="text"
								name="links_facebook"
								required={false}
								onChange={handleFormChange}
								placeholder="username"
							/>
							<div className="prefix-icon">
								<Icon name="Facebook" size="16" color="#717171" />
							</div>
						</div>
						<div className="input__prefix-icon">
							<Input
								value={editUserFormData.social_twitter}
								type="text"
								name="links_twitter"
								required={false}
								onChange={handleFormChange}
								placeholder="username"
							/>
							<div className="prefix-icon">
								<Icon name="Twitter" size="16" color="#717171" />
							</div>
						</div>
						<div className="input__prefix-icon">
							<Input
								value={editUserFormData.social_website}
								type="text"
								name="links_website"
								required={false}
								onChange={handleFormChange}
								placeholder="example.com"
							/>
							<div className="prefix-icon">
								<Icon name="Globe" size="16" color="#717171" />
							</div>
						</div>
					</div>
					<div className="form-group">
						<Label optional size="text-body">
							Avatar
						</Label>
						<span className="sub-label">Recommended size: 150x150</span>
						<AvatarUploader value={editUserFormData.avatar_url} fileUpdate={fileUpdate} />
					</div>
					<div className="form-group">
						<Label optional optionalText="Read-only" size="text-body">
							Wallet address
						</Label>
						<div className="input__suffix-icon">
							<Input
								value={handleLongWalletAddress(editUserFormData.id as string, 7, 14)}
								className="input--disabled"
								type="disabled"
								required={false}
								onChange={() => false}
							/>
							<Icon
								onClick={() =>
									toast.promise(navigator.clipboard.writeText(editUserFormData.id as string), {
										loading: "Copying wallet address",
										success: "Wallet address copied",
										error: "Error copying wallet address",
									})
								}
								className={"hover:cursor-pointer"}
								size="16"
								name="Copy"
								color="#717171"
								strokeWidth={2}
							/>
						</div>
					</div>
					<hr />
					<Button
						type="submit"
						disabled={isFormValidated ? false : true}
						className={isFormValidated ? "btn-primary" : "btn-disabled"}
					>
						Save changes
					</Button>
				</form>
			</div>
		</>
	);
};
