/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BigNumber, BigNumberish, ethers } from "ethers";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useContext, useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { SigmaNFT as ISigmaNFT, SigmaNFTMarketplace as ISigmaNFTMarketplace } from "typechain-types";
import { ArtworkCard } from "components/ArtworkCard";
import { Button } from "components/Button";
import { Checkbox } from "components/Checkbox";
import { MarketplaceContext } from "components/ContractProvider/MarketplaceProvider";
import Header from "components/Header";
import { MetaTags } from "components/MetaTags";
import { IArtworkData, IArtworkItemData, IArtworkProps, IMetaData, IUserData, IUserProps } from "lib/interfaces";
import { NFTContext } from "components/ContractProvider/NFTProvider";
import {
	filterAvailabilityArtworks,
	filterTypeArtworks,
	getAllArtworks,
	getFeaturedArtwork,
	searchArtworksByName,
	sortArtworks,
} from "./api/artworks/artwork";
import { Label } from "components/Label";
import { getAllUsers, searchProfilesByNameOrUsername, sortProfiles } from "./api/auth/user";
import { ProfileCard } from "components/ProfileCard";
import { Select } from "components/Select";
import { SearchBar } from "components/SearchBar";
import Modal from "components/Modal";
import { Icon, IconWallet } from "components/Icon";
import { Input } from "components/Input";
import { RadioInput } from "components/RadioInput";
import { Footer } from "components/Footer";

export const getServerSideProps: GetServerSideProps = async (props: any) => {
	const { data: artworksData } = await getAllArtworks();
	const { data: profilesData } = await getAllUsers();
	const { query } = props;
	const searchKeyWordsData = query && (query?.keywords as string);
	const { data: searchArtworksData } = await searchArtworksByName(searchKeyWordsData);

	const { data: searchProfilesData } = await searchProfilesByNameOrUsername(searchKeyWordsData);

	return {
		props: {
			artworksData: searchKeyWordsData ? (searchArtworksData ? searchArtworksData : []) : artworksData,
			profilesData: searchKeyWordsData ? (searchProfilesData ? searchProfilesData : []) : profilesData,
			searchKeyWordsData: searchKeyWordsData || "",
		},
	};
};

