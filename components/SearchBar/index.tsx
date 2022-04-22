import { useEffect } from "react";
import { Icon } from "components/Icon";
import { Input } from "components/Input";

export const SearchBar = () => {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event.target.value);
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
		<div className="search-bar">
			<div className="search-bar__icon">
				<Icon name="Search" size="32" color="#C6C6C6" />
			</div>
			<Input
				className="search-bar__field"
				name="search-bar"
				type="search"
				required={false}
				onChange={handleChange}
				placeholder="Search Sigmanft..."
			/>
		</div>
	);
};
