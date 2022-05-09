import { useContext } from "react";
import { useAccount } from "wagmi";
import { Footer } from "components/Footer";
import { CreateNewArtworkForm } from "components/Form";
import Header from "components/Header";
import { MetaTags } from "components/MetaTags";
import { UserContext } from "components/UserProvider";

const CreateNewArtworkPage = () => {
	const currentUser = useContext(UserContext);
	const [{ data: accountData }] = useAccount({
		fetchEns: true,
	});

	return (
		<>
			<MetaTags title="Create New Artwork on SigmaNFT | SigmaNFT" />
			<Header />
			<main>{currentUser && accountData ? <CreateNewArtworkForm /> : <div>Please log in</div>}</main>
			<Footer />
		</>
	);
};

export default CreateNewArtworkPage;