const ExplorePage: NextPage = ({ artworksData, profilesData, searchKeyWordsData }: any) => {
	const [loading, setLoading] = useState(true);
	const [artworks, setArtworks] = useState<IArtworkProps>(artworksData);
	!artworks && setArtworks(artworksData);

	const [profiles, setProfiles] = useState<IUserProps>(profilesData);
	!profiles && setProfiles(profilesData);

	const searchKeyWords = searchKeyWordsData as string;

	useEffect(() => {
		setArtworks(artworksData);
		setProfiles(profilesData);
	}, [artworksData, profilesData]);

	const router = useRouter();

	const [items, setItems] = useState<IArtworkItemData[]>();
	const marketplace = useContext(MarketplaceContext);
	const nft = useContext(NFTContext);

	const [showFilterModal, setShowFilterModal] = useState(false);

	const artworkSortOptions = ["All artworks", "Date: Oldest", "Date: Newest", "Price: Highest", "Price: Lowest"];
	const profileSortOptions = ["All profiles", "Date joined: Oldest", "Date joined: Newest"];
	const [tabSelect, setTabSelect] = useState(0);

	const [showPriceRangeFilter, setShowPriceRangeFilter] = useState(false);
	const [showAvailabilityFilter, setShowAvailabilityFilter] = useState(false);
	const [showTypeFilter, setShowTypeFilter] = useState(false);
	const [showProfileTypeFilter, setShowProfileTypeFilter] = useState(false);
	const [sortOptions, setSortOptions] = useState({
		artworkSortBy: "",
		profileSortBy: "",
	});

	// interface IArtworksFilterForm {
	// 	minPrice: number;
	// 	maxPrice: number;
	// }

	const [filterFormData, setFilterFormData] = useState({
		minPrice: 0,
		maxPrice: 999999999999,
		availability: "all",
		type: "all",
	});

	const handleSetRangeArtworks = async () => {
		if (tabSelect == 0) {
			const { data: newSortArtworksData } = await sortArtworks(searchKeyWords, sortOptions?.artworkSortBy);
			const filterResults =
				newSortArtworksData &&
				(newSortArtworksData as unknown as IArtworkData[]).filter(
					(artwork: IArtworkData) =>
						artwork.price >= filterFormData.minPrice && artwork.price <= filterFormData.maxPrice
				);
			setArtworks(filterResults as unknown as IArtworkProps);
		}
	};

	const handleFilterFormChange = async (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		if (event.target.name === "min-price") {
			setFilterFormData({
				...filterFormData,
				minPrice: +event.target.value,
			});
		}
		if (event.target.name === "max-price") {
			setFilterFormData({
				...filterFormData,
				maxPrice: +event.target.value,
			});
		}
		if (event.target.name === "availability-filter") {
			setFilterFormData({
				...filterFormData,
				availability: event.target.value,
			});

			const { data: newFilterArtworksData } = await filterAvailabilityArtworks(
				searchKeyWords,
				sortOptions.artworkSortBy,
				event.target.value
			);
			newFilterArtworksData && setArtworks(newFilterArtworksData as unknown as IArtworkProps);
		}

		if (event.target.name === "artworks-type-filter") {
			setFilterFormData({
				...filterFormData,
				type: event.target.value,
			});

			if ((event.target as HTMLInputElement).checked === false) {
				const { data: newFilterArtworksData } = await filterTypeArtworks(searchKeyWords, sortOptions.artworkSortBy, "");
				newFilterArtworksData && setArtworks(newFilterArtworksData as unknown as IArtworkProps);
			} else {
				const { data: newFilterArtworksData } = await filterTypeArtworks(
					searchKeyWords,
					sortOptions.artworkSortBy,
					event.target.value
				);
				newFilterArtworksData && setArtworks(newFilterArtworksData as unknown as IArtworkProps);
			}
		}
	};

	const handleApplyFilter = (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		setShowFilterModal(false);
	};

	const handleSortChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (tabSelect == 0) {
			const { data: newSortArtworksData } = await sortArtworks(searchKeyWords, event.target.value);
			setSortOptions({ ...sortOptions, artworkSortBy: event.target.value });
			newSortArtworksData && setArtworks(newSortArtworksData as unknown as IArtworkProps);
		} else if (tabSelect === 1) {
			const { data: newSortProfilesData } = await sortProfiles(searchKeyWords, event.target.value);
			setSortOptions({ ...sortOptions, profileSortBy: event.target.value });
			newSortProfilesData && setProfiles(newSortProfilesData as unknown as IUserProps);
		}
	};

	return (
		<>
			<MetaTags title="Sigmanft" description="Sigma NFT Marketplace" />
			<Header />
			<main>
				<SearchBar className="explore-search-bar" keyWords={searchKeyWords} />
				{searchKeyWords && <div className="mb-6">Search results for keywords: “{searchKeyWords}”</div>}
				<div className="explore__container">
					<Tabs className={"tab__container"} onSelect={(index) => setTabSelect(index)}>
						<div className="select-group__headers">
							<div className="select-group">
								<span className="font-semi-bold">Sort by:</span>
								<Select required={false} name="select-sort" onChange={handleSortChange}>
									{tabSelect === 0
										? artworkSortOptions.map((option: string) => (
												<option
													key={option}
													value={option.toLocaleLowerCase().replaceAll(" ", "-").replaceAll(":", "")}
												>
													{option}
												</option>
										  ))
										: tabSelect === 1 &&
										  profileSortOptions.map((option: string) => (
												<option
													key={option}
													value={option.toLocaleLowerCase().replaceAll(" ", "-").replaceAll(":", "")}
												>
													{option}
												</option>
										  ))}
								</Select>
							</div>
							<TabList className={"tab__headers"}>
								<Tab className={"tab__headers--content"}>
									Artworks <span className="content-numbers">({(artworks as unknown as []).length || 0})</span>
								</Tab>
								<Tab className={"tab__headers--content"}>
									Profiles <span className="content-numbers">({(profiles as unknown as []).length || 0})</span>
								</Tab>
							</TabList>
						</div>
						<TabPanel className={"tab__content"}>
							<div className="explore__filter mt-6">
								<div className="filter__container">
									<div className="filter-group">
										<div className="filter-group__label">
											<Label size="text-subtitle">Price range</Label>
											{showPriceRangeFilter ? (
												<Icon
													className="btn-icon"
													onClick={() => setShowPriceRangeFilter(!showPriceRangeFilter)}
													name="Minus"
													size="24"
												/>
											) : (
												<Icon
													className="btn-icon"
													onClick={() => setShowPriceRangeFilter(!showPriceRangeFilter)}
													name="Plus"
													size="24"
												/>
											)}
										</div>
										{showPriceRangeFilter && (
											<div className="flex flex-col gap-6">
												<div className="flex flex-auto gap-4">
													<div className="input__suffix-icon w-full">
														<Input
															name="min-price"
															type="number"
															min={0.001}
															step={0.001}
															required
															onChange={handleFilterFormChange}
															placeholder="0.00"
														/>
														<IconWallet className="suffix-icon" size="24" name="ethereum" />
													</div>
													<div className="input__suffix-icon w-full">
														<Input
															name="max-price"
															type="number"
															min={0.001}
															step={0.001}
															required
															onChange={handleFilterFormChange}
															placeholder="0.00"
														/>
														<IconWallet className="suffix-icon" size="24" name="ethereum" />
													</div>
												</div>
												<Button onClick={handleSetRangeArtworks} className="btn-secondary">
													Set range
												</Button>
											</div>
										)}
									</div>
									<div className="filter-group">
										<div className="filter-group__label">
											<Label size="text-subtitle">Availability</Label>
											{showAvailabilityFilter ? (
												<Icon
													className="btn-icon"
													onClick={() => setShowAvailabilityFilter(!showAvailabilityFilter)}
													name="Minus"
													size="24"
												/>
											) : (
												<Icon
													className="btn-icon"
													onClick={() => setShowAvailabilityFilter(!showAvailabilityFilter)}
													name="Plus"
													size="24"
												/>
											)}
										</div>
										{showAvailabilityFilter && (
											<div className="flex flex-col gap-4">
												<RadioInput value="all" name="availability-filter" onChange={handleFilterFormChange}>
													<span>All</span>
												</RadioInput>
												<RadioInput value="available" name="availability-filter" onChange={handleFilterFormChange}>
													<span>Available</span>
												</RadioInput>
												<RadioInput value="sold" name="availability-filter" onChange={handleFilterFormChange}>
													<span>Sold</span>
												</RadioInput>
											</div>
										)}
									</div>
									<div className="filter-group">
										<div className="filter-group__label">
											<Label size="text-subtitle">Type</Label>
											{showTypeFilter ? (
												<Icon
													className="btn-icon"
													onClick={() => setShowTypeFilter(!showTypeFilter)}
													name="Minus"
													size="24"
												/>
											) : (
												<Icon
													className="btn-icon"
													onClick={() => setShowTypeFilter(!showTypeFilter)}
													name="Plus"
													size="24"
												/>
											)}
										</div>
										{showTypeFilter && (
											<div className="flex flex-col gap-4">
												<Checkbox value={"image"} name="artworks-type-filter" onChange={handleFilterFormChange}>
													<span>Image</span>
												</Checkbox>
												<Checkbox value={"video"} name="artworks-type-filter" onChange={handleFilterFormChange}>
													<span>Video</span>
												</Checkbox>
											</div>
										)}
									</div>
								</div>
							</div>
							{artworks ? (
								<div className="explore-artworks__container">
									{artworks && (artworks as unknown as IArtworkData[]).length > 0 ? (
										(artworks as unknown as []).map((artwork: IArtworkData) => (
											<ArtworkCard key={artwork.id} artworkData={artwork} />
										))
									) : (
										<div>No artworks found.</div>
									)}
								</div>
							) : (
								<ClipLoader />
							)}
						</TabPanel>
						<TabPanel className={"tab__content"}>
							<div className="explore__filter mt-6">
								<div className="filter__container">
									<div className="filter-group">
										<div className="filter-group__label">
											<Label size="text-subtitle">Type</Label>
											{showProfileTypeFilter ? (
												<Icon
													className="btn-icon"
													onClick={() => setShowProfileTypeFilter(!showProfileTypeFilter)}
													name="Minus"
													size="24"
												/>
											) : (
												<Icon
													className="btn-icon"
													onClick={() => setShowProfileTypeFilter(!showProfileTypeFilter)}
													name="Plus"
													size="24"
												/>
											)}
										</div>
										{showProfileTypeFilter && (
											<div className="flex flex-col gap-4">
												<Checkbox name="profile-type-filter" onChange={handleFilterFormChange}>
													<span>Creator</span>
												</Checkbox>
												<Checkbox name="profile-type-filter" onChange={handleFilterFormChange}>
													<span>Collector</span>
												</Checkbox>
												<Checkbox name="profile-type-filter" onChange={handleFilterFormChange}>
													<span>Other</span>
												</Checkbox>
											</div>
										)}
									</div>
								</div>
							</div>
							<div className="explore-profiles__container">
								{profiles && (profiles as unknown as IUserData[]).length > 0 ? (
									(profiles as unknown as []).map((profile: IUserData) => (
										<ProfileCard key={profile.id} profileData={profile} />
									))
								) : (
									<div>No profiles found.</div>
								)}
							</div>
						</TabPanel>
					</Tabs>
				</div>
				<Button onClick={() => setShowFilterModal(true)} className="btn__floating-filter btn-primary ">
					Filter
				</Button>
				{showFilterModal && tabSelect === 0 ? (
					<Modal onCancel={() => setShowFilterModal(false)} headerText={"Filters"}>
						<form className="filter__container" onSubmit={handleApplyFilter}>
							<div className="filter-group">
								<div className="filter-group__label">
									<Label size="text-subtitle">Price range</Label>
									{showPriceRangeFilter ? (
										<Icon onClick={() => setShowPriceRangeFilter(!showPriceRangeFilter)} name="Minus" size="24" />
									) : (
										<Icon onClick={() => setShowPriceRangeFilter(!showPriceRangeFilter)} name="Plus" size="24" />
									)}
								</div>
								{showPriceRangeFilter && (
									<div className="flex flex-auto gap-4">
										<div className="input__suffix-icon w-full">
											<Input
												name="min-price"
												type="number"
												min={0.001}
												step={0.001}
												required={false}
												onChange={handleFilterFormChange}
												placeholder="0.00"
											/>
											<IconWallet className="suffix-icon" size="24" name="ethereum" />
										</div>
										<div className="input__suffix-icon w-full">
											<Input
												name="max-price"
												type="number"
												min={0.001}
												step={0.001}
												required={false}
												onChange={handleFilterFormChange}
												placeholder="0.00"
											/>
											<IconWallet className="suffix-icon" size="24" name="ethereum" />
										</div>
									</div>
								)}
							</div>
							<div className="filter-group">
								<div className="filter-group__label">
									<Label size="text-subtitle">Availability</Label>
									{showAvailabilityFilter ? (
										<Icon onClick={() => setShowAvailabilityFilter(!showAvailabilityFilter)} name="Minus" size="24" />
									) : (
										<Icon onClick={() => setShowAvailabilityFilter(!showAvailabilityFilter)} name="Plus" size="24" />
									)}
								</div>
								{showAvailabilityFilter && (
									<div className="flex flex-col gap-4">
										<RadioInput name="availability-filter" onChange={handleFilterFormChange}>
											<span>All</span>
										</RadioInput>
										<RadioInput name="availability-filter" onChange={handleFilterFormChange}>
											<span>Available</span>
										</RadioInput>
										<RadioInput name="availability-filter" onChange={handleFilterFormChange}>
											<span>Sold</span>
										</RadioInput>
									</div>
								)}
							</div>
							<div className="filter-group">
								<div className="filter-group__label">
									<Label size="text-subtitle">Type</Label>
									{showTypeFilter ? (
										<Icon onClick={() => setShowTypeFilter(!showTypeFilter)} name="Minus" size="24" />
									) : (
										<Icon onClick={() => setShowTypeFilter(!showTypeFilter)} name="Plus" size="24" />
									)}
								</div>
								{showTypeFilter && (
									<div className="flex flex-col gap-4">
										<Checkbox value="image" name="artworks-type-filter" onChange={handleFilterFormChange}>
											<span>Image</span>
										</Checkbox>
										<Checkbox value="video" name="artworks-type-filter" onChange={handleFilterFormChange}>
											<span>Video</span>
										</Checkbox>
									</div>
								)}
							</div>
							<Button className="btn-primary">Apply filter</Button>
						</form>
					</Modal>
				) : (
					showFilterModal &&
					tabSelect === 1 && (
						<Modal onCancel={() => setShowFilterModal(false)} headerText={"Filters"}>
							<form className="filter__container" onSubmit={handleApplyFilter}>
								<div className="filter-group">
									<div className="filter-group__label">
										<Label size="text-subtitle">Type</Label>
										{showProfileTypeFilter ? (
											<Icon onClick={() => setShowProfileTypeFilter(!showProfileTypeFilter)} name="Minus" size="24" />
										) : (
											<Icon onClick={() => setShowProfileTypeFilter(!showProfileTypeFilter)} name="Plus" size="24" />
										)}
									</div>
									{showProfileTypeFilter && (
										<div className="flex flex-col gap-4">
											<Checkbox name="profile-type-filter" onChange={handleFilterFormChange}>
												<span>Creator</span>
											</Checkbox>
											<Checkbox name="profile-type-filter" onChange={handleFilterFormChange}>
												<span>Collector</span>
											</Checkbox>
											<Checkbox name="profile-type-filter" onChange={handleFilterFormChange}>
												<span>Other</span>
											</Checkbox>
										</div>
									)}
								</div>
								<Button className="btn-primary">Apply filter</Button>
							</form>
						</Modal>
					)
				)}
			</main>
			<Footer />
		</>
	);
};

export default ExplorePage;
