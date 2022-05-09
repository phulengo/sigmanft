import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { useConnect } from "wagmi";
import { Footer } from "components/Footer";
import { EditUserProfileForm } from "components/Form";
import Header from "components/Header";
import { MetaTags } from "components/MetaTags";
import { UserContext } from "components/UserProvider";

const EditProfilePage = () => {
	const user = useContext(UserContext);
	const [{ data: connector }] = useConnect();
	const router = useRouter();
	// useEffect(() => {
	// 	!user && router.push("/");
	// });
	return (
		<>
			<MetaTags
				title={`Edit ${user ? (user.username ? user.username : (user.id as string)) : ""}'s Profile`}
				description={`Edit ${user ? (user.username ? user.username : (user.id as string)) : ""}'s Profile`}
			/>
			<Header />
			<main>
				{user ? (
					<EditUserProfileForm userData={user} />
				) : (
					<div className="flex justify-center">
						<ClipLoader />
					</div>
				)}
			</main>
			<Footer />
		</>
	);
};
export default EditProfilePage;
