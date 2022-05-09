/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from "next/router";
import { FormEvent, SetStateAction, useEffect, useState } from "react";
import { Icon } from "components/Icon";
import { Input } from "components/Input";
type SearchBarProps = {
	className?: string;
	keyWords?: string;
	// setSearchKeyWordsSearchBar: (value: SetStateAction<string>) => void;
};

export const SearchBar = ({ className, keyWords }: SearchBarProps) => {
	const router = useRouter();
	const [searchKeyWords, setSearchKeyWords] = useState(keyWords || "");
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchKeyWords(event.target.value);
	};

	const handleSubmitSearch = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await router.push(`explore?keywords=${searchKeyWords}`);
	};

	useEffect(() => {
		setTimeout(() => {
			if (typeof document !== "undefined") {
				const searchBarIconEl = document.getElementsByClassName("search-bar__icon")[0];
				const searchBarFieldEl = document.getElementsByClassName("search-bar__field")[0];

				(searchBarFieldEl as HTMLInputElement).addEventListener("focusin", () => {
					searchBarIconEl.classList.add("search-bar__icon--focus");
				});

				(searchBarFieldEl as HTMLInputElement).addEventListener("focusout", () => {
					searchBarIconEl.classList.remove("search-bar__icon--focus");
				});
			}
		}, 1);
	}, []);

	return (
		<div className={`${className as string} search-bar`}>
			<div className="search-bar__icon">
				<Icon name="Search" size="32" color="#C6C6C6" />
			</div>
			<form onSubmit={handleSubmitSearch} className="w-full">
				<Input
					value={searchKeyWords}
					className="search-bar__field"
					name="search-bar"
					type="search"
					required={false}
					onChange={handleChange}
					placeholder="Search Sigmanft..."
				/>
			</form>
		</div>
	);
};
